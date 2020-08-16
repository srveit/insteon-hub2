'use strict';

const stream = require('stream'),
  util = require('util'),
  pipeline = util.promisify(stream.pipeline),
  { Writable } = stream,
  {createPlmBase} = require('../lib/plmBase'),
  {createPlmStream} = require('../lib/plmStream'),
  {createPlmCommandStream} = require('../lib/plmCommandStream'),
  {createCommandAnnotator} = require('../lib/commandAnnotator'),
  encodeCommand = require('../lib/encodeCommand'),

  deviceNames = require('./deviceNames.json'),

  sleep = ms => new Promise(resolve => setTimeout(resolve, ms)),

  plmBase = createPlmBase({
    username: process.env.HUB_USERNAME,
    password: process.env.HUB_PASSWORD,
    // host: 'insteon-hub',
    host: '192.168.1.110',
    port: 25105
  }),

  createReporter = () => new Writable({
    objectMode: true,

    write(record, encoding, callback) {
      console.log(record);
      callback(null);
    }
  }),

  sendModemCommand = async (modemCommand) => {
    const buffer = encodeCommand(modemCommand);
    await plmBase.sendDeviceControlCommand(buffer);
  },

  readHub = async plmBase => {
    await pipeline(
      createPlmStream(plmBase),
      createPlmCommandStream(),
      createCommandAnnotator(deviceNames),
      createReporter()
    );
  },

  run = async () => {
    await plmBase.clearBuffer();
    readHub(plmBase);
    // await sendModemCommand({
    //   command: 'Get IM Info'
    // });
    // await sleep(1000);
    await sendModemCommand({
      command: 'Light Status LED Request',
      toAddress: '4A3A6F'
    });
    // await sleep(10);
    // await sendModemCommand({
    //   command: 'Product Data Request',
    //   toAddress: '49C2B7'
    // });
    // await sleep(10);
    // await sendModemCommand({
    //   command: 'Device Text String Request',
    //   toAddress: '49C2B7'
    // });
    // await sleep(10);
    // await plmBase.sendDeviceControlCommand('026249C2B70F0301');
  };

run();
