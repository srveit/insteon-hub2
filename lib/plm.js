'use strict';
const request = require('request-promise'),
  {createPlmBufferParser} = require('./plmBufferParser'),
  {createAllLinkDatabase} = require('./allLinkDatabase'),
  encodeCommand = require('./encodeCommand'),


  createPlm = ({username, password, host, port, deviceNames}) => {
    let doMonitorHubStatus = true;
    const commandHandlers = [],
      sleep = ms => new Promise(resolve => setTimeout(resolve, ms)),

      authHeader = () => {
        const data = new Buffer(`${username}:${password}`),
          base64Data = data.toString('base64');
        return `Basic ${base64Data}`;
      },

      sendImRequest = async (command = '') => {
        const url = `http://${host}:${port}/${command}`;
        // if (command !== 'buffstatus.xml') {
        //   console.log('send', command);
        // }
        return request({
          headers: {
            Authorization: authHeader()
          },
          url: url
        });
      },

      clearBuffer = async () => sendImRequest('1?XB=M=1'),
      getLinkStatus = async () => sendImRequest('Linkstatus.xml'),

      toHex = (value = 0, length = 2) => value.toString(16)
        .padStart(length, '0').toUpperCase().substr(0, length),

      sendAllLinkCommand = async (command, groupNumber = 0) => {
        return await sendImRequest(`0?${command}${toHex(groupNumber)}=I=0`);
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

      getHubInfo = async () => {
        const response = await sendImRequest();
        return parseHubInfo(response);
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
        // if (!handled) {
        //   if (command.command !== 'X10 Received') {
        //     console.log('q', command);
        //   }
        // }
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

          await sendImRequest(`3?${buffer}=I=3`);
        });
      },

      monitorHubStatus = async () => {
        const plmBufferParser = createPlmBufferParser(deviceNames);

        doMonitorHubStatus = true;
        while (doMonitorHubStatus) {
          const newBuffer = await sendImRequest('buffstatus.xml');
          try {
            plmBufferParser.processPlmBuffer(newBuffer).map(handleCommand);
          } catch (error) {
            /* eslint no-console: "off" */
            console.warn(error);
          }
          await sleep(50);
        }
      },

      start = async () => {
        await clearBuffer();
        monitorHubStatus();
      },

      stop = () => {
        doMonitorHubStatus = false;
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
      createCommandHandler,
      readHubAllLinkDatabase,
      readDeviceAllLinkDatabase,
      encoders: encodeCommand.encoders,
      getLinkStatus
    });
  };

exports.createPlm = createPlm;
