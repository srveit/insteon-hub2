'use strict'

const { createPlm } = require('../index')
// eslint-disable-next-line no-unused-vars
const { encodeCommand } = require('../lib/encodeCommand')

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

const run = async () => {
  await plm.clearBuffer()
  console.log('call startlogging')
  plm.emitter.on('command', command => {
    console.log('command', command)
  })
  plm.startPolling(deviceNames)
  plm.startLogging()
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
  // await sendModemCommand({
  //   command: 'Read 8 bytes from Database',
  //   address: '0010'
  // });
  //    await sleep(1000);
  await sendModemCommand({
    command: 'Beep',
  })
  //    await sleep(1000);
  await sendModemCommand({
    command: 'ON (Bottom Outlet)',
    onLevel: 23,
    toAddress: '4B2FC6',
  })
  //    await sleep(1000);
  await sendModemCommand({
    command: 'Get INSTEON Engine Version',
    toAddress: '4B2FC6',
  })
  //    await sleep(1000);
  const plmLog = plm.stopLogging()
  console.log('plmLog length', plmLog.length)
  console.log('"receivedAt","buffer","chunk"')
  for (const logEntry of plmLog) {
    const chunk = logEntry.chunk === undefined ? '' : logEntry.chunk
    console.log(`"${logEntry.timestamp.toISOString()}","${logEntry.buffer}","${chunk}"`)
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
  await plm.stopPolling()
}

run()
