'use strict';

// Also look at
//   2475SDBdev-112011-en.pdf
//   2477Sdev-072012-en.pdf
//   2663-222dev-062014-en.pdf
//   2845-222dev-102013-en.pdf
// 2477D, 2477DH, 2477S, 2663-222, 2845-222
const _ = require('lodash'),
  {INSTEON_MESSAGE_TYPES, OUTLET_CODES, ALL_LINK_CODES, OPERATING_FLAGS} =
    require('./constants'),
  encoders = {},

  toHex = (value = 0, length = 2) => value.toString(16)
    .padStart(length, '0').toUpperCase().substr(0, length),

  toHexSigned = (value = 0, length = 2) => (value < 0) ?
    toHex(value + Math.pow(2, length * 4), length) :
    toHex(value, length),

  encodeHex = property => command => toHex(command[property] || 0),

  encodeMessageFlags = command => {
    const messageType = INSTEON_MESSAGE_TYPES.indexOf(command.messageType) << 5,
      extendedMessage = (command.extendedMessage ? 1 : 0) << 4,
      hopsLeft = (_.isNumber(command.hopsLeft) ? command.hopsLeft : 3) << 2,
      maxHops = _.isNumber(command.maxHops) ? command.maxHops : 3,
      byte = messageType + extendedMessage + hopsLeft + maxHops;
    return toHex(byte);
  },

  encodeOnLevel = (onLevel = 0) => {
    if (onLevel < 0) {
      return '0';
    }
    if (onLevel > 255) {
      return 'F';
    }
    return toHex(onLevel).substr(0, 1);
  },

  // ramp rate 0-1F 0.1 to 9 minutes
  encodeRampRate = (rampRate = 0) => {
    if (rampRate < 0) {
      return '0';
    }
    if (rampRate > 31) {
      return 'F';
    }
    return toHex(Math.floor((rampRate - 1) / 2 + 0.5), 1);
  },

  encodeOutlet = command => OUTLET_CODES[command.outlet],

  encodeOperatingFlag = command => OPERATING_FLAGS[command.flag],

  encodeDirection = command => command.direction === 'up' ? '01' : '00',

  encodeOnLevelAndRampRate = command =>
    encodeOnLevel(command.onLevel) + encodeRampRate(command.rampRate),

  sendInsteonStandardLengthMessage = command => {
    return '0262' +
      command.toAddress +
      encodeMessageFlags(command) +
      command.command1 +
      (command.command2 || '00');
  },

  crcByte = (messageBytes) => {
    const allBytes = messageBytes.match(/.{1,2}/g).reduce(
      (sum, byte) => sum + parseInt(byte, 16),
      0
    );
    return toHex(((~allBytes) + 1) & 0xFF);
  },

  encodeEdCommandWithCrc = command => {
    const messageBytes = (command.command1 + (command.command2 || '00') +
                          (command.userData || '').padEnd(26, '0')).substr(0, 30);
    return messageBytes + crcByte(messageBytes);
  },

  sendInsteonExtendedLengthMessage = command => {
    return '0262' +
      command.toAddress +
      encodeMessageFlags(Object.assign({extendedMessage: true}, command)) +
      encodeEdCommandWithCrc(command);
  },

  sd = (name, command1, command2 = '00') => {
    const encoder = command => sendInsteonStandardLengthMessage({
      messageType: 'direct',
      toAddress: command.toAddress,
      command1,
      command2: _.isFunction(command2) ? command2(command) : command2,
      hopsLeft: command.hopsLeft,
      maxHops: command.maxHops
    });
    encoder.type = 'SD';
    encoder.commandName = name;
    encoders[name] = encoder;
  },

  ed = (name, command1, command2 = '00', userData = '') => {
    const encoder = command => sendInsteonExtendedLengthMessage({
      messageType: 'direct',
      toAddress: command.toAddress,
      command1,
      command2: _.isFunction(command2) ? command2(command) : command2,
      userData: _.isFunction(userData) ? userData(command) : userData,
      hopsLeft: command.hopsLeft,
      maxHops: command.maxHops
    });
    encoder.type = 'ED';
    encoder.commandName = name;
    encoders[name] = encoder;
  },

  sa = (name, command1, command2 = '00') => {
    const encoder = command => sendInsteonStandardLengthMessage({
      messageType: 'allLinkBroadcast',
      toAddress: '000001',
      command1,
      command2: _.isFunction(command2) ? command2(command) : command2,
      hopsLeft: command.hopsLeft,
      maxHops: command.maxHops
    });
    encoder.type = 'SA';
    encoder.commandName = name;
    encoders[name] = encoder;
  },

  sb = (name, command1, command2 = '00') => {
    const encoder = command => sendInsteonStandardLengthMessage({
      messageType: 'broadcast',
      toAddress: command.toAddress || '000000',
      command1,
      command2: _.isFunction(command2) ? command2(command) : command2,
      hopsLeft: command.hopsLeft,
      maxHops: command.maxHops
    });
    encoder.type = 'SD';
    encoder.commandName = name;
    encoders[name] = encoder;
  },

  im = (name, code, data) => {
    const encoder = command =>
      '02' + code + (_.isFunction(data) ? data(command) : '');
    encoder.type = 'IM';
    encoder.commandName = name;
    encoders[name] = encoder;
  },

  encodeCommand = command => {
    const encoder = encoders[command.command];
    if (encoder) {
      return encoder(command);
    }
    return '';
  };


