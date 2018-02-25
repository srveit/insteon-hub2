'use strict';
const moment = require('moment'),
  broadcastParsers = require('./broadcastParsers'),
  extendedDataParsers = require('./extendedDataParsers'),
  directParsers = require('./directParsers'),
  directAckParsers = require('./directAckParsers'),
  allLinkParsers = require('./allLinkParsers'),
  { X10_COMMANDS, X10_HOUSE_CODES, X10_UNIT_CODES, INSTEON_MESSAGE_TYPES,
    ALL_LINK_TYPES, BUTTON_EVENTS, ALL_LINK_CONTROL_NAMES } =
        require('./constants'),
  { parseAllLinkRecord } = require('./allLinkRecord'),
  parsers = {};

const parseMessageFlags = flags => {
  const bits = parseInt(flags, 16);
  const messageType = INSTEON_MESSAGE_TYPES[(bits & 0xE0) >> 5];
  return {
    messageType,
    allLink: (bits & 0x40) > 0,
    acknowledgement: (bits & 0x20) > 0,
    extendedMessage: (bits & 0x10) > 0,
    hopsLeft: (bits & 0xC) >> 2,
    maxHops: (bits & 0x3)
  };
};

const parseImConfigurationFlags = flags => {
  const bits = parseInt(flags, 16);
  return {
    disableAutomaticLinking: (bits & 0x80) > 0,
    monitorMode: (bits & 0x40) > 0,
    disableAutomaticLed: (bits & 0x20) > 0,
    disableHostComunications: (bits & 0x10) > 0,
    reserved: (bits & 0xF)
  };
};

const setBroadcastFields = response => {
  if (response.messageType === 'broadcast') {
    response.deviceCategory = response.toAddress.substr(0, 2);
    response.deviceSubcategory = response.toAddress.substr(2, 2);
    response.firmware = response.toAddress.substr(4, 2);
    delete response.toAddress;
  }
  if (response.messageType === 'allLinkBroadcast') {
    response.groupNumber = parseInt(response.toAddress.substr(4, 2), 16);
    delete response.toAddress;
  }
};

const parseInsteonCommand = (response, previousCommand) => {
  let parser;
  if (response.allLinkCommand) {
    parser = allLinkParsers[response.allLinkCommand];
  } else if (response.extendedMessage) {
    parser = extendedDataParsers[response.command1 + response.command2];
  } else if (response.messageType === 'broadcast') {
    parser = broadcastParsers[response.command1 + response.command2];
  } else if (response.messageType === 'direct') {
    parser = directParsers[response.command1 + response.command2];
  } else if (response.messageType === 'directAck') {
    if (previousCommand && previousCommand.extendedMessage) {
      parser = (response, previousCommand) =>
        parseInsteonCommand(previousCommand);
    } else {
      const command1 = (previousCommand && previousCommand.command1) ||
              response.command1;
      parser = directAckParsers[command1];
    }
  }

  if (parser) {
    return parser(response, previousCommand);
  }
  return undefined;
};

const parseInsteonStandardMessageReceived = (buffer, previousCommand) => {
  const response = {
    received: moment().toISOString(),
    command: 'INSTEON Standard Message Received',
    code: '50',
    length: 18,
    fromAddress: buffer.substr(0, 6),
    toAddress: buffer.substr(6, 6),
    command1: buffer.substr(14, 2),
    command2: buffer.substr(16, 2)
  };

  if (buffer.length < response.length) {
    return undefined;
  }
  Object.assign(response, parseMessageFlags(buffer.substr(12, 2)));
  setBroadcastFields(response);

  response.insteonCommand = parseInsteonCommand(response, previousCommand);
  return response;
};
parsers['50'] = parseInsteonStandardMessageReceived;

