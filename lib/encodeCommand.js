'use strict';

// Also look at
//   2475SDBdev-112011-en.pdf
//   2477Sdev-072012-en.pdf
//   2663-222dev-062014-en.pdf
//   2845-222dev-102013-en.pdf
// 2477D, 2477DH, 2477S, 2663-222, 2845-222
const {INSTEON_MESSAGE_TYPES, OUTLET_CODES, ALL_LINK_CODES, OPERATING_FLAGS} =
    require('./constants'),
  encoders = {},
  commandResponseMatchers = {},

  commandResponseMatcher = command =>
    (commandResponseMatchers[command.command] || (response => {
      /* eslint no-console: "off" */
      console.warn(`no matcher for command ${command.command}`, response);
      return false;
    })),

  toHex = (value, length = 2) => value.toString(16)
    .padStart(length, '0').toUpperCase().substr(0, length),

  toHexSigned = (value, length = 2) => (value < 0) ?
    toHex(value + Math.pow(2, length * 4), length) :
    toHex(value, length),

  encodeHex = property => command => toHex(command[property] || 0),

  encodeMessageFlags = command => {
    const messageType = INSTEON_MESSAGE_TYPES.indexOf(command.messageType) << 5,
      extendedMessage = (command.extendedMessage ? 1 : 0) << 4,
      hopsLeft = (typeof command.hopsLeft == 'number' ? command.hopsLeft : 3) << 2,
      maxHops = typeof command.maxHops == 'number' ? command.maxHops : 3,
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

  encodeX10Address = command =>
    toHex(command.groupNumber) +
    '04' +
    toHex(command.houseCode) +
    toHex(command.unitCode),

  // encodeLEDBrightness = command =>
  //   '00' +
  //   '07' +
  //   toHex(command.ledBrightness),

  encodeTriggerGroupInfo = command =>
    toHex(command.groupNumber) +
    (command.useLocalOnLevel ? '00' : '01') +
    toHex(command.onLevel) +
    '3000' +
    (command.useLocalRampRate ? '00' : '01'),

  encodeDatabaseRange = command => {
    return '00' +
    '00' +
    (command.address ? command.address.substr(0, 2) : '00') +
    (command.address ? command.address.substr(2, 2) : '00') +
      (command.numberRecords ? toHex(command.numberRecords) : '00');
  },

  encodeImConfigurationFlags = flags => {
    const disableAutomaticLinking =
        (flags.disableAutomaticLinking ? 1 : 0) << 7,
      monitorMode = (flags.monitorMode ? 1 : 0) << 6,
      disableAutomaticLed = (flags.disableAutomaticLed ? 1 : 0) << 5,
      disableHostComunications = (flags.disableHostComunications ? 1 : 0) << 4,
      reserved = (flags.reserved || 0) & 0xF,

      byte = disableAutomaticLinking + monitorMode + disableAutomaticLed +
        disableHostComunications + reserved;
    return toHex(byte);
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


  im = (name, code, data, matcher) => {
    const encoder = command =>
      '02' + code + (typeof data === 'function' ? data(command) : '');
    encoder.type = 'IM';
    encoder.commandName = name;
    encoders[name] = encoder;
    commandResponseMatchers[name] = matcher ||
      (response => response.command === name);
  },

  sd = (name, command1, command2 = '00') => {
    const encoder = command =>
      /* eslint no-nested-ternary: "off" */
      encoders['Send INSTEON Standard-length Message']({
        messageType: 'direct',
        toAddress: command.toAddress,
        command1,
        command2: typeof command2 === 'function' ?
          command2(command) :
          (command2 === '00' && command.command2 ? command.command2 : command2),
        hopsLeft: command.hopsLeft,
        maxHops: command.maxHops
      });
    encoder.type = 'SD';
    encoder.commandName = name;
    encoders[name] = encoder;
    commandResponseMatchers[name] = response => (
      response.command === 'INSTEON Standard Message Received' &&
        response.insteonCommand &&
        response.insteonCommand.command === name
    );
  },

  ed = (name, command1, command2 = '00', userData = '', matcher) => {
    const encoder = command => {
      return encoders['Send INSTEON Extended-length Message']({
        messageType: 'direct',
        toAddress: command.toAddress,
        command1,
        command2: typeof command2 === 'function' ? command2(command) : command2,
        userData: typeof userData === 'function' ? userData(command) : userData,
        hopsLeft: command.hopsLeft,
        maxHops: command.maxHops
      });
    };
    encoder.type = 'ED';
    encoder.commandName = name;
    encoders[name] = encoder;
    commandResponseMatchers[name] = matcher || (response => (
      response.command === 'INSTEON Standard Message Received' &&
        response.command1 === command1 &&
        response.command2 === command2
    ));
  },

  sa = (name, command1, command2 = '00') => {
    const encoder = command =>
      encoders['Send INSTEON Extended-length Message']({
        messageType: 'allLinkBroadcast',
        toAddress: '000001',
        command1,
        command2: typeof command2 === 'function' ? command2(command) : command2,
        hopsLeft: command.hopsLeft,
        maxHops: command.maxHops
      });
    encoder.type = 'SA';
    encoder.commandName = name;
    encoders[name] = encoder;
  },

  sb = (name, command1, command2 = '00') => {
    const encoder = command =>
      encoders['Send INSTEON Extended-length Message']({
        messageType: 'broadcast',
        toAddress: command.toAddress || '000000',
        command1,
        command2: typeof command2 === 'function' ? command2(command) : command2,
        hopsLeft: command.hopsLeft,
        maxHops: command.maxHops
      });
    encoder.type = 'SD';
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
  encodeMessageFlags(command) +
  command.command1 +
  (command.command2 || '00'));
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
// TODO: adjust timeout since this can take 20 secs to return
im('Reset the IM', '67');
im('Set INSTEON ACK Message Byte', '68', command =>
  (command.command2Data || '00'));
im('Get First ALL-Link Record', '69', '', response =>
  response.command === 'Get First ALL-Link Record' && !response.ack ||
  response.command === 'ALL-Link Record Response');
im('Get Next ALL-Link Record', '6A', '', response =>
  response.command === 'Get Next ALL-Link Record' && !response.ack ||
  response.command === 'ALL-Link Record Response');
im('Set IM Configuration', '6B', command =>
  encodeImConfigurationFlags(command.imConfigurationFlags));
im('Get ALL-Link Record for Sender', '6C', '', response =>
  response.command === 'Get ALL-Link Record for Sender' && !response.ack ||
  response.command === 'ALL-Link Record Response');
im('IM LED On', '6D');
im('IM LED Off', '6E');
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
  command.address.padStart(4, '0').substr(0, 4), response =>
  response.command === 'Read 8 bytes from Database' && !response.ack ||
    response.command === 'Database Record Found');
// 76 TODO: Write 8 bytes to Database
// Note: the documentation does not mention the 00 byte
im('Beep IM', '77', () => '00');
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
im('7F Command', '7F', command =>
  (command.data ? command.data.padStart(2, '0').substr(0, 2) : '00'));


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
sd('Get Operating Flags 2', '1F', '05');
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
// 2F Reserved
sd('Beep Device', '30');
// 31 Reserved
sd('Outlet ON', '32', encodeOutlet);
sd('Outlet OFF', '33', encodeOutlet);
// 34-3F Reserved


// Extended-length Direct Commands
ed('Remote Enter Linking Mode', '09', encodeHex('groupNumber'));
ed('Remote Enter Unlinking Mode', '0A', encodeHex('groupNumber'));

ed('ON (Bottom Outlet)', '11', encodeHex('onLevel'), '02');

ed('OFF (Bottom Outlet)', '13', '00', '02');

ed('Programming Lock On', '20', '00');
ed('Programming Lock Off', '20', '01');
ed('LED Blink on Traffic On', '20', '02');
ed('LED Blink on Traffic Off', '20', '03');
ed('Beeper On', '20', '04');
ed('Resume Dim On', '20', '04');
ed('Load Sense On (Bottom Outlet)', '20', '04');
ed('Resume Dim Off', '20', '05');
ed('Beeper Off', '20', '05');
ed('Load Sense Off (Bottom Outlet)', '20', '05');
ed('Stay Awake On', '20', '06');
ed('8-Key KeypadLinc', '20', '06');
ed('Load Sense On (Top Outlet)', '20', '06');
ed('Stay Awake Off', '20', '07');
ed('6-Key KeypadLinc', '20', '07');
ed('Load Sense Off (Top Outlet)', '20', '07');
ed('Listen Only Off', '20', '08');
ed('LED Off', '20', '08');
ed('Listen Only On', '20', '09');
ed('LED On', '20', '09');
ed('No I\'m Alive On', '20', '0A');
ed('Keybeep On', '20', '0A');
ed('No I\'m Alive Off', '20', '0B');
ed('Keybeep Off', '20', '0B');
ed('RF Off', '20', '0C');
ed('RF On', '20', '0D');
ed('Powerline Off', '20', '0E');
ed('Powerline On', '20', '0F');
ed('X10 Off', '20', '12');
ed('X10 On', '20', '13');
ed('Error Blink Off', '20', '14');
ed('Error Blink On', '20', '15');
ed('Cleanup Report Off', '20', '16');
ed('Cleanup Report On', '20', '17');
ed('Smart Hops On', '20', '1C');
ed('Smart Hops Off', '20', '1D');

ed('Get for Group/Button', '2E', '00', encodeHex('groupNumber'));
ed('Set X10 Address', '2E', '00', encodeX10Address);
ed('Set Ramp Rate', '2E', '00', command => '0005' + encodeRampRate(command.rampRate));
ed('Set On Level', '2E', '00', command => '0006' + toHex(command.onLevel));
ed('Set LED Brightness', '2E', '00', command => '0007' + toHex(command.ledBrightness));

ed('Read ALL-Link Database', '2F', '00', encodeDatabaseRange);
// TODO: implement
// ed('Write ALL-Link Database', '2F', '00', encodeWriteDatabaseRange);
ed('Trigger Group', '30', '00', encodeTriggerGroupInfo);

// All-LINK Broadcast Commands
sa('ALL-Link Alias 1 Low', '13');

// Standard-length Broadcast Commands
sb('Test Powerline Phase A', '0300');
sb('Test Powerline Phase B', '0301');

// TODO: remove after moving to plm2
encodeCommand.encoders = encoders;
exports.encodeCommand = encodeCommand;
exports.commandResponseMatcher = commandResponseMatcher;
