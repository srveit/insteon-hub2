'use strict'

const createAllLinkRecord = buffer => {
  const flags = parseInt(buffer.substring(0, 2), 16)
  const response = {
    inUse: (0x80 & flags) !== 0,
    isController: (0x40 & flags) !== 0,
    bit5: (0x20 & flags) !== 0,
    bit4: (0x10 & flags) !== 0,
    bit3: (0x08 & flags) !== 0,
    smartHop: (0x18 & flags) >> 3,
    bit2: (0x04 & flags) !== 0,
    hasBeenUsed: (0x02 & flags) !== 0,
    bit0: (0x01 & flags) !== 0,
    groupNumber: parseInt(buffer.substring(2, 4), 16),
    id: buffer.substring(4, 10),
  }

  if (response.inUse) {
    if (response.isController) {
      response.deviceCategory = buffer.substring(10, 12)
      response.deviceSubcategory = buffer.substring(12, 14)
      response.firmware = buffer.substring(14, 16)
      response.numberRetries = parseInt(buffer.substring(10, 12), 16)
      response.controllerGroupNumber = parseInt(buffer.substring(14, 16), 16)
    } else {
      response.onLevel = parseInt(buffer.substring(10, 12), 16)
      response.rampRate = parseInt(buffer.substring(12, 14), 16)
      response.responderGroupNumber = parseInt(buffer.substring(14, 16), 16)
    }
    response.data = buffer.substring(10, 16)
  }
  return response
}

exports.createAllLinkRecord = createAllLinkRecord
