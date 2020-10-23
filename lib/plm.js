'use strict';

const EventEmitter = require('events'),
stream = require('stream'),
  util = require('util'),
  pipeline = util.promisify(stream.pipeline),
  { Transform, Writable } = stream,
  {createPlmBase} = require('./plmBase'),
  {createPlmStream} = require('./plmStream'),
  {createPlmCommandQueue} = require('./plmCommandQueue'),
  {createPlmCommandStream} = require('./plmCommandStream'),
  {createCommandAnnotator} = require('./commandAnnotator'),
  {encodeCommand, commandResponseMatcher} = require('./encodeCommand'),

  createPlm = ({username, password, host, port, parsingLogger}) => {
    let plmStream, plmPipeline;
    const plmBase = createPlmBase({username, password, host, port}),
      emitter = new EventEmitter(),

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

      createEmitter = () => new Writable({
        objectMode: true,

        write(record, encoding, callback) {
          emitter.emit('command', record);
          callback(null);
        }
      }),

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
          plmStream = undefined;
          return plmPipeline;
        }
        return Promise.resolve(undefined);
      },

      setUsernamePassword = (username, password) =>
        plmBase.setUsernamePassword(username, password),

      sendDeviceControlCommand = buffer => {
        return plmBase.sendDeviceControlCommand(buffer);
      },

      sendModemCommand = modemCommand => {
        const buffer = encodeCommand(modemCommand),
          commandCode = buffer.substr(2, 2),
          matcher = commandResponseMatcher(modemCommand);
        return plmCommandQueue.addCommand(buffer, matcher);
      },

      startLogging = () => plmStream && plmStream.startLogging(),

      stopLogging = () => plmStream && plmStream.stopLogging(),

      plmCommandQueue = createPlmCommandQueue(sendDeviceControlCommand);

    emitter.on('command', plmCommandQueue.handleResponse);

    return Object.freeze({
      clearBuffer: plmBase.clearBuffer,
      emitter,
      getHubStatus,
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
