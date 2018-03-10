'use strict';
const { OUTLET_CODES, OUTLET_NAMES } = require('./constants'),
  parsers = {};

parsers['09'] = response => {
  return {
    command: 'Enter Linking Mode',
    groupNumber: parseInt(response.command2, 16)
  };
};

parsers['19'] = (response, previousCommand) => {
  const command2 = previousCommand && previousCommand.command2;
  let command = {};
  switch (command2) {
  case '00':
    command.command = 'Light Status Response';
    command.onLevel = parseInt(response.command2, 16);
    break;
  case '01':
    const bits = parseInt(response.command2, 16);
    command.command = 'Outlet Status Response';
    command.top = (bits & parseInt(OUTLET_CODES.top, 16)) > 0 ? 'on' : 'off';
    command.bottom = (bits & parseInt(OUTLET_CODES.bottom, 16)) > 0 ? 'on' : 'off';
    break;
  default:
    command.command = `19${command2}`;
    command.command2 = response.command2;
  }
  command.fromAddress = response.fromAddress;
  command.allLinkDatabaseDelta = response.command1;
  return command;
};

parsers['03'] = (response, previousCommand) => {
  const command2 = previousCommand && previousCommand.command2;
  let command = {};
  switch (command2) {
  case '00':
    command.command = 'Product Data Request';
    break;
  case '01':
    command.command = 'FX Username Request';
    break;
  case '02':
    command.command = 'Device Text String Request';
    break;
  default:
    command.command = `03${previousCommand.command2}`;
    break;
  }
  command.fromAddress = response.fromAddress;
  command.edExpected = true;
  return command;
};

const decodeRampRate = byte => 2 * parseInt(byte, 16) + 1;
const decodeOnLevel = byte => parseInt(byte, 16) * 16 + 0x0F;
parsers['2E'] = response => {
  return {
    command: 'Light ON at Ramp Rate',
    onLevel: decodeOnLevel(response.command2.substr(0, 1)),
    rampRate: decodeRampRate(response.command2.substr(1, 1))
  };
};

parsers['2F'] = (response, previousCommand) => {
  const command2 = previousCommand && previousCommand.command2;
  let command = {};
  switch (command2) {
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
    command.command = `2F${previousCommand.command2}`;
    break;
  }
  command.fromAddress = response.fromAddress;
  command.edExpected = true;
  if (previousCommand.insteonCommand &&
      previousCommand.insteonCommand.dumpAllRecords) {
    command.edTerminator = command => command.insteonCommand.inUse === false;
  }
  return command;
};

parsers['32'] = (response, previousCommand) => {
  return {
    command: `Outlet ON (${OUTLET_NAMES[previousCommand.command2]})`
  };
};

parsers['33'] = (response, previousCommand) => {
  return {
    command: `Outlet OFF (${OUTLET_NAMES[previousCommand.command2]})`
  };
};

module.exports = parsers;
