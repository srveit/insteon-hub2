'use strict';
const got = require('got').extend({
  handlers: [
    // Hack because the Insteon hub expects capitalized "Authorization" header
    (options, next) => {
      const headers = options.headers;
      headers.Authorization = headers.authorization;
      Reflect.deleteProperty(headers, 'authorization');
      return next(options);
    }
  ]
}),    
  {createPlmBufferParser} = require('./plmBufferParser'),
  {createAllLinkDatabase} = require('./allLinkDatabase'),
  {encodeCommand} = require('./encodeCommand'),

  createPlm = ({username, password, host, port, deviceNames, parsingLogger}) => {
    let doMonitorHubStatus = true,
      monitoringHubStatus = false;
    const commandHandlers = [],
      sleep = ms => new Promise(resolve => setTimeout(resolve, ms)),

      authHeader = () => {
        const data = Buffer.from(`${username}:${password}`),
          base64Data = data.toString('base64');
        return `Basic ${base64Data}`;
      },

      toHex = (value = 0, length = 2) => value.toString(16)
        .padStart(length, '0').toUpperCase().substr(0, length),

      sendImRequest = async (command = '') => {
        const url = `http://${host}:${port}/${command}`,
          response = await got(
            url,
            {
              headers: {
                Authorization: authHeader()
              }
            }
          );
        return response.body;
      },

      sendAllLinkCommand = async (command, groupNumber = 0) => {
        return await sendImRequest(`0?${command}${toHex(groupNumber)}=I=0`);
      },

      clearBuffer = () => sendImRequest('1?XB=M=1'),

      setUsernamePassword = (username, password) =>
        sendImRequest(`1?L=${username}=1=${password}`),

      // https://blog.automategreen.com/post/under-the-insteon-hub-hood/
      createScene = ({
        sceneNumber,
        sceneName,
        show
      }) => sendImRequest(`2?S${sceneNumber}=${sceneName}=2=${show ? 't' : 'f'}`),

      sendDeviceControlCommand = buffer => sendImRequest(`3?${buffer}=I=3`),

      // TODO:
      // This URL will get you all the device ids on room 1 in XML format
      // http://X.X.X.X:25105/b.xml?01=1=F
      getBs = async () => {
        const xml = await sendImRequest('b.xml');
        return xml.split('\n').reduce(
          (bs, line) => {
            const match = line.match(/^<S D="([ !#-~]+)"\/>$/);

            if (match) {
              bs.push(match[1]);
            }
            return bs;
          },
          []
        );
      },

      getBuffer = async () => {
        const bufferXml = await sendImRequest('buffstatus.xml'),
          match = bufferXml.match(/<BS>([0-9A-F]+)</);
        return match && match[1];
      },

      getHubInfo = async () => {
        const response = await sendImRequest('index.htm');
        return parseHubInfo(response);
      },

      getLinkStatus = async () => {
        const xml = await sendImRequest('Linkstatus.xml');
        return xml.split('\n').reduce(
          (linkStatus, line) => {
            const match = line.match(/^<([A-Z]+)>([ -;=-~]+)<\/[A-Z]+>$/);

            if (match) {
              linkStatus[match[1]] = match[2].trim();
            }
            return linkStatus;
          },
          {}
        );
      },

      getRstatus = async () => {
        const xml = await sendImRequest('rstatus.xml');
        return xml.split('\n').reduce(
          (status, line) => {
            const match = line.match(/^<([A-Z]+)>([ -;=-~]+)<\/[A-Z]+>$/);

            if (match) {
              status[match[1]] = match[2].trim();
            }
            return status;
          },
          {}
        );
      },

      getStatus = async () => {
        const xml = await sendImRequest('status.xml');
        return xml.split('\n').reduce(
          (status, line) => {
            const match = line.match(/^<([A-Z]+)>([ -;=-~]+)<\/[A-Z]+><([A-Z]+)>([ -;=-~]+)<\/[A-Z]+>$/);

            if (match) {
              status[match[1]] = match[2].trim();
              status[match[3]] = match[4].trim();
            }
            return status;
          },
          {}
        );
      },

      getRstatusD = async () => {
        const xml = await sendImRequest('statusD.xml');
        return xml.split('\n').reduce(
          (status, line) => {
            const match = line.match(/^<([A-Z]+)>([ -;=-~]+)<\/[A-Z]+>$/);

            if (match) {
              status[match[1]] = match[2].trim();
            }
            return status;
          },
          {}
        );
      },

      // https://blog.automategreen.com/post/under-the-insteon-hub-hood/
      sendInsteonCommandSync = async (deviceId, command) => {
        const bufferXml = await sendImRequest(`sx.xml?${deviceId}=${command}`),
          match = bufferXml.match(/<BS>([0-9A-F]+)</);
        return match && match[1];
      },

      parseHubInfo = response => {
        return response.split('\n').reduce(
          (hubInfo, line) => {
            let m;
            if ((m = line.match(/((Hub[0-9])-V[-0-9]+)/))) {
              hubInfo.binVersion = m[1];
              hubInfo.type = m[2];
            } else if ((m = line.match(/Firmware:([0-9]+) +Build ([ :a-zA-Z0-9]+)/))) {
              hubInfo.hubVersion = m[1];
              hubInfo.firmwareBuildDate = m[2];
            } else if ((m = line.match(/PLM Version:([ :a-zA-Z0-9]+)/))) {
              hubInfo.plmVersion = m[1];
            } else if ((m = line.match(/Insteon ID:([. :a-zA-Z0-9]+)/))) {
              hubInfo.deviceId = m[1].replace(/[.]/g, '');
            }
            return hubInfo;
          },
          {}
        );
      },

      createCommandHandler = (matches, processCommand) => command => {
        if (matches(command)) {
          return {
            consumed: true,
            finished: processCommand(command)
          };
        }
        return {
          consumed: false
        };
      },

      addCommandHandler = (matches, processCommand) => {
        const commandHandler = createCommandHandler(matches, processCommand);
        commandHandlers.unshift(commandHandler);
      },

      removeCommandHandler = commandHandler => {
        const index = commandHandlers.indexOf(commandHandler);
        if (index >= 0) {
          commandHandlers.splice(index, 1);
        }
      },

      handleCommand = command => {
        return commandHandlers.find(commandHandler => {
          const {consumed, finished} = commandHandler(command);
          if (finished) {
            removeCommandHandler(commandHandler);
          }
          return consumed;
        });
      },

      sendModemCommand = async (modemCommand) => {
        const buffer = encodeCommand(modemCommand),
          commandCode = buffer.substr(2, 2);
        return new Promise(async (resolve) => {
          let matcher, processor, edTerminator;
          const commands = [],

            ackMatcher = command => command.code === commandCode,
            directAckMatcher = command => command.code === '50',
            edMatcher = command => command.code === '51',

            edProcessor = command => {
              if (edTerminator) {
                commands.push(command);
                if (edTerminator(command)) {
                  resolve(commands);
                  return true;
                }
                return false;
              }
              resolve(command);
              return true;
            },

            directAckProcessor = command => {
              if (command.messageType === 'directAck' &&
                  command.insteonCommand &&
                  command.insteonCommand.edExpected) {
                matcher = edMatcher;
                processor = edProcessor;
                edTerminator = command.insteonCommand.edTerminator;
                return false;
              }
              resolve(command);
              return true;
            },

            ackProcessor = command => {
              if (!command.ack) {
                resolve();
                return true;
              }
              if (command.messageType === 'direct' ||
                  command.messageType === 'allLinkCleanup') {
                matcher = directAckMatcher;
                processor = directAckProcessor;
                return false;
              } else if (command.responseMatcher) {
                matcher = command.responseMatcher;
                processor = edProcessor;
                return false;
              }
              resolve(command);
              return true;
            };

          addCommandHandler(
            command => matcher(command),
            command => processor(command)
          );
          matcher = ackMatcher;
          processor = ackProcessor;

          await sendDeviceControlCommand(buffer);
        });
      },

      monitorHubStatus = async () => {
        const plmBufferParser =
          createPlmBufferParser(deviceNames, parsingLogger);

        doMonitorHubStatus = true;
        while (doMonitorHubStatus) {
          const buffer = await getBuffer();

          try {
            plmBufferParser.processPlmBuffer(buffer).map(handleCommand);
          } catch (error) {
            /* eslint no-console: "off" */
            console.warn(error);
          }
          await sleep(50);
        }
      },

      start = async () => {
        if (!monitoringHubStatus) {
          monitoringHubStatus = true;
          await clearBuffer();
          monitorHubStatus();
        }
      },

      stop = async () => {
        if (monitoringHubStatus) {
          doMonitorHubStatus = false;
          monitoringHubStatus = false;
          await sleep(100);
        }
      },

      readHubAllLinkDatabase = async () => {
        const hubDatabase = createAllLinkDatabase(deviceNames),
          hubInfo = await getHubInfo(),
          imInfo = await sendModemCommand({
            command: 'Get IM Info'
          });

        hubDatabase.addDeviceInfo({
          deviceId: imInfo.imId,
          deviceCategory: imInfo.deviceCategory,
          deviceSubcategory: imInfo.deviceSubcategory,
          firmware: imInfo.firmware,
          binVersion: hubInfo.binVersion,
          hubVersion: hubInfo.hubVersion,
          firmwareBuildDate: hubInfo.firmwareBuildDate
        });
        let rec = await sendModemCommand({
          command: 'Get First ALL-Link Record'
        });
        while (rec) {
          hubDatabase.addAllLinkRecord(rec);
          rec = await sendModemCommand({
            command: 'Get Next ALL-Link Record'
          });
        }
        return hubDatabase;
      },

      readDeviceAllLinkDatabase = async (deviceId) => {
        const database = createAllLinkDatabase(deviceNames),
          productData = await sendModemCommand({
            command: 'Product Data Request',
            toAddress: deviceId
          }),
          records = await sendModemCommand({
            command: 'Read ALL-Link Database',
            toAddress: deviceId
          });

        records.map(record => database.addAllLinkRecord(record.insteonCommand));
        database.addDeviceInfo({
          deviceId: deviceId,
          deviceName: productData.fromDevice,
          deviceCategory: productData.deviceCategory,
          deviceSubcategory: productData.deviceSubcategory,
          firmware: productData.firmware
        });
        return database;
      };

    return Object.freeze({
      start,
      stop,
      sendAllLinkCommand,
      sendModemCommand,
      addCommandHandler,
      readHubAllLinkDatabase,
      readDeviceAllLinkDatabase,
      removeCommandHandler,
      encoders: encodeCommand.encoders,
      getLinkStatus
    });
  };

exports.createPlm = createPlm;