const parseInsteonExtendedMessageReceived = buffer => {
  const response = {
    received: moment().toISOString(),
    command: 'INSTEON Extended Message Received',
    code: '51',
    length: 46,
    fromAddress: buffer.substr(0, 6),
    toAddress: buffer.substr(6, 6),
    command1: buffer.substr(14, 2),
    command2: buffer.substr(16, 2),
    data: buffer.substr(18, 26),
    crc: buffer.substr(44, 2)
  };

  if (buffer.length < response.length) {
    return undefined;
  }
  Object.assign(response, parseMessageFlags(buffer.substr(12, 2)));
  setBroadcastFields(response);

  response.insteonCommand = parseInsteonCommand(response);
  return response;
};
parsers['51'] = parseInsteonExtendedMessageReceived;

const parseX10Received = buffer => {
  const response = {
    received: moment().toISOString(),
    command: 'X10 Received',
    code: '52',
    length: 4,
    x10HouseCode: X10_HOUSE_CODES[parseInt(buffer.substr(0, 1), 16)]
  },
    isX10Command = buffer.substr(2, 2) === '80';

  if (buffer.length < response.length) {
    return undefined;
  }
  if (isX10Command) {
    response.x10Command = X10_COMMANDS[parseInt(buffer.substr(1, 1), 16)];
  } else {
    response.x10UnitCode = X10_UNIT_CODES[parseInt(buffer.substr(1, 1), 16)];
  }
  return response;
};
parsers['52'] = parseX10Received;

const parseAllLinkingCompleted = buffer => {
  const response = {
    received: moment().toISOString(),
    command: 'ALL-Linking Completed',
    code: '53',
    length: 16,
    allLinkType: ALL_LINK_TYPES[buffer.substr(0, 2)] || buffer.substr(0, 2),
    groupNumber: parseInt(buffer.substr(2, 2), 16),
    deviceAddress: buffer.substr(4, 6),
    deviceCategory: buffer.substr(10, 2),
    deviceSubcategory: buffer.substr(12, 2),
    firmwareVersion: buffer.substr(14, 2)
  };

  if (buffer.length < response.length) {
    return undefined;
  }

  return response;
};
parsers['53'] = parseAllLinkingCompleted;

const parseButtonEventReport = buffer => {
  const response = {
    received: moment().toISOString(),
    command: 'Button Event Report',
    code: '54',
    length: 2,
    buttonNumber: parseInt(buffer.substr(0, 1), 16),
    buttonEvent: BUTTON_EVENTS[buffer.substr(1, 1)] || buffer.substr(1, 1)
  };

  if (buffer.length < response.length) {
    return undefined;
  }

  return response;
};
parsers['54'] = parseButtonEventReport;

const parseUserResetDetected = buffer => {
  const response = {
    received: moment().toISOString(),
    command: 'User Reset Detected',
    code: '55',
    length: 0
  };

  return response;
};
parsers['55'] = parseUserResetDetected;

const parseAllLinkCleanupFailureReport = buffer => {
  const response = {
    received: moment().toISOString(),
    command: 'ALL-Link Cleanup Failure Report',
    code: '56',
    length: 10,
    state: buffer.substr(0, 2),
    groupNumber: parseInt(buffer.substr(2, 2), 16),
    deviceId: buffer.substr(4, 6)
  };

  if (buffer.length < response.length) {
    return undefined;
  }

  return response;
};
parsers['56'] = parseAllLinkCleanupFailureReport;

const parseAllLinkRecordResponse = buffer => {
  const response = {
      received: moment().toISOString(),
      command: 'ALL-Link Record Response',
      code: '57',
      length: 16
    };

  if (buffer.length < response.length) {
    return undefined;
  }
  Object.assign(response, parseAllLinkRecord(buffer.substr(0, 16)));

  return response;
};
parsers['57'] = parseAllLinkRecordResponse;

const parseAllLinkCleanupStatusReport = buffer => {
  const response = {
    received: moment().toISOString(),
    command: 'ALL-Link Cleanup Status Report',
    code: '58',
    length: 2,
    ack: buffer.substr(0, 2) === '06'
  };

  if (buffer.length < response.length) {
    return undefined;
  }

  return response;
};
parsers['58'] = parseAllLinkCleanupStatusReport;

