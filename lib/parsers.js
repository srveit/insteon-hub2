'use strict'
const { parseInsteonCommand } = require('./parseInsteonCommand')
const {
  X10_COMMANDS, X10_HOUSE_CODES, X10_UNIT_CODES, INSTEON_MESSAGE_TYPES,
  ALL_LINK_TYPES, BUTTON_EVENTS, ALL_LINK_CONTROL_NAMES,
} =
  require('./constants')
const { createAllLinkRecord } = require('./allLinkRecord')
const parsers = {}

const addImParser = (code, commandName, length, parser) => {
  parsers[code] = (buffer, previousCommand) => {
    const response = {
      received: new Date().toISOString(),
      command: commandName,
      code,
      length,
    }

    if (buffer.length < response.length) {
      /* eslint no-undefined: "off" */
      return undefined
    }
    return parser(response, buffer, previousCommand)
  }
}

const parseSignedInt = str => {
  const value = parseInt(str, 16)
  if (value > 127) {
    return value - 256
  }
  return value
}

const parseMessageFlags = flags => {
  const bits = parseInt(flags, 16)
  const messageType = INSTEON_MESSAGE_TYPES[(bits & 0xE0) >> 5]
  return {
    messageType,
    allLink: (bits & 0x40) > 0,
    acknowledgement: (bits & 0x20) > 0,
    extendedMessage: (bits & 0x10) > 0,
    hopsLeft: (bits & 0xC) >> 2,
    maxHops: (bits & 0x3),
  }
}

const parseImConfigurationFlags = flags => {
  const bits = parseInt(flags, 16)
  return {
    disableAutomaticLinking: (bits & 0x80) > 0,
    monitorMode: (bits & 0x40) > 0,
    disableAutomaticLed: (bits & 0x20) > 0,
    disableHostComunications: (bits & 0x10) > 0,
    bit4: (bits & 0x08) > 0,
    bit3: (bits & 0x04) > 0,
    bit2: (bits & 0x02) > 0,
    bit1: (bits & 0x01) > 0,
  }
}

const setBroadcastFields = response => {
  if (response.messageType === 'broadcast') {
    response.deviceCategory = response.toAddress.substring(0, 2)
    response.deviceSubcategory = response.toAddress.substring(2, 4)
    response.firmware = response.toAddress.substring(4, 6)
    delete response.toAddress
  }
  if (response.messageType === 'allLinkBroadcast') {
    response.cleanUpCommand1 = response.toAddress.substring(0, 2)
    response.numberDevices = parseInt(response.toAddress.substring(2, 4), 16)
    response.groupNumber = parseInt(response.toAddress.substring(4, 6), 16)
    delete response.toAddress
  }
}

const parseX10Response = (response, buffer) => {
  response.x10HouseCode = X10_HOUSE_CODES[parseInt(buffer.substring(0, 1), 16)]
  const isX10Command = buffer.substring(2, 4) === '80'

  if (isX10Command) {
    response.x10Command = X10_COMMANDS[parseInt(buffer.substring(1, 2), 16)]
  } else {
    response.x10UnitCode = X10_UNIT_CODES[parseInt(buffer.substring(1, 2), 16)]
  }
  return response
}

const matchAllLinkRecordResponse = command => command.code === '57'

addImParser('50', 'INSTEON Standard Message Received', 18, (response, buffer, previousCommand) => {
  response.fromAddress = buffer.substring(0, 6)
  response.toAddress = buffer.substring(6, 12)
  Object.assign(response, parseMessageFlags(buffer.substring(12, 14)))
  response.command1 = buffer.substring(14, 16)
  response.command2 = buffer.substring(16, 18)
  setBroadcastFields(response)

  response.insteonCommand = parseInsteonCommand(response, previousCommand)

  return response
})

addImParser('51', 'INSTEON Extended Message Received', 46, (response, buffer, previousCommand) => {
  response.fromAddress = buffer.substring(0, 6)
  response.toAddress = buffer.substring(6, 12)
  response.command1 = buffer.substring(14, 16)
  response.command2 = buffer.substring(16, 18)
  response.data = buffer.substring(18, 44)
  response.crc = buffer.substring(44, 46)
  Object.assign(response, parseMessageFlags(buffer.substring(12, 14)))
  setBroadcastFields(response)

  response.insteonCommand = parseInsteonCommand(response, previousCommand)

  return response
})

addImParser('52', 'X10 Received', 4, parseX10Response)

addImParser('53', 'ALL-Linking Completed', 16, (response, buffer) => {
  response.allLinkType = ALL_LINK_TYPES[buffer.substring(0, 2)] ||
    buffer.substring(0, 2)
  response.groupNumber = parseInt(buffer.substring(2, 4), 16)
  response.deviceAddress = buffer.substring(4, 10)
  response.deviceCategory = buffer.substring(10, 12)
  response.deviceSubcategory = buffer.substring(12, 14)
  response.firmwareVersion = buffer.substring(14, 16)
  return response
})

