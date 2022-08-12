'use strict'
const { createAllLinkRecord } = require('./allLinkRecord')
const { ENGINE_VERSION_NAMES, OUTLET_CODES, OUTLET_NAMES, X10_HOUSE_CODES, X10_UNIT_CODES, NAK_ERRORS } =
  require('./constants')
const allLinkParsers = {}
const parsers = {
  direct: {},
  broadcast: {},
  extendedData: {},
  directAck: {},
  directNak: {},
  allLink: allLinkParsers,
  allLinkBroadcast: allLinkParsers,
  allLinkCleanup: allLinkParsers,
  allLinkCleanupAck: allLinkParsers,
  allLinkCleanupNak: allLinkParsers,
}
const commandNames = {}

const toHex = (value = 0, length = 2) => value.toString(16)
  .padStart(length, '0').toUpperCase().substring(0, length)

const decodeRampRate = byte => 2 * parseInt(byte, 16) + 1

const decodeOnLevel = byte => parseInt(byte, 16) * 16 + 0x0F

const parseOutletState = ({ command, response }) => {
  const command1 = response.command1
  const command2 = response.command2
  const bits = parseInt(command2, 16)

  command.top = (bits & parseInt(OUTLET_CODES.top, 16)) > 0 ? 'on' : 'off'
  command.bottom = (bits & parseInt(OUTLET_CODES.bottom, 16)) > 0
    ? 'on'
    : 'off'
  command.allLinkDatabaseDelta = parseInt(command1, 16)
  return command
}

const standard = (
  messageType,
  command1And2,
  commandName,
  command2PropertyOrParser
) => {
  const parser = (response, previousCommand) => {
    const command = {
      command: commandName,
    }
    if (typeof command2PropertyOrParser === 'function') {
      return command2PropertyOrParser({
        command,
        previousCommand,
        response,
      })
    }
    if (command2PropertyOrParser) {
      command[command2PropertyOrParser] = parseInt(response.command2, 16)
    }
    return command
  }
  if (command1And2.length === 4) {
    parsers[messageType][command1And2] = parser
  } else {
    const command1 = command1And2
    for (let i = 0; i < 256; i = i + 1) {
      parsers[messageType][command1 + toHex(i)] = parser
    }
  }
}

const allLink = (command1, commandName) => {
  commandNames[command1] = commandName
  standard('allLink', command1, commandName, ({ command, response }) => {
    command.groupNumber = response.groupNumber ||
      parseInt(response.command2, 16)
    command.command1 = response.allLinkCommand || response.command1

    if (response.cleanUpCommand1 && response.cleanUpCommand1 !== '00') {
      command.cleanUpCommand = commandNames[response.cleanUpCommand1] ||
        `cleanUpCommand ${response.cleanUpCommand1}`
    }
    /* eslint no-undefined: "off" */
    if (response.numberDevices !== undefined) {
      command.numberDevices = response.numberDevices
    }
    return command
  })
}

const broadcast = (command1And2, commandName, command2PropertyOrParser) =>
  standard('broadcast', command1And2, commandName, command2PropertyOrParser)

const direct = (command1And2, commandName, command2PropertyOrParser) => {
  const command1 = command1And2.substring(0, 2)
  standard('direct', command1And2, commandName, command2PropertyOrParser)
  for (let nakCode = 0; nakCode < 256; nakCode = nakCode + 1) {
    const nakErrorCode = toHex(nakCode)
    standard('directNak', command1 + nakErrorCode, commandName, ({ command, previousCommand }) => {
      command.error = NAK_ERRORS[nakErrorCode] || 'Reserved'
      command.previousCommand = previousCommand?.command
      command.command2 = previousCommand?.command2
      return command
    })
  }
}

const directAck = (command1And2, commandName, command2PropertyOrParser) =>
  standard('directAck', command1And2, commandName, command2PropertyOrParser)

const extendedData = (command1And2, commandName, command2PropertyOrParser) =>
  standard('extendedData', command1And2, commandName, command2PropertyOrParser)

