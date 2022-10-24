'use strict'
const unroll = require('unroll')

unroll.use(it)

const { encodeCommand, commandResponseMatcher } = require('../lib/encodeCommand')

describe('encodeCommand', () => {
  describe('with existing encoder', () => {
    unroll(
      '#command should be encoded as #expected',
      testArgs => {
        expect(encodeCommand(testArgs.command)).toBe(testArgs.expected)
      },
      [
        ['command', 'expected'],
        // Modem commands
        [
          { command: 'Get IM Info' },
          '0260',
        ],
        [
          { command: 'Send ALL-Link Command', groupNumber: 1, allLinkCommand: '02', command2: '03' },
          '0261010203',
        ],
        [
          { command: 'Send ALL-Link Command', groupNumber: 1, allLinkCommand: '02' },
          '0261010200',
        ],
        [
          {
            command: 'Send INSTEON Standard-length Message',
            toAddress: '123456',
            messageType: 'directAck',
            extendedMessage: true,
            hopsLeft: 1,
            maxHops: 2,
            command1: '05',
            command2: '06',
          },
          '0262123456360506',
        ],
        [
          {
            command: 'Send INSTEON Standard-length Message',
            toAddress: '123456',
            messageType: 'directAck',
            command1: '05',
          },
          '02621234562F0500',
        ],
        [
          {
            command: 'Send INSTEON Extended-length Message',
            toAddress: '123456',
            messageType: 'directAck',
            command1: '05',
            command2: '02',
            userData: 'ABCDEF',
          },
          '02621234563F0502ABCDEF0000000000000000000092',
        ],
        [
          {
            command: 'Send INSTEON Extended-length Message',
            toAddress: '123456',
            messageType: 'directAck',
            command1: '05',
          },
          '02621234563F050000000000000000000000000000FB',
        ],
        [
          {
            command: 'Start ALL-Linking',
            allLinkType: 'IM is either',
            groupNumber: 1,
          },
          '02640301',
        ],
        [
          {
            command: 'Start ALL-Linking',
            groupNumber: 1,
          },
          '02640001',
        ],
        [
          { command: 'Cancel ALL-Linking' },
          '0265',
        ],
        [
          {
            command: 'Set Host Device Category',
            deviceCategory: '01',
            deviceSubcategory: '02',
            firmware: '03',
          },
          '0266010203',
        ],
        [
          { command: 'Set Host Device Category' },
          '0266000000',
        ],
        [
          { command: 'Reset the IM' },
          '0267',
        ],
        [
          {
            command: 'Set INSTEON ACK Message Byte',
            command2Data: '12',
          },
          '026812',
        ],
        [
          { command: 'Set INSTEON ACK Message Byte' },
          '026800',
        ],
        [
          { command: 'Get First ALL-Link Record' },
          '0269',
        ],
        [
          { command: 'Get Next ALL-Link Record' },
          '026A',
        ],
        [
          {
            command: 'Set IM Configuration',
            imConfigurationFlags: {
              disableAutomaticLinking: true,
              monitorMode: true,
              disableAutomaticLed: true,
              disableHostComunications: true,
              reserved: 10,
            },
          },
          '026BFA',
        ],
        [
          { command: 'Set IM Configuration' },
          '026B00',
        ],
        [
          { command: 'Get ALL-Link Record for Sender' },
          '026C',
        ],
        [
          { command: 'IM LED On' },
          '026D',
        ],
        [
          { command: 'IM LED Off' },
          '026E',
        ],
        [
          {
            command: 'Set INSTEON NAK Message Byte',
            command2Data: '12',
          },
          '027012',
        ],
        [
          { command: 'Set INSTEON NAK Message Byte' },
          '027000',
        ],
        [
          {
            command: 'Set INSTEON ACK Message Two Bytes',
            command1Data: '12',
            command2Data: '34',
          },
          '02711234',
        ],
        [
          { command: 'Set INSTEON ACK Message Two Bytes' },
          '02710000',
        ],
        [
          { command: 'RF Sleep' },
          '0272',
        ],
        [
          { command: 'Get IM Configuration' },
          '0273',
        ],
        [
          { command: 'Cancel Cleanup' },
          '027400',
        ],
        [
          {
            command: 'Read 8 bytes from Database',
            address: '1234',
          },
          '02751234',
        ],
        [
          { command: 'Read 8 bytes from Database' },
          '02750000',
        ],
        [
          { command: 'Beep IM' },
          '027700',
        ],
        [
          {
            command: 'Set Status',
            status: '12',
          },
          '027812',
        ],
        [
          { command: 'Set Status' },
          '027800',
        ],
        [
          {
            command: 'Set Database Link Data for next Link',
            data: '123456',
          },
          '0279123456',
        ],
        [
          { command: 'Set Database Link Data for next Link' },
          '0279000000',
        ],
        [
          { command: 'Set Application Retries for New Links' },
          '027A00',
        ],
        [
          {
            command: 'Set Application Retries for New Links',
            retries: 4,
          },
          '027A04',
        ],
        [
          {
            command: 'Set RF Frequency Offset',
            refFrequencyOffset: -123,
          },
          '027B85',
        ],
        [
          { command: 'Set RF Frequency Offset' },
          '027B00',
        ],
        [
          {
            command: 'Set Acknowledge for TempLinc command',
            acknowledge: '1234567890ABCDEF',
          },
          '027C1234567890ABCDEF',
        ],
        [
          { command: 'Set Acknowledge for TempLinc command' },
          '027C0000000000000000',
        ],
        [
          {
            command: '7F Command',
            data: '12',
          },
          '027F12',
        ],
        [
          { command: '7F Command' },
          '027F00',
        ],
        // Standard-length Direct Commands
        [
          {
            command: 'Assign to ALL-Link Group',
            toAddress: '23456',
            groupNumber: 1,
          },
          '02620234560F0101',
        ],
        [
          { command: 'Assign to ALL-Link Group' },
          '02620000000F0100',
        ],
        [
          {
            command: 'Delete from ALL-Link Group',
            toAddress: '23456',
            groupNumber: 1,
          },
          '02620234560F0201',
        ],
        [
          { command: 'Delete from ALL-Link Group' },
          '02620000000F0200',
        ],
        [
          {
            command: 'Product Data Request',
            command2: 'A6',
          },
          '02620000000F03A6',
        ],
        [
          { command: 'Product Data Request' },
          '02620000000F0300',
        ],
        [
          { command: 'FX Username Request' },
          '02620000000F0301',
        ],
        [
          { command: 'Device Text String Request' },
          '02620000000F0302',
        ],
        [
          {
            command: 'Enter Linking Mode',
            toAddress: '23456',
            groupNumber: 1,
          },
          '02620234560F0901',
        ],
        [
          { command: 'Enter Linking Mode' },
          '02620000000F0900',
        ],
        [
          {
            command: 'Enter Unlinking Mode',
            toAddress: '23456',
            groupNumber: 1,
          },
          '02620234560F0A01',
        ],
        [
          { command: 'Enter Unlinking Mode' },
          '02620000000F0A00',
        ],
        [
          { command: 'Get INSTEON Engine Version' },
          '02620000000F0D00',
        ],
        [
          { command: 'Ping' },
          '02620000000F0F00',
        ],
        [
          { command: 'ID Request' },
          '02620000000F1000',
        ],
        [
          {
            command: 'Light ON',
            onLevel: -2,
          },
          '02620000000F1100',
        ],
        [
          { command: 'Light ON' },
          '02620000000F1100',
        ],
        [
          {
            command: 'Light ON Fast',
            onLevel: 300,
          },
          '02620000000F12FF',
        ],
        [
          { command: 'Light ON Fast' },
          '02620000000F1200',
        ],
        [
          { command: 'Light OFF' },
          '02620000000F1300',
        ],
        [
          { command: 'Light OFF Fast' },
          '02620000000F1400',
        ],
        [
          { command: 'Light Brighten One Step' },
          '02620000000F1500',
        ],
        [
          { command: 'Light Dim One Step' },
          '02620000000F1600',
        ],
        [
          {
            command: 'Light Start Manual Change',
            direction: 'up',
          },
          '02620000000F1701',
        ],
        [
          { command: 'Light Start Manual Change' },
          '02620000000F1700',
        ],
        [
          { command: 'Light Stop Manual Change' },
          '02620000000F1800',
        ],
        [
          { command: 'Light Status On-Level Request' },
          '02620000000F1900',
        ],
        [
          { command: 'Light Status LED Request' },
          '02620000000F1901',
        ],
        [
          { command: 'Outlet Status Request' },
          '02620000000F1901',
        ],
        [
          { command: 'Light Status Request 02' },
          '02620000000F1902',
        ],
        [
          { command: 'Get Operating Flags' },
          '02620000000F1F00',
        ],
        [
          { command: 'Get ALL-Link Database Delta' },
          '02620000000F1F01',
        ],
        [
          { command: 'Get Signal-to-Noise Value' },
          '02620000000F1F02',
        ],
        [
          { command: 'Get Operating Flags 2' },
          '02620000000F1F05',
        ],
        [
          {
            command: 'Set Operating Flags',
            flag: 'LED On',
          },
          '02620000000F2009',
        ],
        [
          { command: 'Set Operating Flags' },
          '02620000000F2000',
        ],
        [
          {
            command: 'Light Instant Change',
            onLevel: 200,
          },
          '02620000000F21C8',
        ],
        [
          { command: 'Light Instant Change' },
          '02620000000F2100',
        ],
        [
          { command: 'Light Manually Turned Off' },
          '02620000000F2200',
        ],
        [
          { command: 'Light Manually Turned On' },
          '02620000000F2300',
        ],
        [
          { command: 'Reread Init Values' },
          '02620000000F2400',
        ],
        [
          { command: 'Remote SET Button Tap' },
          '02620000000F2501',
        ],
        [
          { command: 'Remote SET Button Tap Twice' },
          '02620000000F2502',
        ],
        [
          {
            command: 'Light Set Status',
            onLevel: 200,
          },
          '02620000000F27C8',
        ],
        [
          { command: 'Light Set Status' },
          '02620000000F2700',
        ],
        [
          {
            command: 'Light ON at Ramp Rate',
            onLevel: 200,
            rampRate: 10,
          },
          '02620000000F2EC5',
        ],
        [
          {
            command: 'Light ON at Ramp Rate',
            onLevel: -200,
            rampRate: -10,
          },
          '02620000000F2E00',
        ],
        [
          {
            command: 'Light ON at Ramp Rate',
            onLevel: 300,
            rampRate: 60,
          },
          '02620000000F2EFF',
        ],
        [
          { command: 'Light ON at Ramp Rate' },
          '02620000000F2E00',
        ],
        [
          { command: 'Beep Device' },
          '02620000000F3000',
        ],
        [
          {
            command: 'Outlet ON',
            outlet: 'top',
          },
          '02620000000F3201',
        ],
        [
          { command: 'Outlet ON' },
          '02620000000F3200',
        ],
        [
          {
            command: 'Outlet OFF',
            outlet: 'bottom',
          },
          '02620000000F3302',
        ],
        [
          { command: 'Outlet OFF' },
          '02620000000F3300',
        ],
        // Extended-length Direct Commands
        [
          {
            command: 'Remote Enter Linking Mode',
            toAddress: '123456',
            groupNumber: 4,
            hopsLeft: 1,
            maxHops: 2,
          },
          '026212345616090400000000000000000000000000F3',
        ],
        [
          { command: 'Remote Enter Linking Mode' },
          '02620000001F090000000000000000000000000000F7',
        ],
        [
          {
            command: 'Remote Enter Unlinking Mode',
            groupNumber: 300,
          },
          '02620000001F0AFF00000000000000000000000000F7',
        ],
        [
          { command: 'Remote Enter Unlinking Mode' },
          '02620000001F0A0000000000000000000000000000F6',
        ],
        [
          {
            command: 'ON (Bottom Outlet)',
            onLevel: 200,
          },
          '02620000001F11C80200000000000000000000000025',
        ],
        [
          { command: 'ON (Bottom Outlet)' },
          '02620000001F110002000000000000000000000000ED',
        ],
        [
          { command: 'OFF (Bottom Outlet)' },
          '02620000001F130002000000000000000000000000EB',
        ],
        [
          { command: 'Programming Lock On' },
          '02620000001F200000000000000000000000000000E0',
        ],
        [
          { command: 'Programming Lock Off' },
          '02620000001F200100000000000000000000000000DF',
        ],
        [
          { command: 'LED Blink on Traffic On' },
          '02620000001F200200000000000000000000000000DE',
        ],
        [
          { command: 'LED Blink on Traffic Off' },
          '02620000001F200300000000000000000000000000DD',
        ],
        [
          { command: 'Beeper On' },
          '02620000001F200400000000000000000000000000DC',
        ],
        [
          { command: 'Resume Dim On' },
          '02620000001F200400000000000000000000000000DC',
        ],
        [
          { command: 'Load Sense On (Bottom Outlet)' },
          '02620000001F200400000000000000000000000000DC',
        ],
        [
          { command: 'Resume Dim Off' },
          '02620000001F200500000000000000000000000000DB',
        ],
        [
          { command: 'Beeper Off' },
          '02620000001F200500000000000000000000000000DB',
        ],
        [
          { command: 'Load Sense Off (Bottom Outlet)' },
          '02620000001F200500000000000000000000000000DB',
        ],
        [
          { command: 'Stay Awake On' },
          '02620000001F200600000000000000000000000000DA',
        ],
        [
          { command: '8-Key KeypadLinc' },
          '02620000001F200600000000000000000000000000DA',
        ],
        [
          { command: 'Load Sense On (Top Outlet)' },
          '02620000001F200600000000000000000000000000DA',
        ],
        [
          { command: 'Stay Awake Off' },
          '02620000001F200700000000000000000000000000D9',
        ],
        [
          { command: '6-Key KeypadLinc' },
          '02620000001F200700000000000000000000000000D9',
        ],
        [
          { command: 'Load Sense Off (Top Outlet)' },
          '02620000001F200700000000000000000000000000D9',
        ],
        [
          { command: 'Listen Only Off' },
          '02620000001F200800000000000000000000000000D8',
        ],
        [
          { command: 'LED Off' },
          '02620000001F200800000000000000000000000000D8',
        ],
        [
          { command: 'Listen Only On' },
          '02620000001F200900000000000000000000000000D7',
        ],
        [
          { command: 'LED On' },
          '02620000001F200900000000000000000000000000D7',
        ],
        [
          { command: 'No I\'m Alive On' },
          '02620000001F200A00000000000000000000000000D6',
        ],
        [
          { command: 'Keybeep On' },
          '02620000001F200A00000000000000000000000000D6',
        ],
        [
          { command: 'No I\'m Alive Off' },
          '02620000001F200B00000000000000000000000000D5',
        ],
        [
          { command: 'Keybeep Off' },
          '02620000001F200B00000000000000000000000000D5',
        ],
        [
          { command: 'RF Off' },
          '02620000001F200C00000000000000000000000000D4',
        ],
        [
          { command: 'RF On' },
          '02620000001F200D00000000000000000000000000D3',
        ],
        [
          { command: 'Powerline Off' },
          '02620000001F200E00000000000000000000000000D2',
        ],
        [
          { command: 'Powerline On' },
          '02620000001F200F00000000000000000000000000D1',
        ],
        [
          { command: 'X10 Off' },
          '02620000001F201200000000000000000000000000CE',
        ],
        [
          { command: 'X10 On' },
          '02620000001F201300000000000000000000000000CD',
        ],
        [
          { command: 'Error Blink Off' },
          '02620000001F201400000000000000000000000000CC',
        ],
        [
          { command: 'Error Blink On' },
          '02620000001F201500000000000000000000000000CB',
        ],
        [
          { command: 'Cleanup Report Off' },
          '02620000001F201600000000000000000000000000CA',
        ],
        [
          { command: 'Cleanup Report On' },
          '02620000001F201700000000000000000000000000C9',
        ],
        [
          { command: 'Smart Hops On' },
          '02620000001F201C00000000000000000000000000C4',
        ],
        [
          { command: 'Smart Hops Off' },
          '02620000001F201D00000000000000000000000000C3',
        ],
        [
          {
            command: 'Get for Group/Button',
            groupNumber: 1,
          },
          '02620000001F2E0001000000000000000000000000D1',
        ],
        [
          { command: 'Get for Group/Button' },
          '02620000001F2E0000000000000000000000000000D2',
        ],
        [
          {
            command: 'Set X10 Address',
            groupNumber: 1,
            houseCode: 2,
            unitCode: 254,
          },
          '02620000001F2E00010402FE000000000000000000CD',
        ],
        [
          { command: 'Set X10 Address' },
          '02620000001F2E0000040000000000000000000000CE',
        ],
        [
          {
            command: 'Set Ramp Rate',
            rampRate: 15,
          },
          '02620000001F2E00000570000000000000000000005D',
        ],
        [
          { command: 'Set Ramp Rate' },
          '02620000001F2E0000050000000000000000000000CD',
        ],
        [
          {
            command: 'Set On Level',
            onLevel: 230,
          },
          '02620000001F2E000006E600000000000000000000E6',
        ],
        [
          { command: 'Set On Level' },
          '02620000001F2E0000060000000000000000000000CC',
        ],
        [
          {
            command: 'Set LED Brightness',
            ledBrightness: 240,
          },
          '02620000001F2E000007F000000000000000000000DB',
        ],
        [
          { command: 'Set LED Brightness' },
          '02620000001F2E0000070000000000000000000000CB',
        ],

        [
          {
            command: 'Read ALL-Link Database',
            address: '1234',
            numberRecords: 300,
          },
          '02620000001F2F0000001234FF00000000000000008C',
        ],
        [
          { command: 'Read ALL-Link Database' },
          '02620000001F2F0000000000000000000000000000D1',
        ],
        [
          {
            command: 'Trigger Group',
            groupNumber: 1,
            useLocalOnLevel: true,
            onLevel: 200,
            useLocalRampRate: true,
          },
          '02620000001F30000100C830000000000000000000D7',
        ],
        [
          { command: 'Trigger Group' },
          '02620000001F3000000100300001000000000000009E',
        ],
        // All-LINK Broadcast Commands
        [
          { command: 'ALL-Link Alias 1 Low' },
          '0262000000CF1300',
        ],
        // Standard-length Broadcast Commands
        [
          { command: 'Test Powerline Phase A' },
          '02620000FF8F0300',
        ],
        [
          { command: 'Test Powerline Phase B' },
          '02620000FF8F0301',
        ],
        [
          { command: 'bogus' },
          '',
        ],
      ]
    )
  })
})