addImParser('54', 'Button Event Report', 2, (response, buffer) => {
  response.buttonNumber = parseInt(buffer.substring(0, 1), 16)
  response.buttonEvent = BUTTON_EVENTS[buffer.substring(1, 2)] ||
    buffer.substring(1, 2)
  return response
})

addImParser('55', 'User Reset Detected', 0, (response) => {
  return response
})

addImParser('56', 'ALL-Link Cleanup Failure Report', 10, (response, buffer) => {
  response.state = buffer.substring(0, 2)
  response.groupNumber = parseInt(buffer.substring(2, 4), 16)
  response.deviceId = buffer.substring(4, 10)
  return response
})

addImParser('57', 'ALL-Link Record Response', 16, (response, buffer) => {
  Object.assign(response, createAllLinkRecord(buffer.substring(0, 16)))
  return response
})

addImParser('58', 'ALL-Link Cleanup Status Report', 2, (response, buffer) => {
  response.ack = buffer.substring(0, 2) === '06'
  return response
})

addImParser('59', 'Database Record Found', 20, (response, buffer) => {
  response.address = buffer.substring(0, 4)
  Object.assign(response, createAllLinkRecord(buffer.substring(4, 20)))
  return response
})

// 5A reserved
// 5B reserved

addImParser('5C', 'INSTEON Message Timed Out', 18, (response, buffer) => {
  response.address = buffer.substring(0, 4)
  response.fromAddress = buffer.substring(0, 6)
  response.toAddress = buffer.substring(6, 12)
  response.command1 = buffer.substring(14, 16)
  response.command2 = buffer.substring(16, 18)
  Object.assign(response, parseMessageFlags(buffer.substring(12, 14)))
  setBroadcastFields(response)

  response.insteonCommand = parseInsteonCommand(response)

  return response
})

// 5D reserved
// 5E reserved
// 5F reserved

addImParser('60', 'Get IM Info', 14, (response, buffer) => {
  response.imId = buffer.substring(0, 6)
  response.deviceCategory = buffer.substring(6, 8)
  response.deviceSubcategory = buffer.substring(8, 10)
  response.firmware = buffer.substring(10, 12)
  response.ack = buffer.substring(12, 14) === '06'
  return response
})

addImParser('61', 'Send ALL-Link Command', 8, (response, buffer) => {
  response.fromAddress = 'im-hub'
  response.groupNumber = parseInt(buffer.substring(0, 2), 16)
  response.allLinkCommand = buffer.substring(2, 4)
  response.command2 = buffer.substring(4, 6)
  response.ack = buffer.substring(6, 8) === '06'
  return response
})

addImParser('62', 'Send INSTEON Standard-length Message', 14, (response, buffer) => {
  Object.assign(response, parseMessageFlags(buffer.substring(6, 8)))
  if (response.extendedMessage) {
    response.length = response.length + 28
    response.command = 'Send INSTEON Extended-length Message'
  }
  if (buffer.length < response.length) {
    return undefined
  }
  response.fromAddress = 'im-hub'
  response.toAddress = buffer.substring(0, 6)
  response.command1 = buffer.substring(8, 10)
  response.command2 = buffer.substring(10, 12)
  response.ack = buffer.substring(12, 14) === '06'
  setBroadcastFields(response)
  if (response.extendedMessage) {
    response.data = buffer.substring(12, 38)
    response.crc = buffer.substring(38, 40)
    response.ack = buffer.substring(40, 42) === '06'
  }

  response.insteonCommand = parseInsteonCommand(response)

  return response
})

addImParser('63', 'Send X10', 6, (response, buffer) => {
  response.ack = buffer.substring(4, 6) === '06'
  return parseX10Response(response, buffer)
})

addImParser('64', 'Start ALL-Linking', 6, (response, buffer) => {
  response.allLinkType = ALL_LINK_TYPES[buffer.substring(0, 2)] ||
    buffer.substring(0, 2)
  response.groupNumber = parseInt(buffer.substring(2, 4), 16)
  response.ack = buffer.substring(4, 6) === '06'
  return response
})

addImParser('65', 'Cancel ALL-Linking', 2, (response, buffer) => {
  response.ack = buffer.substring(0, 2) === '06'
  return response
})

addImParser('66', 'Set Host Device Category', 8, (response, buffer) => {
  response.deviceCategory = buffer.substring(0, 2)
  response.deviceSubcategory = buffer.substring(2, 4)
  response.firmware = buffer.substring(4, 6)
  response.ack = buffer.substring(6, 8) === '06'
  return response
})

addImParser('67', 'Reset the IM', 2, (response, buffer) => {
  response.ack = buffer.substring(0, 2) === '06'
  return response
})

addImParser('68', 'Set INSTEON ACK Message Byte', 4, (response, buffer) => {
  response.command2Data = buffer.substring(0, 2)
  response.ack = buffer.substring(2, 4) === '06'
  return response
})

