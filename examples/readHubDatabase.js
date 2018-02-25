'use strict';
const util = require('util'),
  { createPlm } = require('./lib/plm'),
  deviceNames = {
    '49EA70': 'hub controller',
    
    '49C2B7': 'porch outlets',
    '4A0A08': 'Garage lights',
    '4A1AB6': 'foyer lamps switch',
    '4A209A': 'foyer chandelier switch',
    '4A3771': 'front lights',
    '4A3A6F': 'foyer chandelier',
    '4B2BA6': 'foyer lamps',
    '4B2D2C': 'dining outlet',
    '4B2FC6': 'Danny outlet',
    '4B2D2D': 'Steph outlet'
  };

const main = async () => {
  const plm = createPlm({
    username: process.env.HUB_USERNAME,
    password: process.env.HUB_PASSWORD,
    host: 'insteon-hub',
    port: 25105,
    deviceNames
  });
  await plm.start();

  const hubDatabase = await plm.readHubAllLinkDatabase(deviceNames);
  console.log('database info', util.inspect(hubDatabase.info(), {depth: null}));
  console.log('database links', util.inspect(hubDatabase.links(), {depth: null}));
  // await sleep(200);
  // await sendModemCommand({
  //   command: 'Get IM Configuration'
  // });
  // await sendModemCommand({
  //   command: 'Light Status On-Level Request',
  //   toAddress: '4A3A6F'
  // });
  // await sendModemCommand({
  //   command: 'Light Status LED Request',
  //   toAddress: '4A3A6F'
  // });
  // await sendModemCommand({
  //   command: 'Read ALL-Link Database',
  //   toAddress: '4A209A'
  // });
  // const reply = await sendModemCommand({
  //   command: 'Set Operating Flags',
  //   toAddress: '4B2BA6',
  //   flag: 'LED On'
  // });
//  console.log('reply', reply);
  // await sleep(500);
  // await sendModemCommand({
  //   command: 'Get Operating Flags',
  //   toAddress: '4B2BA6'
  // });
  // const result = await plm.sendModemCommand({
  //   command: 'Light Status LED Request',
  //   toAddress: '4A3A6F'
  // });
  // const result = await plm.sendModemCommand({
  //   command: 'Light ON',
  //   toAddress: '4B2BA6',
  //   onLevel: '80'
  // });
  let result;
  // result = await plm.sendModemCommand({
  //   command: 'FX Username Request',
  //   toAddress: '4B2BA6'
  // });
  // console.log('result', result);
  // result = await plm.sendModemCommand({
  //   command: 'Device Text String Request',
  //   toAddress: '4B2BA6'
  // });
  // console.log('result', result);
  // result = await plm.sendModemCommand({
  //   command: 'ALL-Link Alias 1 Low'
  // });
  // console.log('result', result);
  // await sendAllLinkCommand('11', 1);
  // result = await sendModemCommand({
  //   command: 'Send ALL-Link Command',
  //   groupNumber: 1,
  //   allLinkCommand: '12'
  // });
  // console.log('result', result);
  // await sendAllLinkCommand('11', 0);
  // await sleep(200);
  // result = await sendModemCommand({
  //   command: 'Cancel Cleanup'
  // });
  // console.log('result', result);
  // await sendAllLinkCommand('13', 182);
  // await sendAllLinkCommand('09', 137);
  // await sendAllLinkCommand('0A', 239);
  // await sendAllLinkCommand('08');
  // result = await plm.sendModemCommand({
  //   command: 'ID Request',
  //   toAddress: '4B2FC6'
  // });
  // console.log('result', result);
  // result = await plm.sendModemCommand({
  //   command: 'Read ALL-Link Database',
  //   toAddress: '4B2BA6'
  // });
  // result = await plm.sendModemCommand({
  //   command: 'Read ALL-Link Database',
  //   toAddress: '4B2FC6'
  // });
  // console.log('result', result);
  // result = await plm.sendModemCommand({
  //   command: 'Outlet ON',
  //   toAddress: '4B2FC6',
  //   outlet: 'bottom'
  // });
  // result = await plm.sendModemCommand({
  //   command: 'Product Data Request',
  //   toAddress: '4B2FC6'
  // });
  // console.log('result', result);
  // result = await plm.sendModemCommand({
  //   command: 'Outlet Status Request',
  //   toAddress: '4B2FC6'
  // });
  // console.log('result', result.insteonCommand);
  // result = await plm.sendModemCommand({
  //   command: 'Light ON',
  //   toAddress: '4A3A6F',
  //   onLevel: 'FF'
  // });
  // console.log('result', result);
  let database;
  // database = await plm.readDeviceAllLinkDatabase('4A3A6F', deviceNames);
  // console.log('database info', util.inspect(database.info(), {depth: null}));
  // console.log('database links', util.inspect(database.links(), {depth: null}));
};

main();
