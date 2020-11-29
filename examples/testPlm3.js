'use strict';

const {createPlm} = require('../index'),
  {encodeCommand} = require('../lib/encodeCommand'),

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
    plm.startPolling(deviceNames);
    plm.startLogging();
    const hubInfo = await plm.getHubInfo();
    console.log(hubInfo);
    await sendModemCommand({
      command: 'Product Data Request',
      toAddress: '518AF7'
    });
    await sleep(3500);
    // console.log(plm.stopLogging());
    await plm.stopPolling();
  };

run();