const parseInsteonCommand = (response, previousCommand) => {
  let messageType = response.messageType
  let command1 = response.command1
  let command2 = response.command2

  if (response.allLinkCommand) {
    messageType = 'allLinkBroadcast'
    command1 = response.allLinkCommand
  } else if (messageType === 'directAck') {
    command1 = (previousCommand && previousCommand.command1) || command1
    command2 = (previousCommand && previousCommand.command2) || command2
  } else if (response.extendedMessage) {
    messageType = 'extendedData'
  }

  const parser = parsers[messageType] && parsers[messageType][command1 + command2]
  if (parser) {
    const insteonCommand = parser(response, previousCommand, response)
    const commandProperties = [
      'messageType',
      'fromAddress',
      'toAddress',
      'deviceCategory',
      'deviceSubcategory',
      'firmware',
      'numberDevices',
      'groupNumber']

    commandProperties.forEach(property => {
      if (response[property] !== undefined) {
        insteonCommand[property] = response[property]
      }
    })
    if (response.allLinkCommand) {
      insteonCommand.messageType = 'allLinkBroadcast'
    } else if (response.extendedMessage) {
      insteonCommand.messageType = 'extendedData'
    }

    return insteonCommand
  }
  return undefined
}

// ALL-Link Broadcast Commands
allLink('06', 'ALL-Link Cleanup Status Report')
allLink('11', 'ALL-Link Recall')
allLink('12', 'ALL-Link Alias 2 High')
allLink('13', 'ALL-Link Alias 1 Low')
allLink('14', 'ALL-Link Alias 2 Low')
allLink('15', 'ALL-Link Alias 3 High')
allLink('16', 'ALL-Link Alias 3 Low')
allLink('17', 'ALL-Link Alias 4 High')
allLink('18', 'ALL-Link Alias 4 Low')

// Standard-length Broadcast Commands
// 00 Reserved
broadcast('01', 'SET Button Pressed Responder', ({ command, response }) => {
  command.hardwareVersion = response.command2
  return command
})
broadcast('02', 'SET Button Pressed Controller', ({ command, response }) => {
  command.hardwareVersion = response.command2
  return command
})
broadcast('0300', 'Test Powerline Phase', ({ command }) => {
  command.phase = 'A'
  return command
})
broadcast('0301', 'Test Powerline Phase', ({ command }) => {
  command.phase = 'B'
  return command
})

// Standard-length Direct Commands
// 00 Reserved
direct('01', 'Assign to ALL-Link Group', 'groupNumber')
direct('02', 'Delete from ALL-Link Group', 'groupNumber')
direct('0300', 'Product Data Request')
direct('0301', 'FX Username Request')
direct('0302', 'Device Text String Request')
// 04-08 Reserved
direct('09', 'Enter Linking Mode', 'groupNumber')
direct('0A', 'Enter Unlinking Mode', 'groupNumber')
// 0B-0C Reserved
direct('0D00', 'Get INSTEON Engine Version')
// 0E Reserved
direct('0F', 'Ping', 'data')
direct('10', 'ID Request', 'data')
direct('11', 'Light ON', 'onLevel')
direct('12', 'Light ON Fast', 'onLevel')
direct('13', 'Light OFF', 'data')
direct('14', 'Light OFF Fast', 'data')
direct('15', 'Light Brighten One Step', 'data')
direct('16', 'Light Dim One Step', 'data')
direct('1700', 'Light Start Manual Change', ({ command }) => {
  command.direction = 'down'
  return command
})
direct('1701', 'Light Start Manual Change', ({ command }) => {
  command.direction = 'up'
  return command
})
direct('18', 'Light Stop Manual Change', 'data')
direct('19', 'Light Status Request', 'type')
direct('1900', 'Light Status Request')
direct('1901', 'Outlet Status Request')
direct('1902', 'Light Status Request 02')
// 1A-1E Reserved
direct('1F00', 'Get Operating Flags')
direct('1F01', 'Get ALL-Link Database Delta')
direct('1F02', 'Get Signal-to-Noise Value')
direct('1F05', 'Get Operating Flags 2')
direct('2000', 'Set Program Lock On')
direct('2001', 'Set Program Lock Off')
direct('2002', 'Set Program LED On')
direct('2003', 'Set Program LED Off')
direct('2004', 'Set Program Beeper On')
direct('2005', 'Set Program Beeper Off')
direct('2006', 'Set Program Stay Awake On')
direct('2007', 'Set Program Stay Awake Off')
direct('2008', 'Set Program Listen Only On')
direct('2009', 'Set Program Listen Only Off')
direct('200A', 'Set Program No I\'m Alive On')
direct('200B', 'Set Program No I\'m Alive Off')
direct('21', 'Light Instant Change', 'onLevel')
direct('22', 'Light Manually Turned Off', 'data')
direct('23', 'Light Manually Turned On', 'data')
direct('24', 'Reread Init Values', 'data')
direct('2501', 'Remote SET Button Tap')
direct('2502', 'Remote SET Button Tap Twice')
// 26 Reserved
direct('27', 'Light Set Status', 'onLevel')
// 28-2D Deprecated
direct('2E', 'Light ON at Ramp Rate', ({ command, response }) => {
  const command2 = response.command2
  command.onLevel = decodeOnLevel(command2.substring(0, 1))
  command.rampRate = decodeRampRate(command2.substring(1, 2))
  return command
})
// 2F-31 ?
direct('3201', `Outlet ON (${OUTLET_NAMES['01']})`)
direct('3202', `Outlet ON (${OUTLET_NAMES['02']})`)
direct('3301', `Outlet OFF (${OUTLET_NAMES['01']})`)
direct('3302', `Outlet OFF (${OUTLET_NAMES['02']})`)
// 34-3F Reserved

