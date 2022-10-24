'use strict'
const { parsers } = require('./parsers')

const parsePlmBuffer = (inputBuffer, previousCommand) => {
  let command
  const startOfText = inputBuffer.indexOf('02')
  const buffer = inputBuffer.substring(startOfText)
  if (startOfText < 0) {
    return { buffer: inputBuffer }
  }
  if (startOfText > 0) {
    return {
      buffer,
      command: {
        received: new Date().toISOString(),
        discarded: true,
        reason: 'data before start of text byte',
        bytes: inputBuffer.substring(0, startOfText),
        previousCommand,
      },
    }
  }
  if (buffer.length >= 4) {
    const commandNumber = buffer.substring(2, 4)
    const parser = parsers[commandNumber]
    if (!parser) {
      return {
        buffer: buffer.substring(4),
        command: {
          received: new Date().toISOString(),
          discarded: true,
          reason: `unknown command number: ${commandNumber}`,
          bytes: inputBuffer.substring(0, 4),
        },
      }
    }
    command = parser(buffer.substring(4), previousCommand)
    if (!command) {
      return { buffer: inputBuffer }
    }
    command.bytes = buffer.substring(0, 4 + command.length)
    return {
      buffer: buffer.substring(4 + command.length),
      command,
    }
  }
  return { buffer }
}

exports.parsePlmBuffer = parsePlmBuffer
