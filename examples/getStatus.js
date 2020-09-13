'use strict';
const util = require('util'),
  { createPlm } = require('../index'),
  deviceNames = require('./deviceNames.json');

const main = async () => {
  const plm = createPlm({
    username: process.env.HUB_USERNAME,
    password: process.env.HUB_PASSWORD,
    host: 'insteon-hub',
    port: 25105,
    deviceNames
  });
  await plm.start();

  let result;
  // result = await plm.sendModemCommand({
  //   command: 'Product Data Request',
  //   toAddress: '4A3A6F'
  // });
  // console.log('result', result);
  // result = await plm.sendModemCommand({
  //   command: 'Light Status LED Request',
  //   toAddress: '4A3A6F'
  // });
  // console.log('result', result);
  console.log('========');
  result = await plm.sendModemCommand({
    command: 'Get Operating Flags',
    toAddress: '515454'
  });
  console.log('result', result);
  // result = await plm.sendModemCommand({
  //   command: 'Light Status LED Request',
  //   toAddress: '515454'
  // });
  // console.log('result', result);
};

main();
