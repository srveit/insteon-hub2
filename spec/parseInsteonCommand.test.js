'use strict'
const unroll = require('unroll')
const { parseInsteonCommand } = require('../lib/parseInsteonCommand')

unroll.use(it)

describe('parseInsteonCommand', () => {
  describe('allLink commands', () => {
    describe('with no previousCommand', () => {
      unroll(
        '#response should be parsed as #command',
        testArgs => {
          const response = Object.assign({ messageType: 'allLink' }, testArgs.response)
          const command = Object.assign(
            {
              messageType: 'allLinkBroadcast',
              command1: testArgs.response.allLinkCommand,
            },
            testArgs.command
          )
          const result1 = parseInsteonCommand(response, undefined)
          expect(result1).toEqual(command)
        },
        [
          ['response', 'command'],
          [
            { allLinkCommand: '06', command2: '10' },
            { command: 'ALL-Link Cleanup Status Report', groupNumber: 16 },
          ],
          [
            { allLinkCommand: '06', command2: '10', cleanUpCommand1: '01' },
            { command: 'ALL-Link Cleanup Status Report', groupNumber: 16, cleanUpCommand: 'cleanUpCommand 01' },
          ],
          [
            { allLinkCommand: '06', command2: '10', cleanUpCommand1: '12' },
            { command: 'ALL-Link Cleanup Status Report', groupNumber: 16, cleanUpCommand: 'ALL-Link Alias 2 High' },
          ],
          [
            { allLinkCommand: '11', command2: '20', numberDevices: 4 },
            { command: 'ALL-Link Recall', groupNumber: 32, numberDevices: 4 },
          ],
          [
            { allLinkCommand: '12', command2: 'FF' },
            { command: 'ALL-Link Alias 2 High', groupNumber: 255 },
          ],
          [
            { allLinkCommand: '13', command2: '00' },
            { command: 'ALL-Link Alias 1 Low', groupNumber: 0 },
          ],
          [
            { allLinkCommand: '14', command2: '12' },
            { command: 'ALL-Link Alias 2 Low', groupNumber: 18 },
          ],
          [
            { allLinkCommand: '15', command2: '88' },
            { command: 'ALL-Link Alias 3 High', groupNumber: 136 },
          ],
          [
            { allLinkCommand: '16', command2: '90' },
            { command: 'ALL-Link Alias 3 Low', groupNumber: 144 },
          ],
          [
            { allLinkCommand: '17', command2: '3A' },
            { command: 'ALL-Link Alias 4 High', groupNumber: 58 },
          ],
          [
            { allLinkCommand: '18', command2: 'DE' },
            { command: 'ALL-Link Alias 4 Low', groupNumber: 222 },
          ],
        ]
      )
    })
  })

  describe('broadcast commands', () => {
    describe('with no previousCommand', () => {
      unroll(
        '#response should be parsed as #command',
        testArgs => {
          const response = Object.assign({ messageType: 'broadcast' }, testArgs.response)
          const command = Object.assign({ messageType: 'broadcast' }, testArgs.command)
          const result1 = parseInsteonCommand(response, undefined)
          expect(result1).toEqual(command)
        },
        [
          ['response', 'command'],
          [
            { command1: '01', command2: '10' },
            { command: 'SET Button Pressed Responder', hardwareVersion: '10' },
          ],
          [
            { command1: '02', command2: '20' },
            { command: 'SET Button Pressed Controller', hardwareVersion: '20' },
          ],
          [
            { command1: '03', command2: '00' },
            { command: 'Test Powerline Phase', phase: 'A' },
          ],
          [
            { command1: '03', command2: '01' },
            { command: 'Test Powerline Phase', phase: 'B' },
          ],
        ]
      )
    })
  })

  describe('direct commands', () => {
    describe('with no previousCommand', () => {
      unroll(
        '#response should be parsed as #command',
        testArgs => {
          const response = Object.assign({ messageType: 'direct' }, testArgs.response)
          const command = Object.assign({ messageType: 'direct' }, testArgs.command)
          const result1 = parseInsteonCommand(response, undefined)
          expect(result1).toEqual(command)
        },
        [
          ['response', 'command'],
          [
            { command1: '01', command2: '10' },
            { command: 'Assign to ALL-Link Group', groupNumber: 16 },
          ],
          [
            { command1: '02', command2: '10' },
            { command: 'Delete from ALL-Link Group', groupNumber: 16 },
          ],
          [
            { command1: '03', command2: '00' },
            { command: 'Product Data Request' },
          ],
          [
            { command1: '03', command2: '01' },
            { command: 'FX Username Request' },
          ],
          [
            { command1: '03', command2: '02' },
            { command: 'Device Text String Request' },
          ],
          // 04-08 Reserved
          [
            { command1: '09', command2: '10' },
            { command: 'Enter Linking Mode', groupNumber: 16 },
          ],
          [
            { command1: '0A', command2: '10' },
            { command: 'Enter Unlinking Mode', groupNumber: 16 },
          ],
          // 0B-0C Reserved
          [
            { command1: '0D', command2: '00' },
            { command: 'Get INSTEON Engine Version' },
          ],
          // 0E Reserved
          [
            { command1: '0F', command2: '10' },
            { command: 'Ping', data: 16 },
          ],
          [
            { command1: '10', command2: '10' },
            { command: 'ID Request', data: 16 },
          ],
          [
            { command1: '11', command2: '10' },
            { command: 'Light ON', onLevel: 16 },
          ],
          [
            { command1: '12', command2: '10' },
            { command: 'Light ON Fast', onLevel: 16 },
          ],
          [
            { command1: '13', command2: '10' },
            { command: 'Light OFF', data: 16 },
          ],
          [
            { command1: '14', command2: '10' },
            { command: 'Light OFF Fast', data: 16 },
          ],
          [
            { command1: '15', command2: '10' },
            { command: 'Light Brighten One Step', data: 16 },
          ],
          [
            { command1: '16', command2: '10' },
            { command: 'Light Dim One Step', data: 16 },
          ],
          [
            { command1: '17', command2: '00' },
            { command: 'Light Start Manual Change', direction: 'down' },
          ],
          [
            { command1: '17', command2: '01' },
            { command: 'Light Start Manual Change', direction: 'up' },
          ],
          [
            { command1: '18', command2: '10' },
            { command: 'Light Stop Manual Change', data: 16 },
          ],
          [
            { command1: '19', command2: '10' },
            { command: 'Light Status Request', type: 16 },
          ],
          [
            { command1: '19', command2: '00' },
            { command: 'Light Status Request' },
          ],
          [
            { command1: '19', command2: '01' },
            { command: 'Outlet Status Request' },
          ],
          [
            { command1: '19', command2: '02' },
            { command: 'Light Status Request 02' },
          ],
          // 1A-1E Reserved
          [
            { command1: '1F', command2: '00' },
            { command: 'Get Operating Flags' },
          ],
          [
            { command1: '1F', command2: '01' },
            { command: 'Get ALL-Link Database Delta' },
          ],
          [
            { command1: '1F', command2: '02' },
            { command: 'Get Signal-to-Noise Value' },
          ],
          [
            { command1: '1F', command2: '05' },
            { command: 'Get Operating Flags 2' },
          ],
          [
            { command1: '20', command2: '00' },
            { command: 'Set Program Lock On' },
          ],
          [
            { command1: '20', command2: '01' },
            { command: 'Set Program Lock Off' },
          ],
          [
            { command1: '20', command2: '02' },
            { command: 'Set Program LED On' },
          ],
          [
            { command1: '20', command2: '03' },
            { command: 'Set Program LED Off' },
          ],
          [
            { command1: '20', command2: '04' },
            { command: 'Set Program Beeper On' },
          ],
          [
            { command1: '20', command2: '05' },
            { command: 'Set Program Beeper Off' },
          ],
          [
            { command1: '20', command2: '06' },
            { command: 'Set Program Stay Awake On' },
          ],
          [
            { command1: '20', command2: '07' },
            { command: 'Set Program Stay Awake Off' },
          ],
          [
            { command1: '20', command2: '08' },
            { command: 'Set Program Listen Only On' },
          ],
          [
            { command1: '20', command2: '09' },
            { command: 'Set Program Listen Only Off' },
          ],
          [
            { command1: '20', command2: '0A' },
            { command: 'Set Program No I\'m Alive On' },
          ],
          [
            { command1: '20', command2: '0B' },
            { command: 'Set Program No I\'m Alive Off' },
          ],
          [
            { command1: '21', command2: '10' },
            { command: 'Light Instant Change', onLevel: 16 },
          ],
          [
            { command1: '22', command2: '10' },
            { command: 'Light Manually Turned Off', data: 16 },
          ],
          [
            { command1: '23', command2: '10' },
            { command: 'Light Manually Turned On', data: 16 },
          ],
          [
            { command1: '24', command2: '10' },
            { command: 'Reread Init Values', data: 16 },
          ],
          [
            { command1: '25', command2: '01' },
            { command: 'Remote SET Button Tap' },
          ],
          [
            { command1: '25', command2: '02' },
            { command: 'Remote SET Button Tap Twice' },
          ],
          // 26 Reserved
          [
            { command1: '27', command2: '10' },
            { command: 'Light Set Status', onLevel: 16 },
          ],
          // 28-2D Deprecated
          [
            { command1: '2E', command2: '88' },
            { command: 'Light ON at Ramp Rate', onLevel: 143, rampRate: 17 },
          ],
          // 2F-31 ?
          [
            { command1: '32', command2: '01' },
            { command: 'Outlet ON (top)' },
          ],
          [
            { command1: '32', command2: '02' },
            { command: 'Outlet ON (bottom)' },
          ],
          [
            { command1: '33', command2: '01' },
            { command: 'Outlet OFF (top)' },
          ],
          [
            { command1: '33', command2: '02' },
            { command: 'Outlet OFF (bottom)' },
          ],
          // 34-3F Reserved
        ]
      )
    })
  })

  describe('directAck commands', () => {
    describe('with no previousCommand', () => {
      unroll(
        '#response should be parsed as #command',
        testArgs => {
          const response = Object.assign({ messageType: 'directAck' }, testArgs.response)
          const command = Object.assign({ messageType: 'directAck' }, testArgs.command)
          const result1 = parseInsteonCommand(response, undefined)
          expect(result1).toEqual(command)
        },
        [
          ['response', 'command'],
          [
            { command1: '01', command2: '02' },
            { command: 'Assign to ALL-Link Group', groupNumber: 2 },
          ],
          [
            { command1: '02', command2: '03' },
            { command: 'Delete from ALL-Link Group', groupNumber: 3 },
          ],
          [
            { command1: '03', command2: '00' },
            { command: 'Product Data Request' },
          ],
          [
            { command1: '03', command2: '01' },
            { command: 'FX Username Request' },
          ],
          [
            { command1: '03', command2: '02' },
            { command: 'Device Text String Request' },
          ],
          [
            { command1: '03', command2: '03' },
            { command: 'Device Info Request', command2: '03' },
          ],
          // 04-08 Reserved
          [
            { command1: '09', command2: '04' },
            { command: 'Enter Linking Mode', groupNumber: 4 },
          ],
          [
            { command1: '0A', command2: '05' },
            { command: 'Enter Unlinking Mode', groupNumber: 5 },
          ],
          // 0B-0C Reserved
          [
            { command1: '0D', command2: '00' },
            { command: 'Get INSTEON Engine Version', engineVersion: 'i1' },
          ],
          // 0E Reserved
          [
            { command1: '0F', command2: '33' },
            { command: 'Ping', data: 51 },
          ],
          [
            { command1: '10', command2: '44' },
            { command: 'ID Request', data: 68 },
          ],
          [
            { command1: '11', command2: '00' },
            { command: 'Light ON', onLevel: 0 },
          ],
          [
            { command1: '12', command2: 'FF' },
            { command: 'Light ON Fast', onLevel: 255 },
          ],
          [
            { command1: '13', command2: '00' },
            { command: 'Light OFF' },
          ],
          [
            { command1: '14', command2: '00' },
            { command: 'Light OFF Fast' },
          ],
          [
            { command1: '15', command2: '00' },
            { command: 'Light Brighten One Step' },
          ],
          [
            { command1: '16', command2: '00' },
            { command: 'Light Dim One Step' },
          ],
          [
            { command1: '17', command2: '00' },
            { command: 'Light Start Manual Change', direction: 'down' },
          ],
          [
            { command1: '17', command2: '01' },
            { command: 'Light Start Manual Change', direction: 'up' },
          ],
          [
            { command1: '18', command2: '00' },
            { command: 'Light Stop Manual Change', data: 0 },
          ],
          [
            { command1: '19', command2: '00' },
            { command: 'Light Status Response', allLinkDatabaseDelta: 25, onLevel: 0 },
          ],
          [
            { command1: '19', command2: '01' },
            { command: 'Outlet Status Response', allLinkDatabaseDelta: 25, bottom: 'off', top: 'on' },
          ],
          [
            { command1: '19', command2: '02' },
            { command: 'Outlet Status Response', allLinkDatabaseDelta: 25, bottom: 'on', top: 'off' },
          ],
          [
            { command1: '19', command2: '03' },
            { command: 'Outlet Status Response', allLinkDatabaseDelta: 25, bottom: 'on', top: 'on' },
          ],
          [
            { command1: '19', command2: '04' },
            { command: '19-- Response', allLinkDatabaseDelta: 25, command2: '04' },
          ],
          // 1A-1E Reserved
          [
            { command1: '1F', command2: '00' },
            {
              command: 'Get Operating Flags',
              backlightOn: false,
              beeperOn: false,
              heartbeatOff: false,
              keybeepOn: false,
              ledOff: false,
              ledOnDuringTransmit: false,
              loadSenseBottomOn: false,
              loadSenseOn: false,
              loadSenseTopOn: false,
              numberKeys: 6,
              powerlineOff: false,
              programmingLockOn: false,
              receiveOnly: false,
              resumeDimEnabled: false,
              rfOff: false,
              stayAwake: false,
            },
          ],
          [
            { command1: '1F', command2: '01' },
            { command: 'Get ALL-Link Database Delta', allLinkDatabaseDelta: 1 },
          ],
          [
            { command1: '1F', command2: '02' },
            { command: 'Get Signal-to-Noise Value', signalToNoise: 2 },
          ],
          [
            { command1: '1F', command2: '05' },
            {
              command: 'Get Operating Flags 2',
              bit0: true,
              bit5: false,
              bit7: false,
              cleanupReportOn: false,
              errorBlinkOn: true,
              lockButtonsOn: false,
              noX10: false,
              smartHopsOff: false,
            },
          ],
          [
            { command1: '20', command2: '00' },
            { command: 'Set Program Lock On', data: 0 },
          ],
          [
            { command1: '20', command2: '01' },
            { command: 'Set Program Lock Off', data: 1 },
          ],
          [
            { command1: '20', command2: '02' },
            { command: 'Set Program LED On', data: 2 },
          ],
          [
            { command1: '20', command2: '03' },
            { command: 'Set Program LED Off', data: 3 },
          ],
          [
            { command1: '20', command2: '04' },
            { command: 'Set Program Beeper On', data: 4 },
          ],
          [
            { command1: '20', command2: '05' },
            { command: 'Set Program Beeper Off', data: 5 },
          ],
          [
            { command1: '20', command2: '06' },
            { command: 'Set Program Stay Awake On', data: 6 },
          ],
          [
            { command1: '20', command2: '07' },
            { command: 'Set Program Stay Awake Off', data: 7 },
          ],
          [
            { command1: '20', command2: '08' },
            { command: 'Set Program Listen Only On', data: 8 },
          ],
          [
            { command1: '20', command2: '09' },
            { command: 'Set Program Listen Only Off', data: 9 },
          ],
          [
            { command1: '20', command2: '0A' },
            { command: 'Set Program No I\'m Alive On', data: 10 },
          ],
          [
            { command1: '20', command2: '0B' },
            { command: 'Set Program No I\'m Alive Off', data: 11 },
          ],
          [
            { command1: '2E', command2: 'FF' },
            { command: 'Light ON at Ramp Rate', onLevel: 255, rampRate: 31 },
          ],
          [
            { command1: '2F', command2: '00' },
            { command: '2F-- Response' },
          ],
          [
            { command1: '30', command2: '00' },
            { command: 'Trigger Group', groupNumber: 0 },
          ],
          [
            { command1: '32', command2: '00' },
            { command: 'Outlet ON (undefined)' },
          ],
          [
            { command1: '32', command2: '01' },
            { command: 'Outlet ON (undefined)' },
          ],
          [
            { command1: '33', command2: '00' },
            { command: 'Outlet OFF (undefined)' },
          ],
          [
            { command1: '33', command2: '01' },
            { command: 'Outlet OFF (undefined)' },
          ],
        ]
      )
    })

    describe('with previousCommand', () => {
      unroll(
        '#previous, #response should be parsed as #command',
        testArgs => {
          const response = Object.assign({ messageType: 'directAck' }, testArgs.response)
          const result1 = parseInsteonCommand(response, testArgs.previous)
          const command = Object.assign({ messageType: 'directAck' }, testArgs.command)
          expect(result1).toEqual(command)
        },
        [
          ['previous', 'response', 'command'],
          [
            { command1: '01', command2: '02' },
            { command1: '01', command2: '02' },
            { command: 'Assign to ALL-Link Group', groupNumber: 2 },
          ],
          [
            { command1: '02', command2: '03' },
            { command1: '02', command2: '03' },
            { command: 'Delete from ALL-Link Group', groupNumber: 3 },
          ],
          [
            { command1: '03', command2: '00' },
            { command1: '03', command2: '00' },
            { command: 'Product Data Request' },
          ],
          [
            { command1: '03', command2: '01' },
            { command1: '03', command2: '01' },
            { command: 'FX Username Request' },
          ],
          [
            { command1: '03', command2: '02' },
            { command1: '03', command2: '02' },
            { command: 'Device Text String Request' },
          ],
          [
            { command1: '03', command2: '12' },
            { command1: '03', command2: '03' },
            { command: 'Device Info Request', command2: '12' },
          ],
          // 04-08 Reserved
          [
            { command1: '09', command2: '04' },
            { command1: '09', command2: '04' },
            { command: 'Enter Linking Mode', groupNumber: 4 },
          ],
          [
            { command1: '0A', command2: '05' },
            { command1: '0A', command2: '05' },
            { command: 'Enter Unlinking Mode', groupNumber: 5 },
          ],
          // 0B-0C Reserved
          [
            { command1: '0D', command2: '00' },
            { command1: '0D', command2: '00' },
            { command: 'Get INSTEON Engine Version', engineVersion: 'i1' },
          ],
          [
            { command1: '0D', command2: '00' },
            { command1: '0D', command2: '01' },
            { command: 'Get INSTEON Engine Version', engineVersion: 'i2' },
          ],
          [
            { command1: '0D', command2: '00' },
            { command1: '0D', command2: '02' },
            { command: 'Get INSTEON Engine Version', engineVersion: '02' },
          ],
          // 0E Reserved
          [
            { command1: '0F', command2: '33' },
            { command1: '0F', command2: '33' },
            { command: 'Ping', data: 51 },
          ],
          [
            { command1: '10', command2: '44' },
            { command1: '10', command2: '44' },
            { command: 'ID Request', data: 68 },
          ],
          [
            { command1: '11', command2: '00' },
            { command1: '11', command2: '00' },
            { command: 'Light ON', onLevel: 0 },
          ],
          [
            { command1: '12', command2: 'FF' },
            { command1: '12', command2: 'FF' },
            { command: 'Light ON Fast', onLevel: 255 },
          ],
          [
            { command1: '13', command2: '00' },
            { command1: '13', command2: '00' },
            { command: 'Light OFF' },
          ],
          [
            { command1: '14', command2: '00' },
            { command1: '14', command2: '00' },
            { command: 'Light OFF Fast' },
          ],
          [
            { command1: '15', command2: '00' },
            { command1: '15', command2: '00' },
            { command: 'Light Brighten One Step' },
          ],
          [
            { command1: '16', command2: '00' },
            { command1: '16', command2: '00' },
            { command: 'Light Dim One Step' },
          ],
          [
            { command1: '17', command2: '00' },
            { command1: '17', command2: '00' },
            { command: 'Light Start Manual Change', direction: 'down' },
          ],
          [
            { command1: '17', command2: '01' },
            { command1: '17', command2: '01' },
            { command: 'Light Start Manual Change', direction: 'up' },
          ],
          [
            { command1: '18', command2: '00' },
            { command1: '18', command2: '00' },
            { command: 'Light Stop Manual Change', data: 0 },
          ],
          [
            { command1: '19', command2: '00' },
            { command1: '19', command2: 'FF' },
            {
              command: 'Light Status Response',
              allLinkDatabaseDelta: 25,
              onLevel: 255,
            },
          ],
          [
            { command1: '19', command2: '01' },
            { command1: '40', command2: '00' },
            {
              command: 'Outlet Status Response',
              top: 'off',
              bottom: 'off',
              allLinkDatabaseDelta: 64,
            },
          ],
          [
            { command1: '19', command2: '02' },
            { command1: '50', command2: '01' },
            {
              command: 'Outlet Status Response',
              top: 'on',
              bottom: 'off',
              allLinkDatabaseDelta: 80,
            },
          ],
          [
            { command1: '19', command2: '02' },
            { command1: '60', command2: '02' },
            {
              command: 'Outlet Status Response',
              top: 'off',
              bottom: 'on',
              allLinkDatabaseDelta: 96,
            },
          ],
          [
            { command1: '19', command2: '03' },
            { command1: '70', command2: '03' },
            {
              command: 'Outlet Status Response',
              top: 'on',
              bottom: 'on',
              allLinkDatabaseDelta: 112,
            },
          ],
          [
            { command1: '19', command2: '04' },
            { command1: '80', command2: '67' },
            {
              command: '1904 Response',
              command2: '67',
              allLinkDatabaseDelta: 128,
            },
          ],
          // 1A-1E Reserved
          [
            { command1: '1F', command2: '00' },
            { command1: '1F', command2: 'FF' },
            {
              command: 'Get Operating Flags',
              programmingLockOn: true,
              ledOnDuringTransmit: true,
              resumeDimEnabled: true,
              loadSenseTopOn: true,
              beeperOn: true,
              numberKeys: 8,
              stayAwake: true,
              loadSenseBottomOn: true,
              receiveOnly: true,
              backlightOn: true,
              ledOff: true,
              heartbeatOff: true,
              loadSenseOn: true,
              keybeepOn: true,
              rfOff: true,
              powerlineOff: true,
            },
          ],
          [
            { command1: '1F', command2: '00' },
            { command1: '1F', command2: '00' },
            {
              command: 'Get Operating Flags',
              programmingLockOn: false,
              ledOnDuringTransmit: false,
              resumeDimEnabled: false,
              loadSenseTopOn: false,
              beeperOn: false,
              numberKeys: 6,
              stayAwake: false,
              loadSenseBottomOn: false,
              receiveOnly: false,
              backlightOn: false,
              ledOff: false,
              heartbeatOff: false,
              loadSenseOn: false,
              keybeepOn: false,
              rfOff: false,
              powerlineOff: false,
            },
          ],
          [
            { command1: '1F', command2: '01' },
            { command1: '1F', command2: '7F' },
            {
              command: 'Get ALL-Link Database Delta',
              allLinkDatabaseDelta: 127,
            },
          ],
          [
            { command1: '1F', command2: '02' },
            { command1: '1F', command2: 'E0' },
            {
              command: 'Get Signal-to-Noise Value',
              signalToNoise: 224,
            },
          ],
          [
            { command1: '1F', command2: '05' },
            { command1: '1F', command2: 'FF' },
            {
              command: 'Get Operating Flags 2',
              bit0: true,
              noX10: true,
              errorBlinkOn: true,
              cleanupReportOn: true,
              lockButtonsOn: true,
              bit5: true,
              smartHopsOff: true,
              bit7: true,
            },
          ],
          [
            { command1: '1F', command2: '06' },
            { command1: '1F', command2: '12' },
            {
              command: 'Get Operating Flags',
              command2: '12',
            },
          ],
          [
            { command1: '20', command2: '00' },
            { command1: '20', command2: '00' },
            { command: 'Set Program Lock On', data: 0 },
          ],
          [
            { command1: '20', command2: '01' },
            { command1: '20', command2: '01' },
            { command: 'Set Program Lock Off', data: 1 },
          ],
          [
            { command1: '20', command2: '02' },
            { command1: '20', command2: '02' },
            { command: 'Set Program LED On', data: 2 },
          ],
          [
            { command1: '20', command2: '03' },
            { command1: '20', command2: '03' },
            { command: 'Set Program LED Off', data: 3 },
          ],
          [
            { command1: '20', command2: '04' },
            { command1: '20', command2: '04' },
            { command: 'Set Program Beeper On', data: 4 },
          ],
          [
            { command1: '20', command2: '05' },
            { command1: '20', command2: '05' },
            { command: 'Set Program Beeper Off', data: 5 },
          ],
          [
            { command1: '20', command2: '06' },
            { command1: '20', command2: '06' },
            { command: 'Set Program Stay Awake On', data: 6 },
          ],
          [
            { command1: '20', command2: '07' },
            { command1: '20', command2: '07' },
            { command: 'Set Program Stay Awake Off', data: 7 },
          ],
          [
            { command1: '20', command2: '08' },
            { command1: '20', command2: '08' },
            { command: 'Set Program Listen Only On', data: 8 },
          ],
          [
            { command1: '20', command2: '09' },
            { command1: '20', command2: '09' },
            { command: 'Set Program Listen Only Off', data: 9 },
          ],
          [
            { command1: '20', command2: '0A' },
            { command1: '20', command2: '0A' },
            { command: 'Set Program No I\'m Alive On', data: 10 },
          ],
          [
            { command1: '20', command2: '0B' },
            { command1: '20', command2: '0B' },
            { command: 'Set Program No I\'m Alive Off', data: 11 },
          ],
          [
            { command1: '2E', command2: 'FF' },
            { command1: '2E', command2: 'FF' },
            { command: 'Light ON at Ramp Rate', onLevel: 255, rampRate: 31 },
          ],
          [
            { command1: '2F', command2: '00' },
            { command1: '2F', command2: '00' },
            { command: 'Read/Write ALL-Link Database' },
          ],
          [
            { command1: '2F', command2: '01' },
            { command1: '2F', command2: '01' },
            { command: 'Read/Write ALL-Link Database (PLM)' },
          ],
          [
            { command1: '2F', command2: '02' },
            { command1: '2F', command2: '02' },
            { command: 'Read/Write IR Code Database' },
          ],
          [
            { command1: '2F', command2: '03' },
            { command1: '2F', command2: '03' },
            { command: '2F03 Response' },
          ],
          [
            { command1: '30', command2: '00' },
            { command1: '30', command2: '00' },
            { command: 'Trigger Group', groupNumber: 0 },
          ],
          [
            { command1: '32', command2: '00' },
            { command1: '32', command2: '00' },
            { command: 'Outlet ON (undefined)' },
          ],
          [
            { command1: '32', command2: '01' },
            { command1: '32', command2: '00' },
            { command: 'Outlet ON (top)' },
          ],
          [
            { command1: '32', command2: '02' },
            { command1: '32', command2: '00' },
            { command: 'Outlet ON (bottom)' },
          ],
          [
            { command1: '33', command2: '00' },
            { command1: '33', command2: '00' },
            { command: 'Outlet OFF (undefined)' },
          ],
          [
            { command1: '33', command2: '01' },
            { command1: '33', command2: '00' },
            { command: 'Outlet OFF (top)' },
          ],
          [
            { command1: '33', command2: '02' },
            { command1: '33', command2: '00' },
            { command: 'Outlet OFF (bottom)' },
          ],
        ]
      )
    })
  })

  describe('directNak commands', () => {
    describe('with no previousCommand', () => {
      unroll(
        '#response should be parsed as #command',
        testArgs => {
          const response = Object.assign({ messageType: 'directNak' }, testArgs.response)
          const command = Object.assign({ messageType: 'directNak', command2: undefined, previousCommand: undefined }, testArgs.command)
          const result1 = parseInsteonCommand(response, undefined)
          expect(result1).toEqual(command)
        },
        [
          ['response', 'command'],
          [
            { command1: '01', command2: '02' },
            { command: 'Assign to ALL-Link Group', error: 'Reserved' },
          ],
          [
            { command1: '02', command2: '03' },
            { command: 'Delete from ALL-Link Group', error: 'Reserved' },
          ],
          [
            { command1: '03', command2: '00' },
            { command: 'Device Text String Request', error: 'Reserved' },
          ],
          [
            { command1: '03', command2: '01' },
            { command: 'Device Text String Request', error: 'Reserved' },
          ],
          [
            { command1: '03', command2: '02' },
            { command: 'Device Text String Request', error: 'Reserved' },
          ],
          [
            { command1: '09', command2: '04' },
            { command: 'Enter Linking Mode', error: 'Reserved' },
          ],
          [
            { command1: '0A', command2: '05' },
            { command: 'Enter Unlinking Mode', error: 'Reserved' },
          ],
          [
            { command1: '0D', command2: '00' },
            { command: 'Get INSTEON Engine Version', error: 'Reserved' },
          ],
          [
            { command1: '0D', command2: '01' },
            { command: 'Get INSTEON Engine Version', error: 'Reserved' },
          ],
          [
            { command1: '0F', command2: '33' },
            { command: 'Ping', error: 'Reserved' },
          ],
          [
            { command1: '10', command2: '44' },
            { command: 'ID Request', error: 'Reserved' },
          ],
          [
            { command1: '11', command2: '00' },
            { command: 'Light ON', error: 'Reserved' },
          ],
          [
            { command1: '12', command2: 'FF' },
            { command: 'Light ON Fast', error: 'Not in ALL-Link Group' },
          ],
          [
            { command1: '13', command2: '00' },
            { command: 'Light OFF', error: 'Reserved' },
          ],
          [
            { command1: '14', command2: '00' },
            { command: 'Light OFF Fast', error: 'Reserved' },
          ],
          [
            { command1: '15', command2: '00' },
            { command: 'Light Brighten One Step', error: 'Reserved' },
          ],
          [
            { command1: '16', command2: '00' },
            { command: 'Light Dim One Step', error: 'Reserved' },
          ],
          [
            { command1: '17', command2: '00' },
            { command: 'Light Start Manual Change', error: 'Reserved' },
          ],
          [
            { command1: '17', command2: '01' },
            { command: 'Light Start Manual Change', error: 'Reserved' },
          ],
          [
            { command1: '18', command2: '00' },
            { command: 'Light Stop Manual Change', error: 'Reserved' },
          ],
          [
            { command1: '19', command2: '00' },
            { command: 'Light Status Request 02', error: 'Reserved' },
          ],
          [
            { command1: '19', command2: '01' },
            { command: 'Light Status Request 02', error: 'Reserved' },
          ],
          [
            { command1: '19', command2: '02' },
            { command: 'Light Status Request 02', error: 'Reserved' },
          ],
          [
            { command1: '19', command2: '03' },
            { command: 'Light Status Request 02', error: 'Reserved' },
          ],
          [
            { command1: '19', command2: '04' },
            { command: 'Light Status Request 02', error: 'Reserved' },
          ],
          [
            { command1: '1F', command2: '00', error: 'Reserved' },
            { command: 'Get Operating Flags 2', error: 'Reserved' },
          ],
          [
            { command1: '1F', command2: '01' },
            { command: 'Get Operating Flags 2', error: 'Reserved' },
          ],
          [
            { command1: '1F', command2: '02' },
            { command: 'Get Operating Flags 2', error: 'Reserved' },
          ],
          [
            { command1: '1F', command2: '05' },
            { command: 'Get Operating Flags 2', error: 'Reserved' },
          ],
          [
            { command1: '20', command2: '00' },
            { command: 'Set Program No I\'m Alive Off', error: 'Reserved' },
          ],
          [
            { command1: '20', command2: '01' },
            { command: 'Set Program No I\'m Alive Off', error: 'Reserved' },
          ],
          [
            { command1: '20', command2: '02' },
            { command: 'Set Program No I\'m Alive Off', error: 'Reserved' },
          ],
          [
            { command1: '20', command2: '03' },
            { command: 'Set Program No I\'m Alive Off', error: 'Reserved' },
          ],
          [
            { command1: '20', command2: '04' },
            { command: 'Set Program No I\'m Alive Off', error: 'Reserved' },
          ],
          [
            { command1: '20', command2: '05' },
            { command: 'Set Program No I\'m Alive Off', error: 'Reserved' },
          ],
          [
            { command1: '20', command2: '06' },
            { command: 'Set Program No I\'m Alive Off', error: 'Reserved' },
          ],
          [
            { command1: '20', command2: '07' },
            { command: 'Set Program No I\'m Alive Off', error: 'Reserved' },
          ],
          [
            { command1: '20', command2: '08' },
            { command: 'Set Program No I\'m Alive Off', error: 'Reserved' },
          ],
          [
            { command1: '20', command2: '09' },
            { command: 'Set Program No I\'m Alive Off', error: 'Reserved' },
          ],
          [
            { command1: '20', command2: '0A' },
            { command: 'Set Program No I\'m Alive Off', error: 'Reserved' },
          ],
          [
            { command1: '20', command2: '0B' },
            { command: 'Set Program No I\'m Alive Off', error: 'Reserved' },
          ],
          [
            { command1: '2E', command2: 'FF' },
            { command: 'Light ON at Ramp Rate', error: 'Not in ALL-Link Group' },
          ],
          // [
          //   { command1: '2F', command2: '00' },
          //   { command: '2F-- Response', error: 'Reserved' },
          // ],
          // [
          //   { command1: '30', command2: '00' },
          //   { command: 'Trigger Group', error: 'Reserved' },
          // ],
          [
            { command1: '32', command2: '00' },
            { command: 'Outlet ON (bottom)', error: 'Reserved' },
          ],
          [
            { command1: '32', command2: '01' },
            { command: 'Outlet ON (bottom)', error: 'Reserved' },
          ],
          [
            { command1: '33', command2: '00' },
            { command: 'Outlet OFF (bottom)', error: 'Reserved' },
          ],
          [
            { command1: '33', command2: '01' },
            { command: 'Outlet OFF (bottom)', error: 'Reserved' },
          ],
        ]
      )
    })
    describe('with previousCommand', () => {
      unroll(
        '#previous, #response should be parsed as #command',
        testArgs => {
          const response = Object.assign({ messageType: 'directNak' }, testArgs.response)
          const command = Object.assign({ messageType: 'directNak', previousCommand: undefined }, testArgs.command)
          const result1 = parseInsteonCommand(response, testArgs.previous)
          expect(result1).toEqual(command)
        },
        [
          ['previous', 'response', 'command'],
          [
            { command2: '00' },
            { command1: '01', command2: '02' },
            { command: 'Assign to ALL-Link Group', error: 'Reserved', command2: '00' },
          ],
          [
            { command2: '00' },
            { command1: '02', command2: '03' },
            { command: 'Delete from ALL-Link Group', error: 'Reserved', command2: '00' },
          ],
          [
            { command2: '00' },
            { command1: '03', command2: '00' },
            { command: 'Device Text String Request', error: 'Reserved', command2: '00' },
          ],
          [
            { command2: '00' },
            { command1: '03', command2: '01' },
            { command: 'Device Text String Request', error: 'Reserved', command2: '00' },
          ],
          [
            { command2: '00' },
            { command1: '03', command2: '02' },
            { command: 'Device Text String Request', error: 'Reserved', command2: '00' },
          ],
          [
            { command2: '00' },
            { command1: '09', command2: '04' },
            { command: 'Enter Linking Mode', error: 'Reserved', command2: '00' },
          ],
          [
            { command2: '00' },
            { command1: '0A', command2: '05' },
            { command: 'Enter Unlinking Mode', error: 'Reserved', command2: '00' },
          ],
          [
            { command2: '00' },
            { command1: '0D', command2: '00' },
            { command: 'Get INSTEON Engine Version', error: 'Reserved', command2: '00' },
          ],
          [
            { command2: '00' },
            { command1: '0D', command2: '01' },
            { command: 'Get INSTEON Engine Version', error: 'Reserved', command2: '00' },
          ],
          [
            { command2: '00' },
            { command1: '0F', command2: '33' },
            { command: 'Ping', error: 'Reserved', command2: '00' },
          ],
          [
            { command2: '00' },
            { command1: '10', command2: '44' },
            { command: 'ID Request', error: 'Reserved', command2: '00' },
          ],
          [
            { command2: '00' },
            { command1: '11', command2: '00' },
            { command: 'Light ON', error: 'Reserved', command2: '00' },
          ],
          [
            { command2: '00' },
            { command1: '12', command2: 'FF' },
            { command: 'Light ON Fast', error: 'Not in ALL-Link Group', command2: '00' },
          ],
          [
            { command2: '00' },
            { command1: '13', command2: '00' },
            { command: 'Light OFF', error: 'Reserved', command2: '00' },
          ],
          [
            { command2: '00' },
            { command1: '14', command2: '00' },
            { command: 'Light OFF Fast', error: 'Reserved', command2: '00' },
          ],
          [
            { command2: '00' },
            { command1: '15', command2: '00' },
            { command: 'Light Brighten One Step', error: 'Reserved', command2: '00' },
          ],
          [
            { command2: '00' },
            { command1: '16', command2: '00' },
            { command: 'Light Dim One Step', error: 'Reserved', command2: '00' },
          ],
          [
            { command2: '00' },
            { command1: '17', command2: '00' },
            { command: 'Light Start Manual Change', error: 'Reserved', command2: '00' },
          ],
          [
            { command2: '00' },
            { command1: '17', command2: '01' },
            { command: 'Light Start Manual Change', error: 'Reserved', command2: '00' },
          ],
          [
            { command2: '00' },
            { command1: '18', command2: '00' },
            { command: 'Light Stop Manual Change', error: 'Reserved', command2: '00' },
          ],
          [
            { command2: '00' },
            { command1: '19', command2: '00' },
            { command: 'Light Status Request 02', error: 'Reserved', command2: '00' },
          ],
          [
            { command2: '00' },
            { command1: '19', command2: '01' },
            { command: 'Light Status Request 02', error: 'Reserved', command2: '00' },
          ],
          [
            { command2: '00' },
            { command1: '19', command2: '02' },
            { command: 'Light Status Request 02', error: 'Reserved', command2: '00' },
          ],
          [
            { command2: '00' },
            { command1: '19', command2: '03' },
            { command: 'Light Status Request 02', error: 'Reserved', command2: '00' },
          ],
          [
            { command2: '00' },
            { command1: '19', command2: '04' },
            { command: 'Light Status Request 02', error: 'Reserved', command2: '00' },
          ],
          [
            { command2: '00' },
            { command1: '1F', command2: '00', error: 'Reserved' },
            { command: 'Get Operating Flags 2', error: 'Reserved', command2: '00' },
          ],
          [
            { command2: '00' },
            { command1: '1F', command2: '01' },
            { command: 'Get Operating Flags 2', error: 'Reserved', command2: '00' },
          ],
          [
            { command2: '00' },
            { command1: '1F', command2: '02' },
            { command: 'Get Operating Flags 2', error: 'Reserved', command2: '00' },
          ],
          [
            { command2: '00' },
            { command1: '1F', command2: '05' },
            { command: 'Get Operating Flags 2', error: 'Reserved', command2: '00' },
          ],
          [
            { command2: '00' },
            { command1: '20', command2: '00' },
            { command: 'Set Program No I\'m Alive Off', error: 'Reserved', command2: '00' },
          ],
          [
            { command2: '00' },
            { command1: '20', command2: '01' },
            { command: 'Set Program No I\'m Alive Off', error: 'Reserved', command2: '00' },
          ],
          [
            { command2: '00' },
            { command1: '20', command2: '02' },
            { command: 'Set Program No I\'m Alive Off', error: 'Reserved', command2: '00' },
          ],
          [
            { command2: '00' },
            { command1: '20', command2: '03' },
            { command: 'Set Program No I\'m Alive Off', error: 'Reserved', command2: '00' },
          ],
          [
            { command2: '00' },
            { command1: '20', command2: '04' },
            { command: 'Set Program No I\'m Alive Off', error: 'Reserved', command2: '00' },
          ],
          [
            { command2: '00' },
            { command1: '20', command2: '05' },
            { command: 'Set Program No I\'m Alive Off', error: 'Reserved', command2: '00' },
          ],
          [
            { command2: '00' },
            { command1: '20', command2: '06' },
            { command: 'Set Program No I\'m Alive Off', error: 'Reserved', command2: '00' },
          ],
          [
            { command2: '00' },
            { command1: '20', command2: '07' },
            { command: 'Set Program No I\'m Alive Off', error: 'Reserved', command2: '00' },
          ],
          [
            { command2: '00' },
            { command1: '20', command2: '08' },
            { command: 'Set Program No I\'m Alive Off', error: 'Reserved', command2: '00' },
          ],
          [
            { command2: '00' },
            { command1: '20', command2: '09' },
            { command: 'Set Program No I\'m Alive Off', error: 'Reserved', command2: '00' },
          ],
          [
            { command2: '00' },
            { command1: '20', command2: '0A' },
            { command: 'Set Program No I\'m Alive Off', error: 'Reserved', command2: '00' },
          ],
          [
            { command2: '00' },
            { command1: '20', command2: '0B' },
            { command: 'Set Program No I\'m Alive Off', error: 'Reserved', command2: '00' },
          ],
          [
            { command2: '00' },
            { command1: '2E', command2: 'FF' },
            { command: 'Light ON at Ramp Rate', error: 'Not in ALL-Link Group', command2: '00' },
          ],
          // [
          //   { command1: '12', command2: '00' },
          //   { command1: '2F', command2: '00' },
          //   { command: '2F-- Response', error: 'Reserved', command2: '00' },
          // ],
          // [
          //   { command2: '00' },
          //   { command1: '30', command2: '00' },
          //   { command: 'Trigger Group', error: 'Reserved', command2: '00' },
          // ],
          [
            { command2: '00' },
            { command1: '32', command2: '00' },
            { command: 'Outlet ON (bottom)', error: 'Reserved', command2: '00' },
          ],
          [
            { command2: '00' },
            { command1: '32', command2: '01' },
            { command: 'Outlet ON (bottom)', error: 'Reserved', command2: '00' },
          ],
          [
            { command2: '00' },
            { command1: '33', command2: '00' },
            { command: 'Outlet OFF (bottom)', error: 'Reserved', command2: '00' },
          ],
          [
            { command2: '00' },
            { command1: '33', command2: '01' },
            { command: 'Outlet OFF (bottom)', error: 'Reserved', command2: '00' },
          ],
        ]
      )
    })
  })

  describe('extendedData commands', () => {
    describe('with no previousCommand', () => {
      unroll(
        '#response should be parsed as #command',
        testArgs => {
          const response = Object.assign({ extendedMessage: true }, testArgs.response)
          const command = Object.assign({ messageType: 'extendedData' }, testArgs.command)
          const result1 = parseInsteonCommand(response, undefined)
          expect(result1).toEqual(command)
        },
        [
          ['response', 'command'],
          [
            { command1: '03', command2: '00', data: '0000000000000000000000000000' },
            {
              command: 'Product Data Response',
              d8: '00',
              deviceCategory: '00',
              deviceSubcategory: '00',
              firmware: '00',
              productKey: '000000',
              userDefined: '000000000000',
            },
          ],
          [
            { command1: '03', command2: '01', data: '0000000000000000000000000000' },
            {
              command: 'FX Username Response',
              userDefined: '000000000000',
              username: '0000000000000000',
            },
          ],
          [
            { command1: '03', command2: '02', data: '0123456789ABCDEF000000000000' },
            {
              command: 'Device Text String Response',
              textString: '0123456789ABCDEF000000000000',
            },
          ],
          [
            { command1: '03', command2: '03', data: '1234567890ABCDEF1234567890AB' },
            {
              command: 'Set Device Text String',
              textString: '1234567890ABCDEF1234567890AB',
            },
          ],
          [
            { command1: '03', command2: '04', data: '0000000000000000000000000000' },
            {
              command: 'Set ALL-Link Command Alias',
              allLinkCommand: '00',
              directCommand: '0000',
              commandType: 'SD',
            },
          ],
          [
            { command1: '03', command2: '04', data: '0123450100000000000000000000' },
            {
              command: 'Set ALL-Link Command Alias',
              allLinkCommand: '01',
              directCommand: '2345',
              commandType: 'ED',
            },
          ],
          [
            { command1: '03', command2: '05', data: '1234567890ABCDEF1234567890AB' },
            {
              command: 'Set ALL-Link Command Alias Extended Data',
              data: '1234567890ABCDEF1234567890AB',
            },
          ],
          [
            { command1: '09', command2: '00', data: '1234567890ABCDEF1234567890AB' },
            {
              command: 'Enter Linking Mode',
              groupNumber: 18,
              data: '567890ABCDEF1234567890AB',
            },
          ],
          [
            { command1: '2E', command2: '00', data: '1200567890ABCDEF1234567890AB' },
            {
              command: 'Extended Set/Get',
              type: 'Data Request',
              groupNumber: 18,
            },
          ],
          [
            { command1: '2E', command2: '00', data: '120156780F08CDEF1234567890AB' },
            {
              command: 'Extended Set/Get',
              type: 'Data Response',
              groupNumber: 18,
              x10HouseCode: 'J',
              x10UnitCode: 14,
              rampRate: 205,
              onLevel: 239,
              signalToNoiseThreshold: 18,
              ledBrightness: 18,
            },
          ],
          [
            { command1: '2E', command2: '00', data: '120407050F08CDEF1234567890AB' },
            {
              command: 'Extended Set/Get',
              type: 'Set X10 Address',
              groupNumber: 18,
              x10HouseCode: 'I',
              x10UnitCode: 7,
            },
          ],
          [
            { command1: '2E', command2: '00', data: '12051F050F08CDEF1234567890AB' },
            {
              command: 'Extended Set/Get',
              type: 'Set Ramp Rate',
              groupNumber: 18,
              rampRate: 31,
            },
          ],
          [
            { command1: '2E', command2: '00', data: '12067F050F08CDEF1234567890AB' },
            {
              command: 'Extended Set/Get',
              type: 'Set On-Level',
              groupNumber: 18,
              onLevel: 127,
            },
          ],
          [
            { command1: '2E', command2: '00', data: '12071F050F08CDEF1234567890AB' },
            {
              command: 'Extended Set/Get',
              type: 'Command 07',
              groupNumber: 18,
              data: '1F050F08CDEF1234567890AB',
            },
          ],
          [
            { command1: '2F', command2: '00', data: '12001F080F08CDEF1234567890AB' },
            {
              command: 'Read/Write ALL-Link Database',
              type: 'Record Request',
              address: '1F08',
              dumpAllRecords: false,
              numberOfRecords: 15,
            },
          ],
          [
            { command1: '2F', command2: '00', data: '12011F080F08CDEF1234567890AB' },
            {
              command: 'Read/Write ALL-Link Database',
              messageType: 'extendedData',
              type: 'Record Response',
              inUse: false,
              isController: false,
              bit5: false,
              bit4: false,
              bit3: true,
              smartHop: 1,
              bit2: false,
              hasBeenUsed: false,
              bit0: false,
              groupNumber: 205,
              id: 'EF1234',
              address: '1F08',
            },
          ],
          [
            { command1: '2F', command2: '00', data: '12021F081008CDEF1234567890AB' },
            {
              command: 'Read/Write ALL-Link Database',
              type: 'Write ALDB Record',
              numberOfBytes: 16,
              groupNumber: 205,
              address: '1F08',
              messageType: 'extendedData',
              bit0: false,
              bit2: false,
              bit3: true,
              bit4: false,
              bit5: false,
              hasBeenUsed: false,
              id: 'EF1234',
              inUse: false,
              isController: false,
              smartHop: 1,
            },
          ],
          [
            { command1: '2F', command2: '00', data: '12071F080F08CDEF1234567890AB' },
            {
              command: 'Read/Write ALL-Link Database',
              type: 'Record Command 07',
              address: '1F08',
              data: '0F08CDEF1234567890AB',
            },
          ],
        ]
      )
    })
  })
})