// Standard-length Direct Ack Commands
// 00 Reserved
directAck('01', 'Assign to ALL-Link Group', 'groupNumber')
directAck('02', 'Delete from ALL-Link Group', 'groupNumber')
directAck(
  '03',
  'Device Info Request',
  ({ command, previousCommand, response }) => {
    command.command2 = previousCommand
      ? previousCommand.command2
      : response.command2
    return command
  })
directAck('0300', 'Product Data Request')
directAck('0301', 'FX Username Request')
directAck('0302', 'Device Text String Request')
// 04-08 Reserved
directAck('09', 'Enter Linking Mode', 'groupNumber')
directAck('0A', 'Enter Unlinking Mode', 'groupNumber')
// 0B-0C Reserved
directAck('0D00', 'Get INSTEON Engine Version', ({ command, previousCommand, response }) => {
  command.engineVersion = ENGINE_VERSION_NAMES[response.command2] || response.command2
  return command
})
// 0E Reserved
directAck('0F', 'Ping', 'data')
directAck('10', 'ID Request', 'data')
directAck('11', 'Light ON', 'onLevel')
directAck('12', 'Light ON Fast', 'onLevel')
directAck('13', 'Light OFF')
directAck('14', 'Light OFF Fast')
directAck('15', 'Light Brighten One Step')
directAck('16', 'Light Dim One Step')
directAck('1700', 'Light Start Manual Change', ({ command }) => {
  command.direction = 'down'
  return command
})
directAck('1701', 'Light Start Manual Change', ({ command }) => {
  command.direction = 'up'
  return command
})
directAck('18', 'Light Stop Manual Change', 'data')

directAck(
  '19',
  'Light Status Response',
  ({ command, previousCommand, response }) => {
    const previousCommand2 = previousCommand ? previousCommand.command2 : '--'
    const command1 = response.command1
    const command2 = response.command2

    command.command = `19${previousCommand2} Response`
    command.command2 = command2
    command.allLinkDatabaseDelta = parseInt(command1, 16)
    return command
  })
directAck('1900', 'Light Status Response', ({ command, response }) => {
  const command1 = response.command1
  const command2 = response.command2

  command.onLevel = parseInt(command2, 16)
  command.allLinkDatabaseDelta = parseInt(command1, 16)
  return command
})

directAck('1901', 'Outlet Status Response', parseOutletState)

directAck('1902', 'Outlet Status Response', parseOutletState)

directAck('1903', 'Outlet Status Response', parseOutletState)

directAck('1F', 'Get Operating Flags', ({ command, response }) => {
  command.command2 = response.command2
  return command
})