addImParser('69', 'Get First ALL-Link Record', 2, (response, buffer) => {
  response.ack = buffer.substring(0, 2) === '06'
  response.responseMatcher = matchAllLinkRecordResponse
  return response
})

addImParser('6A', 'Get Next ALL-Link Record', 2, (response, buffer) => {
  response.ack = buffer.substring(0, 2) === '06'
  response.responseMatcher = matchAllLinkRecordResponse
  return response
})

addImParser('6B', 'Set IM Configuration', 4, (response, buffer) => {
  response.imConfigurationFlags =
    parseImConfigurationFlags(buffer.substring(0, 2))
  response.ack = buffer.substring(2, 4) === '06'
  return response
})

addImParser('6C', 'Get ALL-Link Record for Sender', 2, (response, buffer) => {
  response.ack = buffer.substring(0, 2) === '06'
  response.responseMatcher = matchAllLinkRecordResponse
  return response
})

addImParser('6D', 'LED On', 2, (response, buffer) => {
  response.ack = buffer.substring(0, 2) === '06'
  return response
})

addImParser('6E', 'LED Off', 2, (response, buffer) => {
  response.ack = buffer.substring(0, 2) === '06'
  return response
})

// TODO add matcher - control codes 0x00 and 0x01 may also cause an
// All-Link Record Response to be returned
addImParser('6F', 'Manage ALL-Link Record', 20, (response, buffer) => {
  response.controlCode = ALL_LINK_CONTROL_NAMES[buffer.substring(0, 2)] ||
    buffer.substring(0, 2)
  Object.assign(response, createAllLinkRecord(buffer.substring(2, 18)))
  response.ack = buffer.substring(18, 20) === '06'
  return response
})

addImParser('70', 'Set INSTEON NAK Message Byte', 4, (response, buffer) => {
  response.command2Data = buffer.substring(0, 2)
  response.ack = buffer.substring(2, 4) === '06'
  return response
})

addImParser('71', 'Set INSTEON ACK Message Two Bytes', 6, (response, buffer) => {
  response.command1Data = buffer.substring(0, 2)
  response.command2Data = buffer.substring(2, 4)
  response.ack = buffer.substring(4, 6) === '06'
  return response
})

addImParser('72', 'RF Sleep', 2, (response, buffer) => {
  response.ack = buffer.substring(0, 2) === '06'
  return response
})

addImParser('73', 'Get IM Configuration', 8, (response, buffer) => {
  response.imConfigurationFlags =
    parseImConfigurationFlags(buffer.substring(0, 2))
  response.spare = buffer.substring(2, 6)
  response.ack = buffer.substring(6, 8) === '06'
  return response
})

addImParser('74', 'Cancel Cleanup', 2, (response, buffer) => {
  response.ack = buffer.substring(0, 2) === '06'
  return response
})

addImParser('75', 'Read 8 bytes from Database', 6, (response, buffer) => {
  response.address = buffer.substring(0, 4)
  response.ack = buffer.substring(4, 6) === '06'
  return response
})

addImParser('76', 'Write 8 bytes to Database', 22, (response, buffer) => {
  response.address = buffer.substring(0, 4)
  Object.assign(response, createAllLinkRecord(buffer.substring(4, 20)))
  response.ack = buffer.substring(20, 22) === '06'
  return response
})

addImParser('77', 'Beep', 4, (response, buffer) => {
  // Note the documentation doesn't mention this byte
  response.data = buffer.substring(0, 2)
  response.ack = buffer.substring(2, 4) === '06'
  return response
})

addImParser('78', 'Set Status', 4, (response, buffer) => {
  response.status = buffer.substring(0, 2)
  response.ack = buffer.substring(2, 4) === '06'
  return response
})

addImParser('79', 'Set Database Link Data for next Link', 8, (response, buffer) => {
  response.data = buffer.substring(0, 6)
  response.ack = buffer.substring(6, 8) === '06'
  return response
})

addImParser('7A', 'Set Application Retries for New Links', 4, (response, buffer) => {
  response.retries = parseInt(buffer.substring(0, 2), 16)
  response.ack = buffer.substring(2, 4) === '06'
  return response
})

addImParser('7B', 'Set RF Frequency Offset', 4, (response, buffer) => {
  response.refFrequencyOffset = parseSignedInt(buffer.substring(0, 2))
  response.ack = buffer.substring(2, 4) === '06'
  return response
})

addImParser('7C', 'Set Acknowledge for TempLinc command', 18, (response, buffer) => {
  response.acknowledge = buffer.substring(0, 16)
  response.ack = buffer.substring(16, 18) === '06'
  return response
})

// 7D reserved
// 7E reserved

addImParser('7F', 'Unknown Command 7F', 4, (response, buffer) => {
  response.data = buffer.substring(0, 2)
  response.ack = buffer.substring(2, 4) === '06'
  return response
})

exports.parsers = parsers
