'use strict';
const _ = require('lodash'),
  {parseAllLinkRecord} = require('./allLinkRecord'),
  {OUTLET_CODES, OUTLET_NAMES, X10_HOUSE_CODES, X10_UNIT_CODES} =
  require('./constants'),
  allLinkParsers = {},
  parsers = {
    direct: {},
    broadcast: {},
    extendedData: {},
    directAck: {},
    directNak: {},
    allLink: allLinkParsers,
    allLinkBroadcast: allLinkParsers,
    allLinkCleanup: allLinkParsers,
    allLinkCleanupAck: allLinkParsers,
    allLinkCleanupNak: allLinkParsers
  },
  commandNames = {},

  toHex = (value = 0, length = 2) => value.toString(16)
    .padStart(length, '0').toUpperCase().substr(0, length),

  decodeRampRate = byte => 2 * parseInt(byte, 16) + 1,

  decodeOnLevel = byte => parseInt(byte, 16) * 16 + 0x0F,

  standard =
  (messageType, command1And2, commandName, command2PropertyOrParser) => {
    const parser = (response, previousCommand) => {
      const command = {
        command: commandName
      };
      if (_.isFunction(command2PropertyOrParser)) {
        return command2PropertyOrParser({
          command,
          previousCommand,
          response
        });
      }
      if (command2PropertyOrParser) {
        command[command2PropertyOrParser] = parseInt(response.command2, 16);
      }
      return command;
    };
    if (command1And2.length === 4) {
      parsers[messageType][command1And2] = parser;
    } else {
      const command1 = command1And2;
      for (let i = 0; i < 256; i = i + 1) {
        parsers[messageType][command1 + toHex(i)] = parser;
      }
    }
  },

  allLink = (command1, commandName) => {
    commandNames[command1] = commandName;
    standard('allLink', command1, commandName, ({command, response}) => {
      command.groupNumber = response.groupNumber ||
        parseInt(response.command2, 16);
      command.command1 = response.allLinkCommand || response.command1;

      if (response.cleanUpCommand1 && response.cleanUpCommand1 !== '00') {
        command.cleanUpCommand = commandNames[response.cleanUpCommand1] ||
          `cleanUpCommand ${response.cleanUpCommand1}`;
      }
      /* eslint no-undefined: "off" */
      if (response.numberDevices !== undefined) {
        command.numberDevices = response.numberDevices;
      }
      return command;
    });
  },

  broadcast = (command1And2, commandName, command2PropertyOrParser) =>
    standard('broadcast', command1And2, commandName, command2PropertyOrParser),

  direct = (command1And2, commandName, command2PropertyOrParser) => {
    standard('direct', command1And2, commandName, command2PropertyOrParser);
    standard('directNak', command1And2, commandName);
  },

  directAck = (command1And2, commandName, command2PropertyOrParser) =>
    standard('directAck', command1And2, commandName, command2PropertyOrParser),

  extendedData = (command1And2, commandName, command2PropertyOrParser) =>
    standard('extendedData', command1And2, commandName, command2PropertyOrParser),

  parseInsteonCommand = (response, previousCommand) => {
    let messageType = response.messageType,
      command1 = response.command1,
      command2 = response.command2;

    if (response.allLinkCommand) {
      messageType = 'allLinkBroadcast';
      command1 = response.allLinkCommand;
    } else if (messageType === 'directAck') {
      command1 = (previousCommand && previousCommand.command1) || command1;
      command2 = (previousCommand && previousCommand.command2) || command2;
    } else if (response.extendedMessage) {
      messageType = 'extendedData';
    }

    const parser = parsers[messageType][command1 + command2];

    if (parser) {
      const insteonCommand = parser(response, previousCommand);
      ['messageType', 'fromAddress', 'toAddress', 'deviceCategory',
        'deviceSubcategory', 'firmware', 'numberDevices', 'groupNumber']
        .map(property => {
          if (response[property] !== undefined) {
            insteonCommand[property] = response[property];
          }
        });
      if (response.allLinkCommand) {
        insteonCommand.messageType = 'allLinkBroadcast';
      }

      return insteonCommand;
    }
    return undefined;
  };

allLink('06', 'ALL-Link Cleanup Status Report');
allLink('11', 'ALL-Link Recall');
allLink('12', 'ALL-Link Alias 2 High');
allLink('13', 'ALL-Link Alias 1 Low');
allLink('14', 'ALL-Link Alias 2 Low');
allLink('15', 'ALL-Link Alias 3 High');
allLink('16', 'ALL-Link Alias 3 Low');
allLink('17', 'ALL-Link Alias 4 High');
allLink('18', 'ALL-Link Alias 4 Low');

