'use strict'
const createDeviceManager = ({ deviceNames }) => {
  const devices = Object.entries(deviceNames).reduce(
    (namedDevices, [id, name]) => {
      namedDevices[id] = { name }
      return namedDevices
    },
    {}
  )

  return Object.freeze({
    devices,
  })
}

exports.createDeviceManager = createDeviceManager
