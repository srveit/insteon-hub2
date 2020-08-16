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
  plm.addCommandHandler(() => true, command => console.log(command));
  await plm.start();
};

main();