// Standard-length Broadcast Commands
// 00 Reserved
broadcast('01', 'SET Button Pressed Responder', 'data');
broadcast('02', 'SET Button Pressed Controller', 'data');

// Standard-length Direct Commands
// 00 Reserved
direct('01', 'Assign to ALL-Link Group', 'groupNumber');
direct('02', 'Delete from ALL-Link Group', 'groupNumber');
direct('0300', 'Product Data Request');
direct('0301', 'FX Username Request');
direct('0302', 'Device Text String Request');
// 04-08 Reserved
direct('09', 'Enter Linking Mode', 'groupNumber');
direct('0A', 'Enter Unlinking Mode', 'groupNumber');
// 0B-0C Reserved
direct('0D00', 'Get INSTEON Engine Version');
// 0E Reserved
direct('0F', 'Ping', 'data');
direct('10', 'ID Request', 'data');
direct('11', 'Light ON', 'onLevel');
direct('12', 'Light ON Fast', 'onLevel');
direct('13', 'Light OFF', 'data');
direct('14', 'Light OFF Fast', 'data');
direct('15', 'Light Brighten One Step', 'data');
direct('16', 'Light Dim One Step', 'data');
direct('1700', 'Light Start Manual Change', ({command}) => {
  command.direction = 'down';
  return command;
});
direct('1701', 'Light Start Manual Change', ({command}) => {
  command.direction = 'up';
  return command;
});
direct('18', 'Light Stop Manual Change', 'data');
direct('19', 'Light Status Request', 'type');
direct('1900', 'Light Status Request');
direct('1901', 'Outlet Status Request');
direct('1902', 'Light Status Request 02');
// 1A-1E Reserved
direct('1F00', 'Get Operating Flags');
direct('1F01', 'Get ALL-Link Database Delta');
direct('1F02', 'Get Signal-to-Noise Value');
direct('2000', 'Set Program Lock On');
direct('2001', 'Set Program Lock Off');
direct('2002', 'Set Program LED On');
direct('2003', 'Set Program LED Off');
direct('2004', 'Set Program Beeper On');
direct('2005', 'Set Program Beeper Off');
direct('2006', 'Set Program Stay Awake On');
direct('2007', 'Set Program Stay Awake Off');
direct('2008', 'Set Program Listen Only On');
direct('2009', 'Set Program Listen Only Off');
direct('200A', 'Set Program No I\'m Alive On');
direct('200B', 'Set Program No I\'m Alive Off');
direct('21', 'Light Instant Change', 'onLevel');
direct('22', 'Light Manually Turned Off', 'data');
direct('23', 'Light Manually Turned On', 'data');
direct('24', 'Reread Init Values', 'data');
direct('2501', 'Remote SET Button Tap');
direct('2502', 'Remote SET Button Tap Twice');
// 26 Reserved
direct('27', 'Light Set Status', 'onLevel');
// 28-2D Deprecated
direct('2E', 'Light ON at Ramp Rate', ({command, response}) => {
  const command2 = response.command2;
  command.onLevel = decodeOnLevel(command2.substr(0, 1));
  command.rampRate = decodeRampRate(command2.substr(1, 1));
  return command;
});
direct('3201', `Outlet ON (${OUTLET_NAMES['01']})`);
direct('3202', `Outlet ON (${OUTLET_NAMES['02']})`);
direct('3301', `Outlet OFF (${OUTLET_NAMES['01']})`);
direct('3302', `Outlet OFF (${OUTLET_NAMES['02']})`);
// 34-3F Reserved

// Standard-length Direct Ack Commands
// 00 Reserved
directAck('01', 'Assign to ALL-Link Group', 'groupNumber');
directAck('02', 'Delete from ALL-Link Group', 'groupNumber');
directAck(
  '03',
  'Device Info Request',
  ({command, previousCommand, response}) => {
    command.command2 = previousCommand ?
      previousCommand.command2 : response.command2;
    command.edExpected = true;
    return command;
  });
