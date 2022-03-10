'use strict'

// A transform stream that takes commands and adds device names using
// given device addresses.

const { Transform } = require('stream')

const createCommandAnnotator = (deviceNames) => {
  const addDeviceName = command => {
    if (command.fromAddress) {
      command.fromDevice = deviceNames[command.fromAddress]
    }
    if (command.toAddress) {
      command.toDevice = deviceNames[command.toAddress]
    }
    if (command.deviceId) {
      command.deviceName = deviceNames[command.deviceId]
    }
    if (command.imId) {
      command.imDevice = deviceNames[command.imId]
    }
    if (command.id) {
      command.device = deviceNames[command.id]
    }
    if (command.insteonCommand) {
      addDeviceName(command.insteonCommand)
    }
  }

  return new Transform({
    writableObjectMode: true,
    readableObjectMode: true,

    transform (command, encoding, callback) {
      addDeviceName(command)
      callback(null, command)
    },
  })
}

exports.createCommandAnnotator = createCommandAnnotator