const parseDatabaseRecordFound = buffer => {
  const response = {
    received: moment().toISOString(),
    command: 'Database Record Found',
    code: '59',
    length: 20,
    address: buffer.substr(0, 4)
  };

  if (buffer.length < response.length) {
    return undefined;
  }
  Object.assign(response, parseAllLinkRecord(buffer.substr(4, 16)));

  return response;
};
parsers['59'] = parseDatabaseRecordFound;

const parseInsteon5cMessage = buffer => {
  const response = {
    received: moment().toISOString(),
    command: 'INSTEON 0x5C Message',
    code: '5C',
    length: 18,
    fromAddress: buffer.substr(0, 6),
    toAddress: buffer.substr(6, 6),
    command1: buffer.substr(14, 2),
    command2: buffer.substr(16, 2)
  };

  if (buffer.length < response.length) {
    return undefined;
  }
  Object.assign(response, parseMessageFlags(buffer.substr(12, 2)));
  setBroadcastFields(response);

  response.insteonCommand = parseInsteonCommand(response);
  return response;
};
parsers['5C'] = parseInsteon5cMessage;

const parseGetImInfo = buffer => {
  const response = {
    received: moment().toISOString(),
    command: 'Get IM Info',
    code: '60',
    length: 14,
    imId: buffer.substr(0, 6),
    deviceCategory: buffer.substr(6, 2),
    deviceSubcategory: buffer.substr(8, 2),
    firmware: buffer.substr(10, 2),
    ack: buffer.substr(12, 2) === '06'
  };

  if (buffer.length < response.length) {
    return undefined;
  }

  return response;
};
parsers['60'] = parseGetImInfo;

const parseSendAllLinkCommand = buffer => {
  const response = {
    received: moment().toISOString(),
    command: 'Send ALL-Link Command',
    code: '61',
    length: 8,
    groupNumber: parseInt(buffer.substr(0, 2), 16),
    allLinkCommand: buffer.substr(2, 2),
    command2: buffer.substr(4, 2),
    ack: buffer.substr(6, 2) === '06'
  };

  if (buffer.length < response.length) {
    return undefined;
  }
  response.insteonCommand = parseInsteonCommand(response);
  return response;
};
parsers['61'] = parseSendAllLinkCommand;

const parseSendInsteonStandardLengthMessage = buffer => {
  const response = {
    received: moment().toISOString(),
    command: 'Send INSTEON Standard-length Message',
    code: '62',
    length: 14,
    toAddress: buffer.substr(0, 6),
    command1: buffer.substr(8, 2),
    command2: buffer.substr(10, 2),
    ack: buffer.substr(12, 2) === '06'
  };

  if (buffer.length < 8) {
    return undefined;
  }
  Object.assign(response, parseMessageFlags(buffer.substr(6, 2)));
  if (response.extendedMessage) {
    response.length += 28;
  }
  if (buffer.length < response.length) {
    return undefined;
  }
  setBroadcastFields(response);
  if (response.extendedMessage) {
    response.data = buffer.substr(12, 26);
    response.crc = buffer.substr(38, 2);
    response.ack = buffer.substr(40, 2) === '06';
  }

  response.insteonCommand = parseInsteonCommand(response);
  return response;
};
parsers['62'] = parseSendInsteonStandardLengthMessage;

const parseSendX10 = buffer => {
  const x10Flag = buffer.substr(2, 2),
    response = {
      received: moment().toISOString(),
      command: 'Send X10',
      code: '63',
      length: 6,
      x10HouseCode: X10_HOUSE_CODES[buffer.substr(0, 1)],
      ack: buffer.substr(4, 2) === '06'
    };
  let x10UnitCode, x10Command;

  if (buffer.length < response.length) {
    return undefined;
  }

  if (x10Flag === '00') {
    response.x10UnitCode = X10_UNIT_CODES[buffer.substr(1, 1)];
  } else {
    response.x10Command = X10_COMMANDS[buffer.substr(1, 1)];
  }
  return response;
};
parsers['63'] = parseSendX10;

