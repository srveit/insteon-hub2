'use strict'

const { createDevice } = require('../lib/device')

const createHouse = (deviceNames) => {
  const devices =
      Object.entries(deviceNames)
        .filter(([id]) => id !== 'im-hub')
        .map(([id, name]) => createDevice({ id, name }))

  const getDevice = id => devices.find(device => device.id() === id)

  const updateDevices = command => {
    const device = getDevice(command.fromAddress)
    if (device) {
      device.update(command)
    }
  }

  return Object.freeze({
    getDevice,
    numberDevices: () => devices.length,
    updateDevices,
  })
}

exports.createHouse = createHouse
