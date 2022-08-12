'use strict'

// A transform stream that takes chunks of a PLM buffer and outputs IM commands.
const { Transform } = require('stream')
const { parsePlmBuffer } = require('./parsePlmBuffer')

const defaultLogger = {
  log: () => false,
}

const createPlmCommandStream = (parsingLogger = defaultLogger) => {
  let currentBuffer = ''
  let previousParsedCommand

  const transform = (chunk, encoding, callback) => {
    let buffer, command
    currentBuffer = currentBuffer + chunk.toString('utf8')
    do {
      ({ buffer, command } =
           parsePlmBuffer(currentBuffer, previousParsedCommand))
      if (command) {
        parsingLogger.log({
          event: 'parsedPlmBuffer',
          currentBuffer,
          previousParsedCommand,
          buffer,
          command,
          parsedAt: new Date().toISOString(),
        })
        if (!command.discarded) {
          previousParsedCommand = command
        }
        transformer.push(command)
      }
      currentBuffer = buffer || ''
    } while (command)
    callback(null)
  }

  const flush = callback => {
    if (currentBuffer.length > 0) {
      /* eslint no-use-before-define: "off" */
      transformer.push({
        received: new Date().toISOString(),
        discarded: true,
        reason: 'data before start of text byte',
        bytes: currentBuffer,
        previousParsedCommand,
      })
    }
    callback(null)
  }

  const transformer = new Transform({
    readableObjectMode: true,
    transform,
    flush,
  })

  return transformer
}

exports.createPlmCommandStream = createPlmCommandStream
