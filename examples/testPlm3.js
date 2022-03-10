'use strict'

const { createPlm } = require('../index')
const { encodeCommand } = require('../lib/encodeCommand')

const deviceNames = require('./deviceNames.json')

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

const plm = createPlm({
  username: process.env.HUB_USERNAME,
  password: process.env.HUB_PASSWORD,
  // host: 'insteon-hub',
  host: '192.168.1.110',
  port: 25105,
})

const sendModemCommand = async (modemCommand) => {
  const buffer = encodeCommand(modemCommand)
  await plm.sendDeviceControlCommand(buffer)
}

const run = async () => {
  await plm.clearBuffer()
  plm.emitter.on('command', async command => {
    console.log(command)
  })
  plm.startPolling(deviceNames)
  // plm.startLogging();
  // const hubInfo = await plm.getHubInfo();
  // console.log(hubInfo);
  // eslint-disable-next-line no-unused-vars
  const result = await sendModemCommand({
    command: 'Read ALL-Link Database',
    toAddress: '4A1AB6',
    address: '0FFF',
    numberRecords: 0,
  })
  await sleep(5500)
  // console.log(plm.stopLogging());
  await plm.stopPolling()
}

run()