describe('commandResponseMatcher', () => {
  describe('with matching response', () => {
    unroll(
      '#response should match #command',
      testArgs => {
        const matcher = commandResponseMatcher(testArgs.command)
        expect(matcher(testArgs.response)).toBe(true)
      },

      [
        ['command', 'response'],
        [
          { command: 'Get IM Info' },
          { command: 'Get IM Info', ack: true },
        ],
        [
          { command: 'Get IM Info' },
          { command: 'Get IM Info', ack: false },
        ],
        [
          { command: 'Send ALL-Link Command' },
          { command: 'Send ALL-Link Command' },
        ],
        [
          { command: 'Send INSTEON Standard-length Message' },
          { command: 'Send INSTEON Standard-length Message' },
        ],
        [
          { command: 'Send INSTEON Extended-length Message' },
          { command: 'Send INSTEON Extended-length Message' },
        ],
        [
          { command: 'Start ALL-Linking' },
          { command: 'Start ALL-Linking' },
        ],
        [
          { command: 'Cancel ALL-Linking' },
          { command: 'Cancel ALL-Linking' },
        ],
        [
          { command: 'Set Host Device Category' },
          { command: 'Set Host Device Category' },
        ],
        [
          { command: 'Reset the IM' },
          { command: 'Reset the IM' },
        ],
        [
          { command: 'Set INSTEON ACK Message Byte' },
          { command: 'Set INSTEON ACK Message Byte' },
        ],
        [
          { command: 'Get First ALL-Link Record' },
          { command: 'ALL-Link Record Response' },
        ],
        [
          { command: 'Get First ALL-Link Record' },
          { command: 'Get First ALL-Link Record', ack: false },
        ],
        [
          { command: 'Get Next ALL-Link Record' },
          { command: 'ALL-Link Record Response' },
        ],
        [
          { command: 'Get Next ALL-Link Record' },
          { command: 'Get Next ALL-Link Record', ack: false },
        ],
        [
          { command: 'Set IM Configuration' },
          { command: 'Set IM Configuration' },
        ],
        [
          { command: 'Get ALL-Link Record for Sender' },
          { command: 'ALL-Link Record Response' },
        ],
        [
          { command: 'Get ALL-Link Record for Sender' },
          { command: 'Get ALL-Link Record for Sender', ack: false },
        ],
        [
          { command: 'IM LED On' },
          { command: 'IM LED On' },
        ],
        [
          { command: 'IM LED Off' },
          { command: 'IM LED Off' },
        ],
        [
          { command: 'Set INSTEON NAK Message Byte' },
          { command: 'Set INSTEON NAK Message Byte' },
        ],
        [
          { command: 'Set INSTEON ACK Message Two Bytes' },
          { command: 'Set INSTEON ACK Message Two Bytes' },
        ],
        [
          { command: 'RF Sleep' },
          { command: 'RF Sleep' },
        ],
        [
          { command: 'Get IM Configuration' },
          { command: 'Get IM Configuration' },
        ],
        [
          { command: 'Cancel Cleanup' },
          { command: 'Cancel Cleanup' },
        ],
        [
          { command: 'Read 8 bytes from Database' },
          { command: 'Database Record Found' },
        ],
        [
          { command: 'Read 8 bytes from Database' },
          { command: 'Read 8 bytes from Database', ack: false },
        ],
        [
          { command: 'Beep IM' },
          { command: 'Beep IM' },
        ],
        [
          { command: 'Set Status' },
          { command: 'Set Status' },
        ],
        [
          { command: 'Set Database Link Data for next Link' },
          { command: 'Set Database Link Data for next Link' },
        ],
        [
          { command: 'Set Application Retries for New Links' },
          { command: 'Set Application Retries for New Links' },
        ],
        [
          { command: 'Set RF Frequency Offset' },
          { command: 'Set RF Frequency Offset' },
        ],
        [
          { command: 'Set RF Frequency Offset' },
          { command: 'Set RF Frequency Offset' },
        ],
        [
          { command: '7F Command' },
          { command: '7F Command' },
        ],
        [
          { command: 'OFF (Bottom Outlet)' },
          { command: 'INSTEON Standard Message Received', command1: '13', command2: '00' },
        ],
      ]
    )
  })

  describe('with non-matching response', () => {
    let consoleWarnMock
    beforeAll(() => {
      consoleWarnMock = jest.spyOn(console, 'warn').mockImplementation()
    })
    afterAll(() => {
      consoleWarnMock.mockRestore()
    })

    unroll(
      '#response should not match #command',
      function (testArgs) {
        const matcher = commandResponseMatcher(testArgs.command)
        expect(matcher(testArgs.response)).toBe(false)
      },

      [
        ['command', 'response'],
        [
          { command: 'Get IM Info' },
          { command: 'IM LED On', ack: true },
        ],
        [
          { command: 'Get First ALL-Link Record' },
          { command: 'Get First ALL-Link Record', ack: true },
        ],
        [
          { command: 'Get Next ALL-Link Record' },
          { command: 'Get Next ALL-Link Record', ack: true },
        ],
        [
          { command: 'Get ALL-Link Record for Sender' },
          { command: 'Get ALL-Link Record for Sender', ack: true },
        ],
        [
          { command: 'Read 8 bytes from Database' },
          { command: 'Read 8 bytes from Database', ack: true },
        ],
        [
          { command: 'bogus' },
          { command: 'bogus' },
        ],
        [
          { command: 'OFF (Bottom Outlet)' },
          { command: 'INSTEON Standard Message Received', command1: '13', command2: '01' },
        ],
      ]
    )
  })
})
