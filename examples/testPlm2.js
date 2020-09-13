'use strict';

const {createPlm} = require('../lib/plm2'),
  encodeCommand = require('../lib/encodeCommand'),

  deviceNames = require('./deviceNames.json'),

  sleep = ms => new Promise(resolve => setTimeout(resolve, ms)),

  plm = createPlm({
    username: process.env.HUB_USERNAME,
    password: process.env.HUB_PASSWORD,
    // host: 'insteon-hub',
    host: '192.168.1.110',
    port: 25105
  }),

  sendModemCommand = async (modemCommand) => {
    const buffer = encodeCommand(modemCommand);
    await plm.sendDeviceControlCommand(buffer);
  },

  run = async () => {
      await plm.clearBuffer();
      plm.emitter.on('command', command => {
        console.log('command', command);
      });
      plm.readHub(deviceNames);
      // await sendModemCommand({
      //   command: 'Light Status LED Request',
      //   toAddress: '4A3A6F'
      // });
    await sendModemCommand({
      command: 'Load Sense On (Bottom Outlet)',
      toAddress: '5151E1'
    });
    // await sleep(1000);
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
