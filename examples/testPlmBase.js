'use strict'

const stream = require('stream')
const util = require('util')
const pipeline = util.promisify(stream.pipeline)
const { Writable } = stream
const { createPlmBase } = require('../lib/plmBase')
const { createPlmStream } = require('../lib/plmStream')
const { createPlmCommandStream } = require('../lib/plmCommandStream')
const { createCommandAnnotator } = require('../lib/commandAnnotator')
const encodeCommand = require('../lib/encodeCommand')

const deviceNames = require('./deviceNames.json')

// eslint-disable-next-line no-unused-vars
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

const plmBase = createPlmBase({
  username: process.env.HUB_USERNAME,
  password: process.env.HUB_PASSWORD,
  // host: 'insteon-hub',
  host: '192.168.1.110',
  port: 25105,
})

const createReporter = () => new Writable({
  objectMode: true,

  write (record, encoding, callback) {
    console.log(record)
    callback(null)
  },
})

const sendModemCommand = async (modemCommand) => {
  const buffer = encodeCommand(modemCommand)
  await plmBase.sendDeviceControlCommand(buffer)
}

const readHub = async plmBase => {
  await pipeline(
    createPlmStream(plmBase),
    createPlmCommandStream(),
    createCommandAnnotator(deviceNames),
    createReporter()
  )
}

const run = async () => {
  await plmBase.clearBuffer()
  readHub(plmBase)
  // await sendModemCommand({
  //   command: 'Get IM Info'
  // });
  // await sleep(1000);
  await sendModemCommand({
    command: 'Light Status LED Request',
    toAddress: '4A3A6F',
  })
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
}

run()
