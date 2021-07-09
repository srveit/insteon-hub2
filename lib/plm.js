'use strict';

const EventEmitter = require('events'),
  stream = require('stream'),
  util = require('util'),
  pipeline = util.promisify(stream.pipeline),
  {Writable} = stream,
  {createPlmBase} = require('./plmBase'),
  {createPlmStream} = require('./plmStream'),
  {createPlmCommandQueue} = require('./plmCommandQueue'),
  {createPlmCommandStream} = require('./plmCommandStream'),
  {createCommandAnnotator} = require('./commandAnnotator'),
  {encodeCommand, commandResponseMatcher} = require('./encodeCommand'),

  createPlm = ({username, password, host, port}) => {
    let plmStream, plmPipeline;
    const plmBase = createPlmBase({username, password, host, port}),
      emitter = new EventEmitter(),

      getHubInfo = () => plmBase.getHubInfo(),

      getHubStatus = () => plmBase.getHubStatus(),

      createEmitter = () => new Writable({
        objectMode: true,

        write(record, encoding, callback) {
          emitter.emit('command', record);
          callback(null);
        }
      }),

      sendDeviceControlCommand = buffer => {
        return plmBase.sendDeviceControlCommand(buffer);
      },

      plmCommandQueue = createPlmCommandQueue(sendDeviceControlCommand),

      startPolling = deviceNames => {
        plmStream = createPlmStream(plmBase);
        plmPipeline = pipeline(
          plmStream,
          createPlmCommandStream(),
          createCommandAnnotator(deviceNames),
          createEmitter()
        );
      },

      stopPolling = async () => {
        if (plmStream) {
          plmStream.stopMonitoring();
          /* eslint no-undefined: "off" */
          plmStream = undefined;
          return plmPipeline;
        }
        return Promise.resolve(undefined);
      },

      setUsernamePassword = (newUsername, newPassword) =>
        plmBase.setUsernamePassword(newUsername, newPassword),

      sendModemCommand = modemCommand => {
        const buffer = encodeCommand(modemCommand),
          matcher = commandResponseMatcher(modemCommand);
        return plmCommandQueue.addCommand(buffer, matcher);
      },

      startLogging = () => plmStream && plmStream.startLogging(),

      stopLogging = () => plmStream && plmStream.stopLogging();

    emitter.on('command', plmCommandQueue.handleResponse);

    return Object.freeze({
      clearBuffer: plmBase.clearBuffer,
      emitter,
      getHubStatus,
      getHubInfo,
      startLogging,
      stopLogging,
      startPolling,
      stopPolling,
      sendDeviceControlCommand,
      sendModemCommand,
      setUsernamePassword
    });
  };

exports.createPlm = createPlm;
