'use strict'

const util = require('util')
const { createPlm } = require('../index')
const { createAllLinkDatabase } = require('../lib/allLinkDatabase.js')

const deviceNames = require('./deviceNames.json')

// eslint-disable-next-line no-unused-vars
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

const plm = createPlm({
  username: process.env.HUB_USERNAME,
  password: process.env.HUB_PASSWORD,
  // host: 'insteon-hub',
  host: '192.168.1.110',
  port: 25105,
})

const sendModemCommand = modemCommand => plm.sendModemCommand(modemCommand)

const testHubDatabase = async () => {
  const allLinkDatabase = createAllLinkDatabase()
  let address = 0x1ff8
  for (let i = 0; i < 54; i++) {
    const allLinkRecord = await sendModemCommand({
      command: 'Read 8 bytes from Database',
      address: address.toString(16).padStart(4, '0').toUpperCase(),
    })
    if (allLinkRecord.inUse) {
      allLinkDatabase.addAllLinkRecord(allLinkRecord)
    }
    // console.log('result', allLinkRecord);
    address -= 8
  }
  return allLinkDatabase.links()
}

// eslint-disable-next-line no-unused-vars
const testDeviceDatabase = async () => {
  const allLinkDatabase = createAllLinkDatabase()
  let address = 0x1ff8
  for (let i = 0; i < 54; i++) {
    const allLinkRecord = await sendModemCommand({
      command: 'Read ALL-Link Database',
      toAddress: '51560E',
      address: address.toString(16).padStart(4, '0').toUpperCase(),
    })
    if (allLinkRecord.inUse) {
      allLinkDatabase.addAllLinkRecord(allLinkRecord)
    }
    // console.log('result', allLinkRecord);
    address -= 8
  }
  return allLinkDatabase.links()
}

const run = async () => {
  await plm.clearBuffer()
  plm.emitter.on('command', command => {
    if (command.command === 'Database Record Found') {
      console.log(command)
    }
  })
  plm.startPolling(deviceNames)
  const allLinkDatabase = await testHubDatabase()
  await plm.stopPolling()
  console.log(util.inspect(allLinkDatabase.links(), { showHidden: false, depth: null }))
}

run()
