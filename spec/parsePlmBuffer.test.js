'use strict'
const unroll = require('unroll')
const parsePlmBuffer = require('../lib/parsePlmBuffer')

unroll.use(it)

describe('parsePlmBuffer', () => {
  let previousParsedCommand

  describe('modem commands', () => {
    unroll(
      '#buffer should be parsed as #command',
      testArgs => {
        const result = parsePlmBuffer(testArgs.buffer, previousParsedCommand)
        expect(result.command).toEqual(testArgs.command)
        expect(result.buffer).toBe('')
      },
      [
        ['buffer', 'command'],
        [
          '025051560E49EA70200000',
          {
            acknowledgement: true,
            allLink: false,
            bytes: '025051560E49EA70200000',
            code: '50',
            command: 'INSTEON Standard Message Received',
            command1: '00',
            command2: '00',
            extendedMessage: false,
            fromAddress: '51560E',
            hopsLeft: 0,
            insteonCommand: undefined,
            length: 18,
            maxHops: 0,
            messageType: 'directAck',
            received: expect.any(String),
            toAddress: '49EA70',
          },
        ],
        [
          '02591FF8E2004B2BA6013944',
          {
            address: '1FF8',
            bit0: false,
            bit2: false,
            bit3: false,
            bit4: false,
            bit5: true,
            bytes: '02591FF8E2004B2BA6013944',
            code: '59',
            command: 'Database Record Found',
            controllerGroupNumber: 68,
            data: '013944',
            deviceCategory: '01',
            deviceSubcategory: '39',
            firmware: '44',
            groupNumber: 0,
            hasBeenUsed: true,
            id: '4B2BA6',
            inUse: true,
            isController: true,
            length: 20,
            numberRetries: 1,
            received: expect.any(String),
            smartHop: 0,
          },
        ],
        [
          '026201020305190006',
          {
            ack: true,
            acknowledgement: false,
            allLink: false,
            bytes: '026201020305190006',
            code: '62',
            command: 'Send INSTEON Standard-length Message',
            command1: '19',
            command2: '00',
            extendedMessage: false,
            fromAddress: 'im-hub',
            hopsLeft: 1,
            insteonCommand: {
              command: 'Light Status Request',
              fromAddress: 'im-hub',
              messageType: 'direct',
              toAddress: '010203'
            },
            length: 14,
            maxHops: 1,
            messageType: 'direct',
            received: expect.any(String),
            toAddress: '010203',
          },
        ],
      ],
    )
  })
})
