'use strict';
const util = require('util'),
  { createPlm } = require('../index'),
  deviceNames = require('./deviceNames.json');

async function readHubAllLinkDatabase(plm) {
  const database = [];
  let response = await plm.sendModemCommand({
    command: 'Get First ALL-Link Record'
  });
  while (response.ack !== false) {
    database.push(response);
    response = await plm.sendModemCommand({
      command: 'Get Next ALL-Link Record'
    });
  };
  return database;
}

const main = async () => {
  const plm = createPlm({
    username: process.env.HUB_USERNAME,
    password: process.env.HUB_PASSWORD,
    host: 'insteon-hub',
    port: 25105,
    deviceNames
  });
  plm.startPolling(deviceNames);

  const hubDatabase = await readHubAllLinkDatabase(plm);
  console.log(hubDatabase);
  await plm.stopPolling();
};

main();
