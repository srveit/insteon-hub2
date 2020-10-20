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
    plm.startPolling(deviceNames);
    // await sendModemCommand({
    //   command: 'Light Status LED Request',
    //   toAddress: '4A3A6F'
    // });
    // await sendModemCommand({
    //   command: 'Read 8 bytes from Database',
    //   address: '0000'
    // });
    // await sleep(1000);
    // await sendModemCommand({
    //   command: 'Read 8 bytes from Database',
    //   address: '0008'
    // });
    // await sleep(1000);
    await sendModemCommand({
      command: 'Read 8 bytes from Database',
      address: '0010'
    });
    await sleep(1000);
    await sendModemCommand({
      command: 'Beep'
    });
    await sleep(1000);
    await sendModemCommand({
      command: 'ON (Bottom Outlet)',
      onLevel: 23,
      toAddress: '4B2FC6'
    });
    await sleep(1000);
    await sendModemCommand({
      command: 'Get INSTEON Engine Version',
      toAddress: '4B2FC6'
    });
    await sleep(1000);
    const plmLog = plm.getLog();
    console.log('plmLog length', plmLog.length);
    console.log('"receivedAt","buffer","chunk"');
    for (const logEntry of plmLog) {
      const chunk = logEntry.chunk === undefined ? '' : logEntry.chunk;
      console.log(`"${logEntry.timestamp.toISOString()}","${logEntry.buffer}","${chunk}"`);
    }
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
