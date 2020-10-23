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
    // await sendModemCommand({
    //   command: 'Get INSTEON Engine Version',
    //   toAddress: '4A3A6F'
    // });
    // const results = await sendModemCommand({
    //   command: 'Get IM Info'
    // });
    // await sendModemCommand({
    //   command: 'Get First ALL-Link Record'
    // });
    // await sleep(1000);
    // await sendModemCommand({
    //   command: 'Get Next ALL-Link Record'
    // });
    // await sleep(1000);
    await sendModemCommand({
      command: '7F Command',
      data: '02'
    });
    // console.log('results', results);
    // const plmLog = plm.getLog();
    // console.log('plmLog length', plmLog.length);
    // console.log('"receivedAt","buffer","chunk"');
    // for (const logEntry of plmLog) {
    //   const chunk = logEntry.chunk === undefined ? '' : logEntry.chunk;
    //   console.log(`"${logEntry.timestamp.toISOString()}","${logEntry.buffer}","${chunk}"`);
    // }
  };

run();
