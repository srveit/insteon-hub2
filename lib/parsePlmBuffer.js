'use strict'
const { parsers } = require('./parsers')

const parsePlmBuffer = (inputBuffer, previousCommand) => {
  let command
  const startOfText = inputBuffer.indexOf('02')
  const buffer = inputBuffer.substr(startOfText)
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
        bytes: inputBuffer.substr(0, startOfText),
        previousCommand,
      },
    }
  }
  if (buffer.length >= 4) {
    const commandNumber = buffer.substr(2, 2)
    const parser = parsers[commandNumber]
    if (!parser) {
      return {
        buffer: buffer.substr(4),
        command: {
          received: new Date().toISOString(),
          discarded: true,
          reason: `unknown command number: ${commandNumber}`,
          bytes: inputBuffer.substr(0, 4),
        },
      }
    }
    command = parser(buffer.substr(4), previousCommand)
    if (!command) {
      return { buffer: inputBuffer }
    }
    command.bytes = buffer.substr(0, 4 + command.length)
    return {
      buffer: buffer.substr(4 + command.length),
      command,
    }
  }
  return { buffer }
}

exports.parsePlmBuffer = parsePlmBuffer
