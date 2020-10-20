'use strict';

const {Readable} = require('stream'),
  {createPlmBase} = require('./plmBase'),
  {createPlmBufferProcessor} = require('./plmBufferProcessor'),
  sleep = ms => new Promise(resolve => setTimeout(resolve, ms)),

  createPlmStream = (plmBase, pollingInterval = 50) => {
    let log = [],
      monitoring,
      monitor,
      logging = false;

    const chunks = [],

      monitorHubStatus = async () => {
        const plmBufferProcessor = createPlmBufferProcessor();

        monitoring = true;
        while (monitoring) {
          const buffer = await plmBase.getBuffer();
          const chunk =
            plmBufferProcessor.processPlmBuffer(buffer);
          if (logging) {
            log.push({buffer, chunk, timestamp: new Date()});
          }

          if (chunk) {
            readable.push(chunk);
          }
          await sleep(pollingInterval);
        }
      },

      read = () => {},

      destroy = (err, callback) => {
        monitoring = false;
        monitor.catch(er => callback(er));
        monitor.then(() => callback(err));
      },

      readable = new Readable({
        read,
        destroy,
        encoding: 'utf8'
      });

    readable.getLog = () => {
      const logSnapshot = log;
      log = [];
      return logSnapshot;
    };

    readable.stopMonitoring = () => {
      monitoring = false;
      readable.resume();
      readable.push(null);
      return monitor;
    };

    monitor = monitorHubStatus();

    return readable;
  };

exports.createPlmStream = createPlmStream;