const parseStartAllLinking = buffer => {
  const response = {
    received: moment().toISOString(),
    command: 'Start ALL-Linking',
    code: '64',
    length: 6,
    allLinkType: ALL_LINK_TYPES[buffer.substr(0, 2)] || buffer.substr(0, 2),
    groupNumber: parseInt(buffer.substr(2, 2), 16),
    ack: buffer.substr(4, 2) === '06'
  };

  if (buffer.length < response.length) {
    return undefined;
  }
  return response;
};
parsers['64'] = parseStartAllLinking;

const parseCancelAllLinking = buffer => {
  const response = {
    received: moment().toISOString(),
    command: 'Cancel ALL-Linking',
    code: '65',
    length: 2,
    ack: buffer.substr(0, 2) === '06'
  };

  if (buffer.length < response.length) {
    return undefined;
  }
  return response;
};
parsers['65'] = parseCancelAllLinking;

const parseSetHostDeviceCategory = buffer => {
  const response = {
    received: moment().toISOString(),
    command: 'Set Host Device Category',
    code: '66',
    length: 8,
    deviceCategory: buffer.substr(0, 2),
    deviceSubcategory: buffer.substr(2, 2),
    firmware: buffer.substr(4, 2),
    ack: buffer.substr(6, 2) === '06'
  };

  if (buffer.length < response.length) {
    return undefined;
  }
  return response;
};
parsers['66'] = parseSetHostDeviceCategory;

const parseResetTheIm = buffer => {
  const response = {
    received: moment().toISOString(),
    command: 'Reset the IM',
    code: '67',
    length: 2,
    ack: buffer.substr(0, 2) === '06'
  };

  if (buffer.length < response.length) {
    return undefined;
  }
  return response;
};
parsers['67'] = parseResetTheIm;

const parseSetInsteonAckMessageByte = buffer => {
  const response = {
    received: moment().toISOString(),
    command: 'Reset the IM',
    code: '68',
    length: 4,
    command2Data: buffer.substr(0, 2),
    ack: buffer.substr(2, 2) === '06'
  };

  if (buffer.length < response.length) {
    return undefined;
  }
  return response;
};
parsers['68'] = parseSetInsteonAckMessageByte;

const matchAllLinkRecordResponse = command => command.code === '57';

const parseGetFirstAllLinkRecord = buffer => {
  const response = {
    received: moment().toISOString(),
    command: 'Get First ALL-Link Record',
    code: '69',
    length: 2,
    ack: buffer.substr(0, 2) === '06'
  };

  if (buffer.length < response.length) {
    return undefined;
  }
  response.responseMatcher = matchAllLinkRecordResponse;
  return response;
};
parsers['69'] = parseGetFirstAllLinkRecord;

const parseGetNextAllLinkRecord = buffer => {
  const response = {
    received: moment().toISOString(),
    command: 'Get Next ALL-Link Record',
    code: '6A',
    length: 2,
    ack: buffer.substr(0, 2) === '06'
  };

  if (buffer.length < response.length) {
    return undefined;
  }
  response.responseMatcher = matchAllLinkRecordResponse;
  return response;
};
parsers['6A'] = parseGetNextAllLinkRecord;

const parseSetImConfiguration = buffer => {
  const response = {
    received: moment().toISOString(),
    command: 'Set IM Configuration',
    code: '6B',
    length: 4,
    imConfigurationFlags: parseImConfigurationFlags(buffer.substr(0, 2)),
    ack: buffer.substr(2, 2) === '06'
  };

  if (buffer.length < response.length) {
    return undefined;
  }
  return response;
};
parsers['6B'] = parseSetImConfiguration;

