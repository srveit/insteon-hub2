'use strict';

// A transform stream that takes chunks of a PLM buffer and outputs IM commands.
const moment = require('moment'),
  { Transform } = require('stream'),
  parsers = require('./parsers'),

  defaultLogger = {
    log: () => false
  },

  createPlmCommandStream = (parsingLogger = defaultLogger) => {
    let currentBuffer = '',
      previousBuffer = '',
      previousParsedCommand;
    
    const parsePlmBuffer = (inputBuffer, previousCommand) => {
        let discarded, command;
        const startOfText = inputBuffer.indexOf('02'),
          buffer = inputBuffer.substr(startOfText);
        if (startOfText < 0) {
          return {inputBuffer};
        }
        if (startOfText > 0) {
          return {
            buffer,
            command: {
              received: moment().toISOString(),
              discarded: true,
              reason: 'data before start of text byte',
              bytes: inputBuffer.substr(0, startOfText),
              previousParsedCommand
            }
          };
        }
        if (buffer.length >= 4) {
          const commandNumber = buffer.substr(2, 2),
            parser = parsers[commandNumber];
          if (!parser) {
            return {
              buffer: buffer.substr(4),
              command: {
                received: moment().toISOString(),
                discarded: true,
                reason: `unknown command number: ${commandNumber}`,
                bytes: inputBuffer.substr(0, 4)
              }
            };
          }
          command = parser(buffer.substr(4), previousCommand);
          if (!command) {
            return {
              buffer: buffer.substr(4),
              command: {
                received: moment().toISOString(),
                discarded: true,
                reason: 'command truncated',
                bytes: inputBuffer.substr(0, 4)
              }
            };
          }
          command.bytes = buffer.substr(0, 4 + command.length);
          return {
            buffer: buffer.substr(4 + command.length),
            command
          };
        }
        return {buffer};
      },

      transform = (chunk, encoding, callback) => {
        let buffer, command;
        currentBuffer = currentBuffer + chunk.toString('utf8');
        do {
          ({buffer, command} =
           parsePlmBuffer(currentBuffer, previousParsedCommand));
          if (command) {
            parsingLogger.log({
              event: 'parsedPlmBuffer',
              currentBuffer,
              previousParsedCommand,
              buffer,
              command,
              parsedAt: moment()
            });
            if (!command.discarded) {
              previousParsedCommand = command;
            }
            transformer.push(command);
          }
          currentBuffer = buffer || '';
        } while (command);
        callback(null);
      };

    const flush = callback => {
      if (currentBuffer.length > 0) {
        transformer.push({
          received: moment().toISOString(),
          discarded: true,
          reason: 'data before start of text byte',
          bytes: currentBuffer,
          previousParsedCommand
        });
      }
      callback(null);
    };

    const transformer = new Transform({
      readableObjectMode: true,
      transform,
      flush
    });
    return transformer;
  };

exports.createPlmCommandStream = createPlmCommandStream;