directAck('0300', 'Product Data Request', ({command}) => {
  command.edExpected = true;
  return command;
});
directAck('0301', 'FX Username Request', ({command}) => {
  command.edExpected = true;
  return command;
});
directAck('0302', 'Device Text String Request', ({command}) => {
  command.edExpected = true;
  return command;
});
// 04-08 Reserved
directAck('09', 'Enter Linking Mode', 'groupNumber');
directAck('0A', 'Enter Unlinking Mode', 'groupNumber');
// 0B-0C Reserved
directAck('0D00', 'Get INSTEON Engine Version', 'engineVersion');
// 0E Reserved
directAck('0F', 'Ping', 'data');
directAck('10', 'ID Request', 'data');
directAck('11', 'Light ON', 'onLevel');
directAck('12', 'Light ON Fast', 'onLevel');
directAck('13', 'Light OFF');
directAck('14', 'Light OFF Fast');
directAck('15', 'Light Brighten One Step');
directAck('16', 'Light Dim One Step');
directAck('1700', 'Light Start Manual Change', ({command}) => {
  command.direction = 'down';
  return command;
});
directAck('1701', 'Light Start Manual Change', ({command}) => {
  command.direction = 'up';
  return command;
});
directAck('18', 'Light Stop Manual Change', 'data');

directAck(
  '19',
  'Light Status Response',
  ({command, previousCommand, response}) => {
    const previousCommand2 = previousCommand ? previousCommand.command2 : '--',
      command1 = response.command1,
      command2 = response.command2;

    command.command = `19${previousCommand2}`;
    command.command2 = command2;
    command.allLinkDatabaseDelta = parseInt(command1, 16);
    return command;
  });
directAck('1900', 'Light Status Response', ({command, response}) => {
  const command1 = response.command1,
    command2 = response.command2;

  command.onLevel = parseInt(command2, 16);
  command.allLinkDatabaseDelta = parseInt(command1, 16);
  return command;
});
directAck('1901', 'Outlet Status Response', ({command, response}) => {
  const command1 = response.command1,
    command2 = response.command2,
    bits = parseInt(command2, 16);

  command.top = (bits & parseInt(OUTLET_CODES.top, 16)) > 0 ? 'on' : 'off';
  command.bottom = (bits & parseInt(OUTLET_CODES.bottom, 16)) > 0 ?
    'on' : 'off';
  command.allLinkDatabaseDelta = parseInt(command1, 16);
  return command;
});
directAck('1F00', 'Get Operating Flags', ({command, response}) => {
  const bits = parseInt(response.command2, 16);
  command.programLockOn = (bits & 0x01) !== 0;
  command.ledOnDuringTransmit = (bits & 0x02) !== 0;
  command.resumeDimEnabled = (bits & 0x04) !== 0;
  command.numberKeys = ((bits & 0x08) !== 0) ? 8 : 6;
  command.ledOn = (bits & 0x10) !== 0;
  command.loadSenseOn = (bits & 0x20) !== 0;
  command.bit6 = (bits & 0x40) !== 0;
  command.bit7 = (bits & 0x80) !== 0;
  return command;
});
directAck('1F01', 'Get ALL-Link Database Delta', ({command, response}) => {
  command.allLinkDatabaseDelta = parseInt(response.command2, 16);
  return command;
});
directAck('1F02', 'Get Signal-to-Noise Value', ({command, response}) => {
  command.signalToNoise = parseInt(response.command2, 16);
  return command;
});
directAck('2000', 'Set Program Lock On', 'data');
directAck('2001', 'Set Program Lock Off', 'data');
directAck('2002', 'Set Program LED On', 'data');
directAck('2003', 'Set Program LED Off', 'data');
directAck('2004', 'Set Program Beeper On', 'data');
directAck('2005', 'Set Program Beeper Off', 'data');
directAck('2006', 'Set Program Stay Awake On', 'data');
directAck('2007', 'Set Program Stay Awake Off', 'data');
directAck('2008', 'Set Program Listen Only On', 'data');
directAck('2009', 'Set Program Listen Only Off', 'data');
directAck('200A', 'Set Program No I\'m Alive On', 'data');
directAck('200B', 'Set Program No I\'m Alive Off', 'data');

directAck('2E', 'Light ON at Ramp Rate', ({command, response}) => {
  const command2 = response.command2;
  command.onLevel = decodeOnLevel(command2.substr(0, 1));
  command.rampRate = decodeRampRate(command2.substr(1, 1));
  return command;
});

directAck(
  '2F',
  'Read/Write Database',
  ({command, previousCommand}) => {
    const previousCommand2 = previousCommand ? previousCommand.command2 : '--';

    switch (previousCommand2) {
    case '00':
      command.command = 'Read/Write ALL-Link Database';
      break;
    case '01':
      command.command = 'Read/Write ALL-Link Database (PLM)';
      break;
    case '02':
      command.command = 'Read/Write IR Code Database';
      break;
    default:
      command.command = `2F${previousCommand2}`;
    }

    command.edExpected = true;
    if (previousCommand.insteonCommand &&
        previousCommand.insteonCommand.dumpAllRecords) {
      command.edTerminator = cmd => cmd.insteonCommand.inUse === false;
    }

    return command;
  });
