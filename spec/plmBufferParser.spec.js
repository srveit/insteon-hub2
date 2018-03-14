'use strict';
const {createPlmBufferParser} = require('../lib/plmBufferParser'),
  deviceNames = {
    511234: 'hub controller',
    'im-hub': 'hub controller',

    521234: 'porch outlets',
    531234: 'Garage lights',
    541234: 'foyer lamps switch',
    551234: 'foyer chandelier switch',
    561234: 'front lights',
    571234: 'foyer chandelier',
    581234: 'foyer lamps',
    591234: 'dining outlet',
    '5A1234': 'Danny outlet',
    '5B1234': 'Steph outlet'
  },

  hexLength = bytes =>
    bytes.length.toString(16).padStart(2, '0').toUpperCase();

describe('plBufferBarser.processPlmBuffer', () => {
  const plmBufferParser = createPlmBufferParser(deviceNames);
  describe('parsing Beep', () => {
    const bytes = '02770006';
    let commands;
    beforeEach(() => {
      const buffer = `<BS>${bytes}${hexLength(bytes)}</BS>`;
      plmBufferParser.reset();
      commands = plmBufferParser.processPlmBuffer(buffer);
    });
    it('should return commands', () => {
      expect(commands).toEqual([
        {
          received: jasmine.any(String),
          command: 'Beep',
          code: '77',
          length: 4,
          data: '00',
          ack: true,
          bytes: '02770006'
        }
      ]);
    });
  });
  describe('parsing Send ALL-Link Command', () => {
    describe('with ALL-Link Recall', () => {
      const bytes = '02610C11000602505B123451123460110C025806' +
        '02505A123451123460110C';
      let commands;
      beforeEach(() => {
        const buffer = `<BS>${bytes}${hexLength(bytes)}</BS>`;
        plmBufferParser.reset();
        commands = plmBufferParser.processPlmBuffer(buffer);
      });
      it('should return commands', () => {
        expect(commands).toEqual([
          {
            received: jasmine.any(String),
            command: 'Send ALL-Link Command',
            code: '61',
            length: 8,
            fromAddress: 'im-hub',
            groupNumber: 12,
            allLinkCommand: '11',
            command2: '00',
            ack: true,
            insteonCommand: {
              command: 'ALL-Link Recall',
              fromAddress: 'im-hub',
              groupNumber: 12,
              command1: '11',
              messageType: 'allLinkBroadcast',
              fromDevice: 'hub controller'
            },
            fromDevice: 'hub controller',
            bytes: '02610C110006'
          },
          {
            received: jasmine.any(String),
            command: 'INSTEON Standard Message Received',
            code: '50',
            length: 18,
            fromAddress: '5B1234',
            toAddress: '511234',
            command1: '11',
            command2: '0C',
            messageType: 'allLinkCleanupAck',
            allLink: true,
            acknowledgement: true,
            extendedMessage: false,
            hopsLeft: 0,
            maxHops: 0,
            insteonCommand: {
              command: 'ALL-Link Recall',
              fromAddress: '5B1234',
              groupNumber: 12,
              command1: '11',
              toAddress: '511234',
              messageType: 'allLinkCleanupAck',
              fromDevice: 'Steph outlet',
              toDevice: 'hub controller'
            },
            fromDevice: 'Steph outlet',
            toDevice: 'hub controller',
            bytes: '02505B123451123460110C'
          },
          {
            received: jasmine.any(String),
            command: 'ALL-Link Cleanup Status Report',
            code: '58',
            length: 2,
            ack: true,
            bytes: '025806'
          },
          {
            received: jasmine.any(String),
            command: 'INSTEON Standard Message Received',
            code: '50',
            length: 18,
            fromAddress: '5A1234',
            toAddress: '511234',
            command1: '11',
            command2: '0C',
            messageType: 'allLinkCleanupAck',
            allLink: true,
            acknowledgement: true,
            extendedMessage: false,
            hopsLeft: 0,
            maxHops: 0,
            insteonCommand: {
              command: 'ALL-Link Recall',
              fromAddress: '5A1234',
              groupNumber: 12,
              command1: '11',
              toAddress: '511234',
              messageType: 'allLinkCleanupAck',
              fromDevice: 'Danny outlet',
              toDevice: 'hub controller'
            },
            fromDevice: 'Danny outlet',
            toDevice: 'hub controller',
            bytes: '02505A123451123460110C'
          }
        ]);
      });
    });
  });
  describe('parsing Send INSTEON Standard-length Message', () => {
    describe('with ALL-Link Recall', () => {
      const bytes = '0250561234000001CF11000250561234511234401101' +
        '0250561234110101CF0600';
      let commands;
      beforeEach(() => {
        const buffer = `<BS>${bytes}${hexLength(bytes)}</BS>`;
        plmBufferParser.reset();
        commands = plmBufferParser.processPlmBuffer(buffer);
      });
      it('should return commands', () => {
        expect(commands).toEqual([
          {
            received: jasmine.any(String),
            command: 'INSTEON Standard Message Received',
            code: '50',
            length: 18,
            fromAddress: '561234',
            command1: '11',
            command2: '00',
            messageType: 'allLinkBroadcast',
            allLink: true,
            acknowledgement: false,
            extendedMessage: false,
            hopsLeft: 3,
            maxHops: 3,
            cleanUpCommand1: '00',
            numberDevices: 0,
            groupNumber: 1,
            insteonCommand: {
              command: 'ALL-Link Recall',
              fromAddress: '561234',
              numberDevices: 0,
              groupNumber: 1,
              command1: '11',
              messageType: 'allLinkBroadcast',
              fromDevice: 'front lights'
            },
            fromDevice: 'front lights',
            bytes: '0250561234000001CF1100'
          },
          {
            received: jasmine.any(String),
            command: 'INSTEON Standard Message Received',
            code: '50',
            length: 18,
            fromAddress: '561234',
            toAddress: '511234',
            command1: '11',
            command2: '01',
            messageType: 'allLinkCleanup',
            allLink: true,
            acknowledgement: false,
            extendedMessage: false,
            hopsLeft: 0,
            maxHops: 0,
            insteonCommand: {
              command: 'ALL-Link Recall',
              fromAddress: '561234',
              toAddress: '511234',
              groupNumber: 1,
              command1: '11',
              messageType: 'allLinkCleanup',
              fromDevice: 'front lights',
              toDevice: 'hub controller'
            },
            fromDevice: 'front lights',
            toDevice: 'hub controller',
            bytes: '0250561234511234401101'
          },
          {
            received: jasmine.any(String),
            command: 'INSTEON Standard Message Received',
            code: '50',
            length: 18,
            fromAddress: '561234',
            command1: '06',
            command2: '00',
            messageType: 'allLinkBroadcast',
            allLink: true,
            acknowledgement: false,
            extendedMessage: false,
            hopsLeft: 3,
            maxHops: 3,
            cleanUpCommand1: '11',
            numberDevices: 1,
            groupNumber: 1,
            insteonCommand: {
              command: 'ALL-Link Cleanup Status Report',
              fromAddress: '561234',
              cleanUpCommand: 'ALL-Link Recall',
              numberDevices: 1,
              groupNumber: 1,
              command1: '06',
              messageType: 'allLinkBroadcast',
              fromDevice: 'front lights'
            },
            fromDevice: 'front lights',
            bytes: '0250561234110101CF0600'
          }
        ]);
      });
    });
    describe('with ALL-Link Alias 1 Low', () => {
      const bytes = '0250561234000001CF13000250561234511234401301' +
        '0250561234130101CF0600';
      let commands;
      beforeEach(() => {
        const buffer = `<BS>${bytes}${hexLength(bytes)}</BS>`;
        plmBufferParser.reset();
        commands = plmBufferParser.processPlmBuffer(buffer);
      });
      it('should return commands', () => {
        expect(commands).toEqual([
          {
            received: jasmine.any(String),
            command: 'INSTEON Standard Message Received',
            code: '50',
            length: 18,
            fromAddress: '561234',
            command1: '13',
            command2: '00',
            messageType: 'allLinkBroadcast',
            allLink: true,
            acknowledgement: false,
            extendedMessage: false,
            hopsLeft: 3,
            maxHops: 3,
            cleanUpCommand1: '00',
            numberDevices: 0,
            groupNumber: 1,
            insteonCommand: {
              command: 'ALL-Link Alias 1 Low',
              fromAddress: '561234',
              groupNumber: 1,
              command1: '13',
              numberDevices: 0,
              messageType: 'allLinkBroadcast',
              fromDevice: 'front lights'
            },
            fromDevice: 'front lights',
            bytes: '0250561234000001CF1300'
          },
          {
            received: jasmine.any(String),
            command: 'INSTEON Standard Message Received',
            code: '50',
            length: 18,
            fromAddress: '561234',
            toAddress: '511234',
            command1: '13',
            command2: '01',
            messageType: 'allLinkCleanup',
            allLink: true,
            acknowledgement: false,
            extendedMessage: false,
            hopsLeft: 0,
            maxHops: 0,
            insteonCommand: {
              command: 'ALL-Link Alias 1 Low',
              fromAddress: '561234',
              groupNumber: 1,
              command1: '13',
              toAddress: '511234',
              messageType: 'allLinkCleanup',
              fromDevice: 'front lights',
              toDevice: 'hub controller'
            },
            fromDevice: 'front lights',
            toDevice: 'hub controller',
            bytes: '0250561234511234401301'
          },
          {
            received: jasmine.any(String),
            command: 'INSTEON Standard Message Received',
            code: '50',
            length: 18,
            fromAddress: '561234',
            command1: '06',
            command2: '00',
            messageType: 'allLinkBroadcast',
            allLink: true,
            acknowledgement: false,
            extendedMessage: false,
            hopsLeft: 3,
            maxHops: 3,
            cleanUpCommand1: '13',
            numberDevices: 1,
            groupNumber: 1,
            insteonCommand: {
              command: 'ALL-Link Cleanup Status Report',
              fromAddress: '561234',
              groupNumber: 1,
              command1: '06',
              cleanUpCommand: 'ALL-Link Alias 1 Low',
              numberDevices: 1,
              messageType: 'allLinkBroadcast',
              fromDevice: 'front lights'
            },
            fromDevice: 'front lights',
            bytes: '0250561234130101CF0600'
          }
        ]);
      });
    });
    describe('with ALL-Link Alias 4 High', () => {
      const bytes = '0250551234000001CF17010250551234000001CF1800';
      let commands;
      beforeEach(() => {
        const buffer = `<BS>${bytes}${hexLength(bytes)}</BS>`;
        plmBufferParser.reset();
        commands = plmBufferParser.processPlmBuffer(buffer);
      });
      it('should return commands', () => {
        expect(commands).toEqual([
          {
            received: jasmine.any(String),
            command: 'INSTEON Standard Message Received',
            code: '50',
            length: 18,
            fromAddress: '551234',
            command1: '17',
            command2: '01',
            messageType: 'allLinkBroadcast',
            allLink: true,
            acknowledgement: false,
            extendedMessage: false,
            hopsLeft: 3,
            maxHops: 3,
            cleanUpCommand1: '00',
            numberDevices: 0,
            groupNumber: 1,
            insteonCommand: {
              command: 'ALL-Link Alias 4 High',
              fromAddress: '551234',
              groupNumber: 1,
              command1: '17',
              numberDevices: 0,
              messageType: 'allLinkBroadcast',
              fromDevice: 'foyer chandelier switch'
            },
            fromDevice: 'foyer chandelier switch',
            bytes: '0250551234000001CF1701'
          },
          {
            received: jasmine.any(String),
            command: 'INSTEON Standard Message Received',
            code: '50',
            length: 18,
            fromAddress: '551234',
            command1: '18',
            command2: '00',
            messageType: 'allLinkBroadcast',
            allLink: true,
            acknowledgement: false,
            extendedMessage: false,
            hopsLeft: 3,
            maxHops: 3,
            cleanUpCommand1: '00',
            numberDevices: 0,
            groupNumber: 1,
            insteonCommand: {
              command: 'ALL-Link Alias 4 Low',
              fromAddress: '551234',
              groupNumber: 1,
              command1: '18',
              numberDevices: 0,
              messageType: 'allLinkBroadcast',
              fromDevice: 'foyer chandelier switch'
            },
            fromDevice: 'foyer chandelier switch',
            bytes: '0250551234000001CF1800'
          }
        ]);
      });
    });
    describe('Product Data Request', () => {
      const bytes = '02625712340F0300060250571234511234200300';
      let commands;
      beforeEach(() => {
        const buffer = `<BS>${bytes}${hexLength(bytes)}</BS>`;
        plmBufferParser.reset();
        commands = plmBufferParser.processPlmBuffer(buffer);
      });
      it('should return commands', () => {
        expect(commands).toEqual([
          {
            received: jasmine.any(String),
            command: 'Send INSTEON Standard-length Message',
            code: '62',
            length: 14,
            messageType: 'direct',
            allLink: false,
            acknowledgement: false,
            extendedMessage: false,
            hopsLeft: 3,
            maxHops: 3,
            fromAddress: 'im-hub',
            toAddress: '571234',
            command1: '03',
            command2: '00',
            ack: true,
            insteonCommand: {
              command: 'Product Data Request',
              messageType: 'direct',
              fromAddress: 'im-hub',
              toAddress: '571234',
              fromDevice: 'hub controller',
              toDevice: 'foyer chandelier'
            },
            fromDevice: 'hub controller',
            toDevice: 'foyer chandelier',
            bytes: '02625712340F030006'
          },
          {
            received: jasmine.any(String),
            command: 'INSTEON Standard Message Received',
            code: '50',
            length: 18,
            fromAddress: '571234',
            toAddress: '511234',
            messageType: 'directAck',
            allLink: false,
            acknowledgement: true,
            extendedMessage: false,
            hopsLeft: 0,
            maxHops: 0,
            command1: '03',
            command2: '00',
            insteonCommand: {
              command: 'Product Data Request',
              messageType: 'directAck',
              fromAddress: '571234',
              toAddress: '511234',
              edExpected: true,
              fromDevice: 'foyer chandelier',
              toDevice: 'hub controller'
            },
            fromDevice: 'foyer chandelier',
            toDevice: 'hub controller',
            bytes: '0250571234511234200300'
          }
        ]);
      });
    });
    describe('with Outlet OFF (bottom)', () => {
      const bytes = '02625A12340533020602505A1234511234203302';
      let commands;
      beforeEach(() => {
        const buffer = `<BS>${bytes}${hexLength(bytes)}</BS>`;
        plmBufferParser.reset();
        commands = plmBufferParser.processPlmBuffer(buffer);
      });
      it('should return commands', () => {
        expect(commands).toEqual([
          {
            received: jasmine.any(String),
            command: 'Send INSTEON Standard-length Message',
            code: '62',
            length: 14,
            fromAddress: 'im-hub',
            toAddress: '5A1234',
            command1: '33',
            command2: '02',
            ack: true,
            messageType: 'direct',
            allLink: false,
            acknowledgement: false,
            extendedMessage: false,
            hopsLeft: 1,
            maxHops: 1,
            insteonCommand: {
              command: 'Outlet OFF (bottom)',
              fromAddress: 'im-hub',
              toAddress: '5A1234',
              messageType: 'direct',
              fromDevice: 'hub controller',
              toDevice: 'Danny outlet'
            },
            fromDevice: 'hub controller',
            toDevice: 'Danny outlet',
            bytes: '02625A123405330206'
          },
          {
            received: jasmine.any(String),
            command: 'INSTEON Standard Message Received',
            code: '50',
            length: 18,
            fromAddress: '5A1234',
            toAddress: '511234',
            command1: '33',
            command2: '02',
            messageType: 'directAck',
            allLink: false,
            acknowledgement: true,
            extendedMessage: false,
            hopsLeft: 0,
            maxHops: 0,
            insteonCommand: {
              command: 'Outlet OFF (bottom)',
              fromAddress: '5A1234',
              toAddress: '511234',
              messageType: 'directAck',
              fromDevice: 'Danny outlet',
              toDevice: 'hub controller'
            },
            fromDevice: 'Danny outlet',
            toDevice: 'hub controller',
            bytes: '02505A1234511234203302'
          }
        ]);
      });
    });
    describe('with Light Status Request', () => {
      const bytes = '02625A12340519000602505A12345112342002FF';
      let commands;
      beforeEach(() => {
        const buffer = `<BS>${bytes}${hexLength(bytes)}</BS>`;
        plmBufferParser.reset();
        commands = plmBufferParser.processPlmBuffer(buffer);
      });
      it('should return commands', () => {
        expect(commands).toEqual([
          {
            received: jasmine.any(String),
            command: 'Send INSTEON Standard-length Message',
            code: '62',
            length: 14,
            fromAddress: 'im-hub',
            toAddress: '5A1234',
            command1: '19',
            command2: '00',
            ack: true,
            messageType: 'direct',
            allLink: false,
            acknowledgement: false,
            extendedMessage: false,
            hopsLeft: 1,
            maxHops: 1,
            insteonCommand: {
              command: 'Light Status Request',
              fromAddress: 'im-hub',
              toAddress: '5A1234',
              messageType: 'direct',
              fromDevice: 'hub controller',
              toDevice: 'Danny outlet'
            },
            fromDevice: 'hub controller',
            toDevice: 'Danny outlet',
            bytes: '02625A123405190006'
          },
          {
            received: jasmine.any(String),
            command: 'INSTEON Standard Message Received',
            code: '50',
            length: 18,
            fromAddress: '5A1234',
            toAddress: '511234',
            command1: '02',
            command2: 'FF',
            messageType: 'directAck',
            allLink: false,
            acknowledgement: true,
            extendedMessage: false,
            hopsLeft: 0,
            maxHops: 0,
            insteonCommand: {
              command: 'Light Status Response',
              onLevel: 255,
              fromAddress: '5A1234',
              toAddress: '511234',
              messageType: 'directAck',
              fromDevice: 'Danny outlet',
              toDevice: 'hub controller',
              allLinkDatabaseDelta: 2
            },
            fromDevice: 'Danny outlet',
            toDevice: 'hub controller',
            bytes: '02505A12345112342002FF'
          }
        ]);
      });
    });
    describe('with Outlet Status Request', () => {
      const bytes = '02625A12340519010602505A1234511234200203';
      let commands;
      beforeEach(() => {
        const buffer = `<BS>${bytes}${hexLength(bytes)}</BS>`;
        plmBufferParser.reset();
        commands = plmBufferParser.processPlmBuffer(buffer);
      });
      it('should return commands', () => {
        expect(commands).toEqual([
          {
            received: jasmine.any(String),
            command: 'Send INSTEON Standard-length Message',
            code: '62',
            length: 14,
            fromAddress: 'im-hub',
            toAddress: '5A1234',
            command1: '19',
            command2: '01',
            ack: true,
            messageType: 'direct',
            allLink: false,
            acknowledgement: false,
            extendedMessage: false,
            hopsLeft: 1,
            maxHops: 1,
            insteonCommand: {
              command: 'Outlet Status Request',
              fromAddress: 'im-hub',
              toAddress: '5A1234',
              messageType: 'direct',
              fromDevice: 'hub controller',
              toDevice: 'Danny outlet'
            },
            fromDevice: 'hub controller',
            toDevice: 'Danny outlet',
            bytes: '02625A123405190106'
          },
          {
            received: jasmine.any(String),
            command: 'INSTEON Standard Message Received',
            code: '50',
            length: 18,
            fromAddress: '5A1234',
            toAddress: '511234',
            command1: '02',
            command2: '03',
            messageType: 'directAck',
            allLink: false,
            acknowledgement: true,
            extendedMessage: false,
            hopsLeft: 0,
            maxHops: 0,
            insteonCommand: {
              command: 'Outlet Status Response',
              top: 'on',
              bottom: 'on',
              fromAddress: '5A1234',
              toAddress: '511234',
              allLinkDatabaseDelta: 2,
              messageType: 'directAck',
              fromDevice: 'Danny outlet',
              toDevice: 'hub controller'
            },
            fromDevice: 'Danny outlet',
            toDevice: 'hub controller',
            bytes: '02505A1234511234200203'
          }
        ]);
      });
    });
    describe('with Light Status Request 02', () => {
      const bytes = '0262571234051902060250571234511234201900';
      let commands;
      beforeEach(() => {
        const buffer = `<BS>${bytes}${hexLength(bytes)}</BS>`;
        plmBufferParser.reset();
        commands = plmBufferParser.processPlmBuffer(buffer);
      });
      it('should return commands', () => {
        expect(commands).toEqual([
          {
            received: jasmine.any(String),
            command: 'Send INSTEON Standard-length Message',
            code: '62',
            length: 14,
            fromAddress: 'im-hub',
            toAddress: '571234',
            command1: '19',
            command2: '02',
            ack: true,
            messageType: 'direct',
            allLink: false,
            acknowledgement: false,
            extendedMessage: false,
            hopsLeft: 1,
            maxHops: 1,
            insteonCommand: {
              command: 'Light Status Request 02',
              fromAddress: 'im-hub',
              toAddress: '571234',
              messageType: 'direct',
              fromDevice: 'hub controller',
              toDevice: 'foyer chandelier'
            },
            fromDevice: 'hub controller',
            toDevice: 'foyer chandelier',
            bytes: '026257123405190206'
          },
          {
            received: jasmine.any(String),
            command: 'INSTEON Standard Message Received',
            code: '50',
            length: 18,
            fromAddress: '571234',
            toAddress: '511234',
            command1: '19',
            command2: '00',
            messageType: 'directAck',
            allLink: false,
            acknowledgement: true,
            extendedMessage: false,
            hopsLeft: 0,
            maxHops: 0,
            insteonCommand: {
              command: '1902',
              command2: '00',
              fromAddress: '571234',
              toAddress: '511234',
              allLinkDatabaseDelta: 25,
              messageType: 'directAck',
              fromDevice: 'foyer chandelier',
              toDevice: 'hub controller'
            },
            fromDevice: 'foyer chandelier',
            toDevice: 'hub controller',
            bytes: '0250571234511234201900'
          }
        ]);
      });
    });
    describe('with Get Operating Flags', () => {
      const bytes = '02625512340F1F00060250551234511234201F00' +
        '02625512340F1F01060250551234511234201F00' +
        '02625512340F1F02060250551234511234201F14';
      let commands;
      beforeEach(() => {
        const buffer = `<BS>${bytes}${hexLength(bytes)}</BS>`;
        plmBufferParser.reset();
        commands = plmBufferParser.processPlmBuffer(buffer);
      });
      it('should return commands', () => {
        expect(commands).toEqual([
          {
            received: jasmine.any(String),
            command: 'Send INSTEON Standard-length Message',
            code: '62',
            length: 14,
            messageType: 'direct',
            allLink: false,
            acknowledgement: false,
            extendedMessage: false,
            hopsLeft: 3,
            maxHops: 3,
            fromAddress: 'im-hub',
            toAddress: '551234',
            command1: '1F',
            command2: '00',
            ack: true,
            insteonCommand: {
              command: 'Get Operating Flags',
              messageType: 'direct',
              fromAddress: 'im-hub',
              toAddress: '551234',
              fromDevice: 'hub controller',
              toDevice: 'foyer chandelier switch'
            },
            fromDevice: 'hub controller',
            toDevice: 'foyer chandelier switch',
            bytes: '02625512340F1F0006'
          },
          {
            received: jasmine.any(String),
            command: 'INSTEON Standard Message Received',
            code: '50',
            length: 18,
            fromAddress: '551234',
            toAddress: '511234',
            messageType: 'directAck',
            allLink: false,
            acknowledgement: true,
            extendedMessage: false,
            hopsLeft: 0,
            maxHops: 0,
            command1: '1F',
            command2: '00',
            insteonCommand: {
              command: 'Get Operating Flags',
              programLockOn: false,
              ledOnDuringTransmit: false,
              resumeDimEnabled: false,
              numberKeys: 6,
              ledOn: false,
              loadSenseOn: false,
              bit6: false,
              bit7: false,
              messageType: 'directAck',
              fromAddress: '551234',
              toAddress: '511234',
              fromDevice: 'foyer chandelier switch',
              toDevice: 'hub controller'
            },
            fromDevice: 'foyer chandelier switch',
            toDevice: 'hub controller',
            bytes: '0250551234511234201F00'
          },
          {
            received: jasmine.any(String),
            command: 'Send INSTEON Standard-length Message',
            code: '62',
            length: 14,
            messageType: 'direct',
            allLink: false,
            acknowledgement: false,
            extendedMessage: false,
            hopsLeft: 3,
            maxHops: 3,
            fromAddress: 'im-hub',
            toAddress: '551234',
            command1: '1F',
            command2: '01',
            ack: true,
            insteonCommand: {
              command: 'Get ALL-Link Database Delta',
              messageType: 'direct',
              fromAddress: 'im-hub',
              toAddress: '551234',
              fromDevice: 'hub controller',
              toDevice: 'foyer chandelier switch'
            },
            fromDevice: 'hub controller',
            toDevice: 'foyer chandelier switch',
            bytes: '02625512340F1F0106'
          },
          {
            received: jasmine.any(String),
            command: 'INSTEON Standard Message Received',
            code: '50',
            length: 18,
            fromAddress: '551234',
            toAddress: '511234',
            messageType: 'directAck',
            allLink: false,
            acknowledgement: true,
            extendedMessage: false,
            hopsLeft: 0,
            maxHops: 0,
            command1: '1F',
            command2: '00',
            insteonCommand: {
              command: 'Get ALL-Link Database Delta',
              allLinkDatabaseDelta: 0,
              messageType: 'directAck',
              fromAddress: '551234',
              toAddress: '511234',
              fromDevice: 'foyer chandelier switch',
              toDevice: 'hub controller'
            },
            fromDevice: 'foyer chandelier switch',
            toDevice: 'hub controller',
            bytes: '0250551234511234201F00'
          },
          {
            received: jasmine.any(String),
            command: 'Send INSTEON Standard-length Message',
            code: '62',
            length: 14,
            messageType: 'direct',
            allLink: false,
            acknowledgement: false,
            extendedMessage: false,
            hopsLeft: 3,
            maxHops: 3,
            fromAddress: 'im-hub',
            toAddress: '551234',
            command1: '1F',
            command2: '02',
            ack: true,
            insteonCommand: {
              command: 'Get Signal-to-Noise Value',
              messageType: 'direct',
              fromAddress: 'im-hub',
              toAddress: '551234',
              fromDevice: 'hub controller',
              toDevice: 'foyer chandelier switch'
            },
            fromDevice: 'hub controller',
            toDevice: 'foyer chandelier switch',
            bytes: '02625512340F1F0206'
          },
          {
            received: jasmine.any(String),
            command: 'INSTEON Standard Message Received',
            code: '50',
            length: 18,
            fromAddress: '551234',
            toAddress: '511234',
            messageType: 'directAck',
            allLink: false,
            acknowledgement: true,
            extendedMessage: false,
            hopsLeft: 0,
            maxHops: 0,
            command1: '1F',
            command2: '14',
            insteonCommand: {
              command: 'Get Signal-to-Noise Value',
              signalToNoise: 20,
              messageType: 'directAck',
              fromAddress: '551234',
              toAddress: '511234',
              fromDevice: 'foyer chandelier switch',
              toDevice: 'hub controller'
            },
            fromDevice: 'foyer chandelier switch',
            toDevice: 'hub controller',
            bytes: '0250551234511234201F14'
          }
        ]);
      });
    });
    describe('with Light ON at Ramp Rate', () => {
      const bytes = '02625712340F2E67060250571234511234202E67';
      let commands;
      beforeEach(() => {
        const buffer = `<BS>${bytes}${hexLength(bytes)}</BS>`;
        plmBufferParser.reset();
        commands = plmBufferParser.processPlmBuffer(buffer);
      });
      it('should return commands', () => {
        expect(commands).toEqual([
          {
            received: jasmine.any(String),
            command: 'Send INSTEON Standard-length Message',
            code: '62',
            length: 14,
            messageType: 'direct',
            allLink: false,
            acknowledgement: false,
            extendedMessage: false,
            hopsLeft: 3,
            maxHops: 3,
            fromAddress: 'im-hub',
            toAddress: '571234',
            command1: '2E',
            command2: '67',
            ack: true,
            insteonCommand: {
              command: 'Light ON at Ramp Rate',
              onLevel: 111,
              rampRate: 15,
              messageType: 'direct',
              fromAddress: 'im-hub',
              toAddress: '571234',
              fromDevice: 'hub controller',
              toDevice: 'foyer chandelier'
            },
            fromDevice: 'hub controller',
            toDevice: 'foyer chandelier',
            bytes: '02625712340F2E6706'
          },
          {
            received: jasmine.any(String),
            command: 'INSTEON Standard Message Received',
            code: '50',
            length: 18,
            fromAddress: '571234',
            toAddress: '511234',
            messageType: 'directAck',
            allLink: false,
            acknowledgement: true,
            extendedMessage: false,
            hopsLeft: 0,
            maxHops: 0,
            command1: '2E',
            command2: '67',
            insteonCommand: {
              command: 'Light ON at Ramp Rate',
              onLevel: 111,
              rampRate: 15,
              messageType: 'directAck',
              fromAddress: '571234',
              toAddress: '511234',
              fromDevice: 'foyer chandelier',
              toDevice: 'hub controller'
            },
            fromDevice: 'foyer chandelier',
            toDevice: 'hub controller',
            bytes: '0250571234511234202E67'
          }
        ]);
      });
    });
  });
  describe('parsing Get Next ALL-Link Record Nak', () => {
    const bytes = '026A15';
    let commands;
    beforeEach(() => {
      const buffer = `<BS>${bytes}${hexLength(bytes)}</BS>`;
      plmBufferParser.reset();
      commands = plmBufferParser.processPlmBuffer(buffer);
    });
    it('should return commands', () => {
      expect(commands).toEqual([
        {
          received: jasmine.any(String),
          command: 'Get Next ALL-Link Record',
          code: '6A',
          length: 2,
          ack: false,
          responseMatcher: jasmine.any(Function),
          bytes: '026A15'
        }
      ]);
    });
  });
  describe('parsing Beep', () => {
    const bytes = '02770006';
    let commands;
    beforeEach(() => {
      const buffer = `<BS>${bytes}${hexLength(bytes)}</BS>`;
      plmBufferParser.reset();
      commands = plmBufferParser.processPlmBuffer(buffer);
    });
    it('should return commands', () => {
      expect(commands).toEqual([
        {
          received: jasmine.any(String),
          command: 'Beep',
          code: '77',
          length: 4,
          data: '00',
          ack: true,
          bytes: '02770006'
        }
      ]);
    });
  });
});
