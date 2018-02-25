'use strict';
const { parseAllLinkRecord } = require('./allLinkRecord'),
      { X10_HOUSE_CODES, X10_UNIT_CODES } = require('./constants'),
  parsers = {};

const crc = (command1, command2, data) => {
  let sum = `${command1}${command2}${data}`.match(/.{1,2}/g).reduce(
    (sum, byte) => sum + parseInt(byte, 16),
    0
  );
  return ((~ sum) + 1) & 0xFF;
};

parsers['0300'] = response => {
  const data = response.data;
  return {
    command: 'Product Data Response',
    productKey: data.substr(2, 6),
    deviceCategory: data.substr(8, 2),
    deviceSubcategory: data.substr(10, 2),
    firmware: data.substr(12, 2),
    d8: data.substr(14, 2),
    userDefined: data.substr(16, 12)
  };
};

parsers['0301'] = response => {
  const data = response.data;
  return {
    command: 'FX Username Response',
    username: data.substr(0, 16),
    userDefined: data.substr(16, 12)
  };
};

parsers['0302'] = response => {
  const data = response.data;
  return {
    command: 'Device Text String Response',
    textString: data.substr(0, 28)
  };
};

parsers['2E00'] = response => {
  const data = response.data;
  let command = {
    command: 'Extended Set/Get',
    groupNumber: parseInt(data.substr(0, 2), 16)
  };
  switch (data.substr(2, 2)) {
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
    command.type = `Command ${data.substr(2, 2)}`;
    command.data = data.substr(4);
  }
  return command;
};

const parseReadWriteAllLinkDatabase = response => {
  const data = response.data;
  let command = {
    command: 'Read/Write ALL-Link Database',
    address: data.substr(4, 4)
  };
  if (data.substr(2, 2) === '00') {
    command.type = 'Record Request';
    command.dumpAllRecords = data.substr(8, 2) === '00';
  } else if (data.substr(2, 2) === '01') {
    command.type = 'Record Response';
    Object.assign(command, parseAllLinkRecord(data.substr(10, 16)));
  } else if (data.substr(2, 2) === '02') {
    command.type = 'Write ALDB Record';
    command.numberOfBytes = parseInt(data.substr(8, 2), 16);
    Object.assign(command, parseAllLinkRecord(data.substr(10, 16)));
  }
  return command;
};
parsers['2F00'] = parseReadWriteAllLinkDatabase;
parsers['2F01'] = parseReadWriteAllLinkDatabase;
parsers['2F02'] = parseReadWriteAllLinkDatabase;

module.exports = parsers;
