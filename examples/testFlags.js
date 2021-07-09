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
    let result;
    await plm.clearBuffer();
    plm.emitter.on('command', command => {
//      console.log('command', command);
    });
    plm.startPolling(deviceNames);
    let command;
//    command = 'Programming Lock On';
//    command = 'Programming Lock Off';
//    command = 'LED Blink on Traffic On';
//    command = 'LED Blink on Traffic Off';
    command = 'Load Sense On (Bottom Outlet)';
//    command = 'Load Sense Off (Bottom Outlet)';
//    command = 'Load Sense On (Top Outlet)';
//    command = 'Load Sense Off (Top Outlet)';
//    command = 'LED Off';
//    command = 'LED On';
//    command = 'Keybeep On';
//    command = 'Keybeep Off';
//    command = 'RF Off';
//    command = 'RF On';
//    command = 'Powerline Off';
//    command = 'Powerline On';
//    command = 'X10 Off';
//    command = 'X10 On';
//    command = 'Error Blink Off';
//    command = 'Error Blink On';
//    command = 'Cleanup Report Off';
//    command = 'Cleanup Report On';
//    command = 'Smart Hops On';
//    command = 'Smart Hops Off';

    result = await plm.sendModemCommand({
      command,
      toAddress: '515454'
    });
    console.log(command);
    result = await plm.sendModemCommand({
      command: 'Get Operating Flags',
      toAddress: '515454'
    });
    console.log(result.command2, result.insteonCommand);
    result = await plm.sendModemCommand({
      command: 'Get Operating Flags 2',
      toAddress: '515454'
    });
    console.log(result.command2, result.insteonCommand);
    // console.log(plm.stopLogging());
    await plm.stopPolling();
  };

run();