const parseGetAllLinkRecordForSender = buffer => {
  const response = {
    received: moment().toISOString(),
    command: 'Get ALL-Link Record for Sender',
    code: '6C',
    length: 2,
    ack: buffer.substr(0, 2) === '06'
  };

  if (buffer.length < response.length) {
    return undefined;
  }
  return response;
};
parsers['6C'] = parseGetAllLinkRecordForSender;

const parseLedOn = buffer => {
  const response = {
    received: moment().toISOString(),
    command: 'LED On',
    code: '6D',
    length: 2,
    ack: buffer.substr(0, 2) === '06'
  };

  if (buffer.length < response.length) {
    return undefined;
  }
  return response;
};
parsers['6D'] = parseLedOn;

const parseLedOff = buffer => {
  const response = {
    received: moment().toISOString(),
    command: 'LED Off',
    code: '6E',
    length: 2,
    ack: buffer.substr(0, 2) === '06'
  };

  if (buffer.length < response.length) {
    return undefined;
  }
  return response;
};
parsers['6E'] = parseLedOff;

const parseManageAllLinkRecord = buffer => {
  const response = {
      received: moment().toISOString(),
      command: 'Manage ALL-Link Record',
      code: '6F',
      length: 20,
      controlCode: ALL_LINK_CONTROL_NAMES[buffer.substr(0, 2)] ||
        buffer.substr(0, 2),
      ack: buffer.substr(18, 2) === '06'
    };

  if (buffer.length < response.length) {
    return undefined;
  }
  Object.assign(response, parseAllLinkRecord(buffer.substr(2, 16)));

  return response;
};
parsers['6F'] = parseManageAllLinkRecord;

const parseSetInsteonNakMessageByte = buffer => {
  const response = {
    received: moment().toISOString(),
    command: 'Set INSTEON NAK Message Byte',
    code: '70',
    length: 4,
    command2Data: buffer.substr(0, 2),
    ack: buffer.substr(4, 2) === '06'
  };

  if (buffer.length < response.length) {
    return undefined;
  }
  return response;
};
parsers['70'] = parseSetInsteonNakMessageByte;

const parseSetInsteonAckMessageTwoBytes = buffer => {
  const response = {
    received: moment().toISOString(),
    command: 'Set INSTEON ACK Message Two Bytes',
    code: '71',
    length: 6,
    command1Data: buffer.substr(0, 2),
    command2Data: buffer.substr(2, 2),
    ack: buffer.substr(4, 2) === '06'
  };

  if (buffer.length < response.length) {
    return undefined;
  }
  return response;
};
parsers['71'] = parseSetInsteonAckMessageTwoBytes;

const parseRfSleep = buffer => {
  const response = {
    received: moment().toISOString(),
    command: 'RF Sleep',
    code: '72',
    length: 2,
    ack: buffer.substr(0, 2) === '06'
  };

  if (buffer.length < response.length) {
    return undefined;
  }
  return response;
};
parsers['72'] = parseRfSleep;

const parseGetImConfiguration = buffer => {
  const response = {
    received: moment().toISOString(),
    command: 'Get IM Configuration',
    code: '73',
    length: 8,
    imConfigurationFlags: parseImConfigurationFlags(buffer.substr(0, 2)),
    spare: buffer.substr(2, 4),
    ack: buffer.substr(6, 2) === '06'
  };

  return response;
};
parsers['73'] = parseGetImConfiguration;

const parseCancelCleanup = buffer => {
  const response = {
    received: moment().toISOString(),
    command: 'Cancel Cleanup',
    code: '74',
    length: 4,
    ack: buffer.substr(0, 2) === '06'
  };

  return response;
};
parsers['74'] = parseCancelCleanup;

