'use strict';

const EventEmitter = require('events'),
stream = require('stream'),
  util = require('util'),
  pipeline = util.promisify(stream.pipeline),
  { Transform, Writable } = stream,
{createPlmBase} = require('./plmBase'),
  {createPlmStream} = require('./plmStream'),
  {createPlmCommandStream} = require('./plmCommandStream'),
  {createCommandAnnotator} = require('./commandAnnotator'),
  encodeCommand = require('./encodeCommand'),

  createPlm = ({username, password, host, port, parsingLogger}) => {
    let plmStream;
    const plmBase = createPlmBase({username, password, host, port}),
      emitter = new EventEmitter(),
      commandHandlers = [],

      getHubStatus = async () => {
        const hubInfo = await plmBase.getHubInfo(),
          timeAndDay = await plmBase.getCurrentTimeAndDay(),
          linkStatus = await plmBase.getLinkStatus(),
          statusD = await plmBase.getStatusD(),
          hubStatus = {...hubInfo};

        hubStatus.day = timeAndDay.DAY;
        hubStatus.time = timeAndDay.FRT;
        hubStatus.cls = linkStatus.CLS;
        hubStatus.clsg = linkStatus.CLSG;
        hubStatus.clsi = linkStatus.CLSI;
        hubStatus.cds = statusD.CDS;
        return hubStatus;
      },

      createReporter = () => new Transform({
        writableObjectMode: true,
        readableObjectMode: true,

        transform(record, encoding, callback) {
          console.log(record);
          callback(null, record);
        }
      }),

      createEmitter = () => new Writable({
        objectMode: true,

        write(record, encoding, callback) {
          emitter.emit('command', record);
          callback(null);
        }
      }),

      readHub = async (deviceNames) => {
        try {
          plmStream = createPlmStream(plmBase),
          await pipeline(
            plmStream,
            createPlmCommandStream(),
            createCommandAnnotator(deviceNames),
            //         createReporter(),
            createEmitter()
          );
        } catch (e) {
          console.log('error', e);
          console.error(e);
        }
      },

      setUsernamePassword = (username, password) =>
        plmBase.setUsernamePassword(username, password),

      sendDeviceControlCommand = buffer =>
        plmBase.sendDeviceControlCommand(buffer),

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

      sendModemCommand = async (modemCommand) => {
        const buffer = encodeCommand(modemCommand),
          commandCode = buffer.substr(2, 2);
        return new Promise(async (resolve) => {
          let matcher, processor, edTerminator;
          const commands = [],
            responseMatcher = encodeCommand.responseMatchers[modemCommand.command],

            commandListener = modemCommand => (response) => {
              if (response.bytes.slice(0, buffer.length) === buffer) {
                resolve(response);
              }
            },
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

          // addCommandHandler(
          //   command => matcher(command),
          //   command => processor(command)
          // );
          matcher = ackMatcher;
          processor = ackProcessor;
          emitter.on('command', commandListener(modemCommand));
          await sendDeviceControlCommand(buffer);
        });
      },

      getLog = () => plmStream.getLog();

    return Object.freeze({
      clearBuffer: plmBase.clearBuffer,
      emitter,
      getHubStatus,
      getLog,
      readHub,
      sendDeviceControlCommand,
      sendModemCommand,
      setUsernamePassword
    });
  };

exports.createPlm = createPlm;
