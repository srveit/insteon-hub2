'use strict';
const util = require('util'),
  { createPlm } = require('../index'),
  deviceNames = {
    '123456': 'hub controller',
    '56789A': 'front lights',
    '789ABC': 'dining outlet'
  };

const main = async () => {
  const plm = createPlm({
    username: process.env.HUB_USERNAME,
    password: process.env.HUB_PASSWORD,
    host: 'insteon-hub',
    port: 25105,
    deviceNames
  });
  plm.addCommandHandler(() => true, command => console.log(command));
  await plm.start();
};

main();
