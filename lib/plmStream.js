'use strict';

const {Readable} = require('stream'),
  {createPlmBase} = require('./plmBase'),
  {createPlmBufferProcessor} = require('./plmBufferProcessor'),
  sleep = ms => new Promise(resolve => setTimeout(resolve, ms)),

  createPlmStream = ({username, password, host, port, pollingInterval = 50}) => {
    let monitoring = true;

    const chunks = [],
      plmBase = createPlmBase({username, password, host, port}),

      monitorHubStatus = async () => {
        const plmBufferProcessor = createPlmBufferProcessor();
        let loop = 0;
        while (monitoring) {
          loop++;
          const buffer = await plmBase.getBuffer(),
            segment = plmBufferProcessor.processPlmBuffer(buffer);

          if (segment) {
            chunks.push(buffer);
          }
          await sleep(pollingInterval);
        }
      },

      read = async size => {
        let reading;
        do {
          if (chunks.length > 0) {
            reading = readable.push(chunks.shift());
          } else {
            sleep(pollingInterval);
          }
        } while(reading);
      },

      destroy = (err, callback) => {
        monitoring = false;
        callback();
      },

      readable = new Readable({
        read,
        destroy
      });

    monitorHubStatus();
    return readable;
  };

exports.createPlmStream = createPlmStream;
