'use strict';
const _ = require('lodash'),
  { X10_COMMANDS, X10_HOUSE_CODES, X10_UNIT_CODES, INSTEON_MESSAGE_TYPES,
    ALL_LINK_CONTROL_CODES, OUTLET_CODES, LINK_CODES,
    OPERATING_FLAGS } = require('./constants'),
  encoders = {};

const toHex = (value = 0, length = 2) => value.toString(16)
        .padStart(length, '0').toUpperCase().substr(0, length);
const toHexSigned = (value = 0, length = 2) => (value < 0) ?
        toHex(value + Math.pow(2, length * 4), length) :
        toHex(value, length);
const encodeMessageFlags = command => {
  const messageType = INSTEON_MESSAGE_TYPES.indexOf(command.messageType) << 5,
    extendedMessage = (command.extendedMessage ? 1 : 0) << 4,
    hopsLeft = (_.isNumber(command.hopsLeft) ? command.hopsLeft : 3) << 2,
    maxHops = _.isNumber(command.maxHops) ? command.maxHops : 3,
    byte = messageType + extendedMessage + hopsLeft + maxHops;
  return toHex(byte);
};

const sendInsteonStandardLengthMessage = command => {
  return '0262' +
    command.toAddress +
    encodeMessageFlags(command) +
    command.command1 +
    (command.command2 || '00');
};

const crcByte = (messageBytes) => {
  let sum = messageBytes.match(/.{1,2}/g).reduce(
    (sum, byte) => sum + parseInt(byte, 16),
    0
  );
  return toHex(((~ sum) + 1) & 0xFF);
};

const sendInsteonExtendedLengthMessage = command => {
  const messageBytes = (command.command1 + (command.command2 || '00') +
                        (command.userData || '').padEnd(26, '0')).substr(0, 30);
  return '0262' +
    command.toAddress +
    encodeMessageFlags(Object.assign({extendedMessage: true}, command)) +
    messageBytes + 
    crcByte(messageBytes);
};

encoders['Get IM Info'] = () => '0260';
encoders['Send ALL-Link Command'] = command => '0261' +
  toHex(command.groupNumber) +
  command.allLinkCommand +
  (command.command2 || '00');
encoders['Send INSTEON Standard-length Message'] =
  sendInsteonStandardLengthMessage;
encoders['Send INSTEON Extended-length Message'] = 
  sendInsteonExtendedLengthMessage;
// 63 TODO: Send X10
encoders['Start ALL-Linking'] = command => '0264' +
  (LINK_CODES[command.allLinkType] || '00') +
  toHex(command.groupNumber);
encoders['Cancel ALL-Linking'] = () => '0265';
encoders['Set Host Device Category'] = command => '0266' +
  (command.deviceCategory || '00') +
  (command.deviceSubcategory || '00') +
  (command.firmware || '00');
encoders['Reset the IM'] = () => '0267';
encoders['Set INSTEON ACK Message Byte'] = command => '0268' +
  (command.command2Data || '00');
encoders['Get First ALL-Link Record'] = () => '0269';
encoders['Get Next ALL-Link Record'] = () =>  '026A';
// 6B TODO: Set IM Configuration
encoders['Get ALL-Link Record for Sender'] = () => '026C';
encoders['LED On'] = () => '026D';
encoders['LED Off'] = () => '026E';
// 6F TODO: Manage ALL-Link Record
encoders['Set INSTEON NAK Message Byte'] = command => '0270' +
  (command.command2Data || '00');
encoders['Set INSTEON ACK Message Two Bytes'] = command => '0271' +
  (command.command1Data || '00') +
  (command.command2Data || '00');
encoders['RF Sleep'] = () =>  '0272';
encoders['Get IM Configuration'] = () => '0273';
encoders['Cancel Cleanup'] = () => '027400';
encoders['Read 8 bytes from Database'] = command => '0275' +
  command.address.padStart(4, '0').substr(0, 4);
// 76 TODO: Write 8 bytes to Database
encoders['Beep'] = () => '027700';
encoders['Set Status'] = command => '027F' +
  (command.status || '00');
encoders['Set Database Link Data for next Link'] = command => '0279' +
  (command.data || '').padEnd(6, '0');
encoders['Set Application Retries for New Links'] = command => '027A' +
  toHex(command.retries);
encoders['Set RF Frequency Offset'] = command => '027B' +
  toHexSigned(command.refFrequencyOffset);
encoders['Set RF Frequency Offset'] = command => '027C' +
  command.acknowledge.padEnd(16, '0').substr(0, 16);
// 7D TODO: unknown
// 7E TODO: unknown
encoders['7F Command'] = command => '027F' +
  (command.data || '00');

