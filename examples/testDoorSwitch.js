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
    plm.emitter.on('command', async command => {
//      if (command.command === 'Database Record Found') {
      console.log(command);
      if (command.insteonCommand?.command === 'ALL-Link Cleanup Status Report' &&
         command.fromAddress === '45F77C') {
//        await sleep(10000);
        const result = await sendModemCommand({
          command: 'Read ALL-Link Database',
          toAddress: '45F77C',
          address: '0FFF',
          numberRecords: 0
        });
      }
//      }
    });
    plm.startPolling(deviceNames);
    // plm.startLogging();
    // const hubInfo = await plm.getHubInfo();
    // console.log(hubInfo);
    // const result = await sendModemCommand({
    //   command: 'Read ALL-Link Database',
    //   toAddress: '4A1AB6',
    //   address: '0FFF',
    //   numberRecords: 0
    // });
    // await sleep(5500);
    // console.log(plm.stopLogging());
//    await plm.stopPolling();
  };

run();