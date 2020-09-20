'use strict';

const {Readable} = require('stream'),
  {createPlmBase} = require('./plmBase'),
  {createPlmBufferProcessor} = require('./plmBufferProcessor'),
  sleep = ms => new Promise(resolve => setTimeout(resolve, ms)),

  createPlmStream = (plmBase, pollingInterval = 50) => {
    let destroyCallback,
      log = [];

    const chunks = [],

      monitorHubStatus = async () => {
        const plmBufferProcessor = createPlmBufferProcessor();

        while (!destroyCallback) {
          const buffer = await plmBase.getBuffer();
          const chunk =
            plmBufferProcessor.processPlmBuffer(buffer);
          log.push({buffer, chunk, timestamp: new Date()});

          if (chunk) {
            readable.push(chunk);
          }
          await sleep(pollingInterval);
        }
        destroyCallback();
      },

      read = () => {},

      destroy = (err, callback) => {
        destroyCallback = callback;
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

    monitorHubStatus();

    return readable;
  };

exports.createPlmStream = createPlmStream;
