'use strict'
const { idText, isExportDeclaration } = require('typescript')
const parsePlmBuffer = require('../lib/parsePlmBuffer')

describe('parsePlmBuffer', () => {
  let result, previousParsedCommand

  beforeEach(() => {
    const currentBuffer = '026201020305190006'

    result = parsePlmBuffer(currentBuffer, previousParsedCommand)
  })
  it('should parse', () => {
    const expected = {
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
    }

    expect(result.buffer).toBe('')
    expect(result.command).toEqual(expected)

  })
})