const parseRead8BytesFromDatabase = buffer => {
  const response = {
    received: moment().toISOString(),
    command: 'Read 8 bytes from Database',
    code: '75',
    length: 22,
    address: buffer.substr(0, 4),
    ack: buffer.substr(4, 2) === '06'
  };

  if (buffer.length < response.length) {
    return undefined;
  }
  Object.assign(response, parseAllLinkRecord(buffer.substr(6, 16)));

  return response;
};
parsers['75'] = parseRead8BytesFromDatabase;

const parseWrite8BytesToDatabase = buffer => {
  const response = {
    received: moment().toISOString(),
    command: 'Write 8 bytes to Database',
    code: '76',
    length: 22,
    address: buffer.substr(0, 4),
    ack: buffer.substr(20, 2) === '06'
  };

  if (buffer.length < response.length) {
    return undefined;
  }
  Object.assign(response, parseAllLinkRecord(buffer.substr(4, 16)));

  return response;
};
parsers['76'] = parseWrite8BytesToDatabase;

const parseBeep = buffer => {
  const response = {
    received: moment().toISOString(),
    command: 'Beep',
    code: '77',
    length: 4,
    data: buffer.substr(0, 2),
    ack: buffer.substr(2, 2) === '06'
  };

  if (buffer.length < response.length) {
    return undefined;
  }
  return response;
};
parsers['77'] = parseBeep;

const parseSetStatus = buffer => {
  const response = {
    received: moment().toISOString(),
    command: 'Set Status',
    code: '78',
    length: 4,
    status: buffer.substr(0, 2),
    ack: buffer.substr(2, 2) === '06'
  };

  if (buffer.length < response.length) {
    return undefined;
  }
  return response;
};
parsers['78'] = parseSetStatus;

const parseSetDatabaseLinkDataForNextLink = buffer => {
  const response = {
    received: moment().toISOString(),
    command: 'Set Database Link Data for next Link',
    code: '79',
    length: 8,
    data: buffer.substr(0, 6),
    ack: buffer.substr(6, 2) === '06'
  };

  if (buffer.length < response.length) {
    return undefined;
  }
  return response;
};
parsers['79'] = parseSetDatabaseLinkDataForNextLink;

const parseSetApplicationRetriesForNewLinks = buffer => {
  const response = {
    received: moment().toISOString(),
    command: 'Set Application Retries for New Links',
    code: '7A',
    length: 4,
    retries: parseInt(buffer.substr(0, 2), 16),
    ack: buffer.substr(2, 2) === '06'
  };

  if (buffer.length < response.length) {
    return undefined;
  }
  return response;
};
parsers['7A'] = parseSetApplicationRetriesForNewLinks;

const parseSignedInt = str => {
  const value = parseInt(str, 16);
  if (value > 127) {
    return value - 256;
  }
  return value;
};

const parseSetRfFrequencyOffset = buffer => {
  const response = {
    received: moment().toISOString(),
    command: 'Set RF Frequency Offset',
    code: '7B',
    length: 4,
    refFrequencyOffset: parseSignedInt(buffer.substr(0, 2)),
    ack: buffer.substr(2, 2) === '06'
  };

  if (buffer.length < response.length) {
    return undefined;
  }
  return response;
};
parsers['7B'] = parseSetRfFrequencyOffset;

const parseSetAcknowledgeForTemplincCommand = buffer => {
  const response = {
    received: moment().toISOString(),
    command: 'Set Acknowledge for TempLinc command',
    code: '7C',
    length: 18,
    acknowledge: buffer.substr(0, 16),
    ack: buffer.substr(16, 2) === '06'
  };

  if (buffer.length < response.length) {
    return undefined;
  }
  return response;
};
parsers['7C'] = parseSetAcknowledgeForTemplincCommand;

const parse7f = buffer => {
  const response = {
    received: moment().toISOString(),
    command: '7F Command',
    code: '7F',
    length: 4,
    data: buffer.substr(0, 2),
    ack: buffer.substr(2, 2) === '06'
  };

  if (buffer.length < response.length) {
    return undefined;
  }
  return response;
};
parsers['7F'] = parse7f;

module.exports = parsers;