// Modem commands
im('Get IM Info', '60');
im('Send ALL-Link Command', '61', command =>
  toHex(command.groupNumber) +
  command.allLinkCommand +
             (command.command2 || '00'));
im('Send INSTEON Standard-length Message', '62', command =>
  command.toAddress +
  encodeMessageFlags(Object.assign({extendedMessage: true}, command)) +
  encodeEdCommandWithCrc(command));

im('Send INSTEON Extended-length Message', '62', command =>
  command.toAddress +
  encodeMessageFlags(Object.assign({extendedMessage: true}, command)) +
  encodeEdCommandWithCrc(command));
// 63 TODO: Send X10
im('Start ALL-Linking', '64', command =>
   (ALL_LINK_CODES[command.allLinkType] || '00') + toHex(command.groupNumber));
im('Cancel ALL-Linking', '65');
im('Set Host Device Category', '66', command =>
  (command.deviceCategory || '00') +
  (command.deviceSubcategory || '00') +
  (command.firmware || '00'));
im('Reset the IM', '67');
im('Set INSTEON ACK Message Byte', '68', command =>
  (command.command2Data || '00'));
im('Get First ALL-Link Record', '69');
im('Get Next ALL-Link Record', '6A');
// 6B TODO: Set IM Configuration
im('Get ALL-Link Record for Sender', '6C');
im('LED On', '6D');
im('LED Off', '6E');
// 6F TODO: Manage ALL-Link Record
im('Set INSTEON NAK Message Byte', '70', command =>
  (command.command2Data || '00'));
im('Set INSTEON ACK Message Two Bytes', '71', command =>
  (command.command1Data || '00') +
  (command.command2Data || '00'));
im('RF Sleep', '72');
im('Get IM Configuration', '73');
im('Cancel Cleanup', '74', () => '00');
im('Read 8 bytes from Database', '75', command =>
  command.address.padStart(4, '0').substr(0, 4));
// 76 TODO: Write 8 bytes to Database
im('Beep', '77', () => '00');
im('Set Status', '78', command => (command.status || '00'));
im('Set Database Link Data for next Link', '79', command =>
  (command.data || '').padEnd(6, '0'));
im('Set Application Retries for New Links', '7A', command =>
  toHex(command.retries));
im('Set RF Frequency Offset', '7B', command =>
  toHexSigned(command.refFrequencyOffset));
im('Set RF Frequency Offset', '7C', command =>
  command.acknowledge.padEnd(16, '0').substr(0, 16));
// 7D TODO: unknown
// 7E TODO: unknown
im('7F Command', '7F', command => (command.data || '00'));


// Standard-length Direct Commands
// 00 Reserved
sd('Assign to ALL-Link Group', '01', encodeHex('groupNumber'));
sd('Delete from ALL-Link Group', '02', encodeHex('groupNumber'));
sd('Product Data Request', '03', '00');
sd('FX Username Request', '03', '01');
sd('Device Text String Request', '03', '02');
// 04-08 Reserved
sd('Enter Linking Mode', '09', encodeHex('groupNumber'));
sd('Enter Unlinking Mode', '0A', encodeHex('groupNumber'));
// 0B-0C Reserved
sd('Get INSTEON Engine Version', '0D', '00');
// 0E Reserved
sd('Ping', '0F');
sd('ID Request', '10');
sd('Light ON', '11', encodeHex('onLevel'));
sd('Light ON Fast', '12', encodeHex('onLevel'));
sd('Light OFF', '13');
sd('Light OFF Fast', '14');
sd('Light Brighten One Step', '15');
sd('Light Dim One Step', '16');
sd('Light Start Manual Change', '17', encodeDirection);
sd('Light Stop Manual Change', '18');
sd('Light Status On-Level Request', '19', '00');
sd('Light Status LED Request', '19', '01');
sd('Outlet Status Request', '19', '01');
sd('Light Status Request 02', '19', '02');
// 1A-1E Reserved
sd('Get Operating Flags', '1F', '00');
sd('Get ALL-Link Database Delta', '1F', '01');
sd('Get Signal-to-Noise Value', '1F', '02');
sd('Set Operating Flags', '20', encodeOperatingFlag);
sd('Light Instant Change', '21', encodeHex('onLevel'));
sd('Light Manually Turned Off', '22');
sd('Light Manually Turned On', '23');
// Deprecated
sd('Reread Init Values', '24');
sd('Remote SET Button Tap', '25', '01');
sd('Remote SET Button Tap Twice', '25', '02');
// 26 Reserved
sd('Light Set Status', '27', encodeHex('onLevel'));
// 28-2D Deprecated
sd('Light ON at Ramp Rate', '2E', encodeOnLevelAndRampRate);
// 2F-31 Reserved
sd('Outlet ON', '32', encodeOutlet);
sd('Outlet OFF', '33', encodeOutlet);
// 34-3F Reserved


// Extended-length Direct Commands
ed('Read ALL-Link Database', '2F');


// All-LINK Broadcast Commands
sa('ALL-Link Alias 1 Low', '13');

// Standard-length Broadcast Commands
sb('Test Powerline Phase A', '0300');
sb('Test Powerline Phase B', '0301');


encodeCommand.encoders = encoders;
module.exports = encodeCommand;