directAck('1F00', 'Get Operating Flags', ({ command, response }) => {
  const bits = parseInt(response.command2, 16)
  command.programmingLockOn = (bits & 0x01) !== 0
  command.ledOnDuringTransmit = (bits & 0x02) !== 0
  command.resumeDimEnabled = (bits & 0x04) !== 0
  command.loadSenseTopOn = (bits & 0x04) !== 0
  command.beeperOn = (bits & 0x04) !== 0
  command.numberKeys = ((bits & 0x08) !== 0) ? 8 : 6
  command.stayAwake = ((bits & 0x08) !== 0)
  command.loadSenseBottomOn = (bits & 0x08) !== 0
  command.receiveOnly = (bits & 0x10) !== 0
  command.backlightOn = (bits & 0x10) !== 0
  command.ledOff = (bits & 0x10) !== 0
  command.heartbeatOff = (bits & 0x20) !== 0
  command.loadSenseOn = (bits & 0x20) !== 0
  command.keybeepOn = (bits & 0x20) !== 0
  command.rfOff = (bits & 0x40) !== 0
  command.powerlineOff = (bits & 0x80) !== 0
  return command
})
directAck('1F01', 'Get ALL-Link Database Delta', ({ command, response }) => {
  command.allLinkDatabaseDelta = parseInt(response.command2, 16)
  return command
})
directAck('1F02', 'Get Signal-to-Noise Value', ({ command, response }) => {
  command.signalToNoise = parseInt(response.command2, 16)
  return command
})
directAck('1F05', 'Get Operating Flags 2', ({ command, response }) => {
  const bits = parseInt(response.command2, 16)
  command.bit0 = (bits & 0x01) !== 0
  command.noX10 = (bits & 0x02) !== 0
  command.errorBlinkOn = (bits & 0x04) !== 0
  command.cleanupReportOn = (bits & 0x08) !== 0
  command.lockButtonsOn = (bits & 0x10) !== 0
  command.bit5 = (bits & 0x20) !== 0
  command.smartHopsOff = (bits & 0x40) !== 0
  command.bit7 = (bits & 0x80) !== 0
  return command
})
directAck('2000', 'Set Program Lock On', 'data')
directAck('2001', 'Set Program Lock Off', 'data')
directAck('2002', 'Set Program LED On', 'data')
directAck('2003', 'Set Program LED Off', 'data')
directAck('2004', 'Set Program Beeper On', 'data')
directAck('2005', 'Set Program Beeper Off', 'data')
directAck('2006', 'Set Program Stay Awake On', 'data')
directAck('2007', 'Set Program Stay Awake Off', 'data')
directAck('2008', 'Set Program Listen Only On', 'data')
directAck('2009', 'Set Program Listen Only Off', 'data')
directAck('200A', 'Set Program No I\'m Alive On', 'data')
directAck('200B', 'Set Program No I\'m Alive Off', 'data')

// TODO: parse as ack for all 2E ED commands
directAck('2E', 'Light ON at Ramp Rate', ({ command, response }) => {
  const command2 = response.command2
  command.onLevel = decodeOnLevel(command2.substring(0, 1))
  command.rampRate = decodeRampRate(command2.substring(1, 2))
  return command
})

directAck(
  '2F',
  'Read/Write Database',
  ({ command, previousCommand }) => {
    const previousCommand2 = previousCommand ? previousCommand.command2 : '--'

    switch (previousCommand2) {
      case '00':
        command.command = 'Read/Write ALL-Link Database'
        break
      case '01':
        command.command = 'Read/Write ALL-Link Database (PLM)'
        break
      case '02':
        command.command = 'Read/Write IR Code Database'
        break
      default:
        command.command = `2F${previousCommand2} Response`
    }

    return command
  })
directAck('30', 'Trigger Group', 'groupNumber')
directAck('32', 'Outlet ON', ({ command, previousCommand }) => {
  const previousCommand2 = previousCommand ? previousCommand.command2 : '--'
  command.command = `Outlet ON (${OUTLET_NAMES[previousCommand2]})`
  return command
})
directAck('33', 'Outlet OFF', ({ command, previousCommand }) => {
  const previousCommand2 = previousCommand ? previousCommand.command2 : '--'
  command.command = `Outlet OFF (${OUTLET_NAMES[previousCommand2]})`
  return command
})