const sd = (command, command1, command2 = '00') => {
  return sendInsteonStandardLengthMessage({
    messageType: 'direct',
    toAddress: command.toAddress,
    command1,
    command2
  });
};
const ed = (command, command1, command2 = '00', userData = '') =>
  sendInsteonExtendedLengthMessage({
    messageType: 'direct',
    toAddress: command.toAddress,
    command1,
    command2,
    userData
  });
const sa = (command1, command2 = '00') => {
  return sendInsteonStandardLengthMessage({
    messageType: 'allLinkBroadcast',
    toAddress: '000001',
    command1,
    command2
  });
};

const sdWithGroup = (command, command1) => sd(
  command,
  command1,
  toHex(command.groupNumber)
);

// Standard-length Direct Commands
// 00 Reserved
encoders['Assign to ALL-Link Group'] = command =>
  sdWithGroup(command, '01');
encoders['Delete from ALL-Link Group'] = command =>
  sdWithGroup(command, '02');
encoders['Product Data Request'] = command =>
  sd(command, '03', '00');
encoders['FX Username Request'] = command =>
  sd(command, '03', '01');
encoders['Device Text String Request'] = command =>
  sd(command, '03', '02');
// 04-08 Reserved
encoders['Enter Linking Mode'] = command =>
  sdWithGroup(command, '09');
encoders['Enter Unlinking Mode'] = command =>
  sdWithGroup(command, '0A');
// 0B-0C Reserved
encoders['Get INSTEON Engine Version'] = command =>
  sd(command, '0D', '00');
// 0E Reserved
encoders['Ping'] = command =>
  sd(command, '0F');
encoders['ID Request'] = command =>
  sd(command, '10');
encoders['Light ON'] = command =>
  sd(command, '11', command.onLevel || '00');
encoders['Light ON Fast'] = command =>
  sd(command, '12', command.onLevel || '00');
encoders['Light OFF'] = command =>
  sd(command, '13');
encoders['Light OFF Fast'] = command =>
  sd(command, '14');
encoders['Light Brighten One Step'] = command =>
  sd(command, '15');
encoders['Light Dim One Step'] = command =>
  sd(command, '16');
encoders['Light Start Manual Change'] = command =>
  sd(command, '17', command.direction === 'up' ? '01' : '00');
encoders['Light Stop Manual Change'] = command =>
  sd(command, '18');
encoders['Light Status On-Level Request'] = command =>
  sd(command, '19', '00');
encoders['Light Status LED Request'] = command =>
  sd(command, '19', '01');
encoders['Outlet Status Request'] = command =>
  sd(command, '19', '01');
// 1A-1E Reserved
encoders['Get Operating Flags'] = command =>
  sd(command, '1F', '00');
encoders['Get ALL-Link Database Delta'] = command =>
  sd(command, '1F', '01');
encoders['Get Signal-to-Noise Value'] = command =>
  sd(command, '1F', '02');
encoders['Set Operating Flags'] = command =>
  sd(command, '20', OPERATING_FLAGS[command.flag]);
encoders['Light Instant Change'] = command =>
  sd(command, '21', command.onLevel || '00');
encoders['Light Manually Turned Off'] = command =>
  sd(command, '22');
encoders['Light Manually Turned On'] = command =>
  sd(command, '23');
// 24 Deprecated
encoders['Remote SET Button Tap'] = command =>
  sd(command, '25', '01');
encoders['Remote SET Button Tap Twice'] = command =>
  sd(command, '25', '02');
// 26 Reserved
encoders['Light Set Status'] = command =>
  sd(command, '27', command.onLevel || '00');
// 28-2D Deprecated
// ramp rate 0-1F 0.1 to 9 minutes
const encodeOnLevel = (onLevel = 0) => {
  if (onLevel < 0) {
    return '0';
  }
  if (onLevel > 255) {
    return 'F';
  }
  return toHex(onLevel).substr(0, 1);
};
const encodeRampRate = (rampRate = 0) => {
  if (rampRate < 0) {
    return '0';
  }
  if (rampRate > 31) {
    return 'F';
  }
  return toHex(Math.floor((rampRate - 1) / 2 + 0.5), 1);
};

encoders['Light ON at Ramp Rate'] = command =>
  sd(command, '2E', encodeOnLevel(command.onLevel) +
     encodeRampRate(command.rampRate));
// 2F-31 Reserved
encoders['Outlet ON'] = command =>
  sd(command, '32', OUTLET_CODES[command.outlet]);
encoders['Outlet OFF'] = command =>
  sd(command, '33', OUTLET_CODES[command.outlet]);
// 34-3F Reserved

encoders['Read ALL-Link Database'] = command =>
  ed(command, '2F');

encoders['ALL-Link Alias 1 Low'] = () =>
  sa('13');


const encodeCommand = command => {
  const encoder = encoders[command.command];
  if (encoder) {
    return encoder(command);
  }
  return '';
};

module.exports = encodeCommand;