directAck('32', 'Outlet ON', ({command, previousCommand}) => {
  const previousCommand2 = previousCommand ? previousCommand.command2 : '--';
  command.command = `Outlet ON (${OUTLET_NAMES[previousCommand2]})`;
  return command;
});
directAck('33', 'Outlet OFF', ({command, previousCommand}) => {
  const previousCommand2 = previousCommand ? previousCommand.command2 : '--';
  command.command = `Outlet OFF (${OUTLET_NAMES[previousCommand2]})`;
  return command;
});

extendedData('0300', 'Product Data Response', ({command, response}) => {
  const data = response.data;
  command.productKey = data.substr(2, 6);
  command.deviceCategory = data.substr(8, 2);
  command.deviceSubcategory = data.substr(10, 2);
  command.firmware = data.substr(12, 2);
  command.d8 = data.substr(14, 2);
  command.userDefined = data.substr(16, 12);
  return command;
});
extendedData('0301', 'FX Username Response', ({command, response}) => {
  const data = response.data;
  command.username = data.substr(0, 16);
  command.userDefined = data.substr(16, 12);
  return command;
});
extendedData('0302', 'Device Text String Response', ({command, response}) => {
  const data = response.data;
  command.textString = data.substr(0, 28);
  return command;
});
extendedData('0303', 'Set Device Text String', ({command, response}) => {
  const data = response.data;
  command.textString = data.substr(0, 28);
  return command;
});
extendedData('0304', 'Set ALL-Link Command Alias', ({command, response}) => {
  const data = response.data;
  command.allLinkCommand = data.substr(0, 2);
  command.directCommand = data.substr(2, 4);
  command.commandType = data.substr(6, 2) === '00' ? 'SD' : 'ED';
  return command;
});
extendedData(
  '0305',
  'Set ALL-Link Command Alias Extended Data',
  ({command, response}) => {
    const data = response.data;
    command.data = data;
    return command;
  });

extendedData('2E', 'Extended Set/Get', ({command, response}) => {
  const data = response.data,
    commandTypeByte = data.substr(2, 2);

  command.groupNumber = parseInt(data.substr(0, 2), 16);
  switch (commandTypeByte) {
  case '00':
    command.type = 'Data Request';
    break;
  case '01':
    command.type = 'Data Response';
    command.x10HouseCode = X10_HOUSE_CODES[parseInt(data.substr(8, 2), 16)];
    command.x10UnitCode = X10_UNIT_CODES[parseInt(data.substr(10, 2), 16)];
    command.rampRate = parseInt(data.substr(12, 2), 16);
    command.onLevel = parseInt(data.substr(14, 2), 16);
    command.signalToNoiseThreshold = parseInt(data.substr(16, 2), 16);
    break;
  case '04':
    command.type = 'Set X10 Address';
    command.x10HouseCode = X10_HOUSE_CODES[parseInt(data.substr(4, 2), 16)];
    command.x10UnitCode = X10_UNIT_CODES[parseInt(data.substr(6, 2), 16)];
    break;
  case '05':
    command.type = 'Set Ramp Rate';
    command.rampRate = parseInt(data.substr(4, 2), 16);
    break;
  case '06':
    command.type = 'Set On-Level';
    command.onLevel = parseInt(data.substr(4, 2), 16);
    break;
  default:
    command.type = `Command ${commandTypeByte}`;
    command.data = data.substr(4);
  }
});

extendedData('2F', 'Read/Write ALL-Link Database', ({command, response}) => {
  const data = response.data,
    commandTypeByte = data.substr(2, 2);

  switch (commandTypeByte) {
  case '00':
    command.type = 'Record Request';
    command.dumpAllRecords = data.substr(8, 2) === '00';
    break;
  case '01':
    command.type = 'Record Response';
    Object.assign(command, parseAllLinkRecord(data.substr(10, 16)));
    break;
  case '02':
    command.type = 'Write ALDB Record';
    command.numberOfBytes = parseInt(data.substr(8, 2), 16);
    Object.assign(command, parseAllLinkRecord(data.substr(10, 16)));
    break;
  default:
    command.type = `Record Command ${commandTypeByte}`;
    command.data = data.substr(8);
  }

  command.address = data.substr(4, 4);
  return command;
});


module.exports = parseInsteonCommand;
