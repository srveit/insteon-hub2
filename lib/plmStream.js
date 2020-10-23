'use strict';

const {Readable} = require('stream'),
  {createPlmBufferProcessor} = require('./plmBufferProcessor'),
  sleep = ms => new Promise(resolve => setTimeout(resolve, ms)),

  createPlmStream = (plmBase, pollingInterval = 50) => {
    let log = [],
      monitoring,
      monitor,
      startTime,
      logging = false;

    const chunks = [],

      monitorHubStatus = async () => {
        const plmBufferProcessor = createPlmBufferProcessor();

        startTime = (new Date()).valueOf();
        monitoring = true;
        while (monitoring) {
          try {
            const buffer = await plmBase.getBuffer();

            const chunk =
              plmBufferProcessor.processPlmBuffer(buffer);
            if (logging) {
              log.push({buffer, chunk, timestamp: new Date()});
            }

            if (chunk) {
              readable.push(chunk);
            }
          } catch (error) {
            if (logging) {
              log.push({error, timestamp: new Date()});
            }
          }
          await sleep(pollingInterval);
        }
      },

      read = () => {},

      destroy = (err, callback) => {
        monitoring = false;
        monitor.then(() => callback(err));
      },

      readable = new Readable({
        read,
        destroy,
        encoding: 'utf8'
      });

    readable.startLogging = () => {
      logging = true;
    };

    readable.stopLogging = () => {
      logging = false;
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