extendedData('0300', 'Product Data Response', ({ command, response }) => {
  const data = response.data
  const deviceCategory = data.substring(8, 10)
  const deviceSubcategory = data.substring(10, 12)

  command.productKey = data.substring(2, 8)
  command.deviceCategory = deviceCategory
  command.deviceSubcategory = deviceSubcategory
  command.firmware = data.substring(12, 14)
  command.d8 = data.substring(14, 16)
  command.userDefined = data.substring(16, 28)
  return command
})
extendedData('0301', 'FX Username Response', ({ command, response }) => {
  const data = response.data
  command.username = data.substring(0, 16)
  command.userDefined = data.substring(16, 28)
  return command
})
extendedData('0302', 'Device Text String Response', ({ command, response }) => {
  const data = response.data
  command.textString = data.substring(0, 28)
  return command
})
extendedData('0303', 'Set Device Text String', ({ command, response }) => {
  const data = response.data
  command.textString = data.substring(0, 28)
  return command
})
extendedData('0304', 'Set ALL-Link Command Alias', ({ command, response }) => {
  const data = response.data
  command.allLinkCommand = data.substring(0, 2)
  command.directCommand = data.substring(2, 6)
  command.commandType = data.substring(6, 8) === '00' ? 'SD' : 'ED'
  return command
})
extendedData(
  '0305',
  'Set ALL-Link Command Alias Extended Data',
  ({ command, response }) => {
    const data = response.data
    command.data = data
    return command
  })

extendedData('09', 'Enter Linking Mode', ({ command, response }) => {
  const data = response.data

  command.groupNumber = parseInt(data.substring(0, 2), 16)
  command.data = data.substring(4)
  return command
})

extendedData('2E', 'Extended Set/Get', ({ command, response }) => {
  const data = response.data
  const commandTypeByte = data.substring(2, 4)

  command.groupNumber = parseInt(data.substring(0, 2), 16)
  switch (commandTypeByte) {
    case '00':
      command.type = 'Data Request'
      break
    case '01':
      command.type = 'Data Response'
      command.x10HouseCode = X10_HOUSE_CODES[parseInt(data.substring(8, 10), 16)]
      command.x10UnitCode = X10_UNIT_CODES[parseInt(data.substring(10, 12), 16)]
      command.rampRate = parseInt(data.substring(12, 14), 16)
      command.onLevel = parseInt(data.substring(14, 16), 16)
      command.signalToNoiseThreshold = parseInt(data.substring(16, 18), 16)
      command.ledBrightness = parseInt(data.substring(16, 18), 16)
      break
    case '04':
      command.type = 'Set X10 Address'
      command.x10HouseCode = X10_HOUSE_CODES[parseInt(data.substring(4, 6), 16)]
      command.x10UnitCode = X10_UNIT_CODES[parseInt(data.substring(6, 8), 16)]
      break
    case '05':
      command.type = 'Set Ramp Rate'
      command.rampRate = parseInt(data.substring(4, 6), 16)
      break
    case '06':
      command.type = 'Set On-Level'
      command.onLevel = parseInt(data.substring(4, 6), 16)
      break
    default:
      command.type = `Command ${commandTypeByte}`
      command.data = data.substring(4)
  }
  return command
})

extendedData('2F', 'Read/Write ALL-Link Database', ({ command, response }) => {
  const data = response.data
  const commandTypeByte = data.substring(2, 4)

  switch (commandTypeByte) {
    case '00':
      command.type = 'Record Request'
      command.dumpAllRecords = data.substring(8, 10) === '00'
      command.numberOfRecords = parseInt(data.substring(8, 10), 16)
      break
    case '01':
      command.type = 'Record Response'
      Object.assign(command, createAllLinkRecord(data.substring(10, 26)))
      break
    case '02':
      command.type = 'Write ALDB Record'
      command.numberOfBytes = parseInt(data.substring(8, 10), 16)
      Object.assign(command, createAllLinkRecord(data.substring(10, 26)))
      break
    default:
      command.type = `Record Command ${commandTypeByte}`
      command.data = data.substring(8)
  }

  command.address = data.substring(4, 8)
  return command
})

exports.parseInsteonCommand = parseInsteonCommand
