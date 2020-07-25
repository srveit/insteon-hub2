'use strict';

// A transform stream that takes chunks of a PLM buffer and outputs IM commands.
const moment = require('moment'),
  stream = require('stream'),
  { Transform } = stream,
  parsers = require('./parsers'),

  defaultLogger = {
    log: () => false
  },

  createPlmCommandStream = ({deviceNames = {}, parsingLogger = defaultLogger} = {}) => {
    let currentBuffer = '',
      previousBuffer = '',
      previousParsedCommand,
      transformer;
    
    const addDeviceName = command => {
      if (command.fromAddress) {
        command.fromDevice = deviceNames[command.fromAddress];
      }
      if (command.fromAddress) {
        command.fromDevice = deviceNames[command.fromAddress];
      }
      if (command.toAddress) {
        command.toDevice = deviceNames[command.toAddress];
      }
      if (command.id) {
        command.deviceName = deviceNames[command.deviceId];
      }
      if (command.imId) {
        command.imDevice = deviceNames[command.imId];
      }
      if (command.insteonCommand) {
        addDeviceName(command.insteonCommand);
      }
    },

      parsePlmBuffer = (inputBuffer, previousCommand) => {
        let discarded, command;
        const startOfText = inputBuffer.indexOf('02'),
          buffer = inputBuffer.substr(startOfText);
        if (startOfText < 0) {
          return {inputBuffer};
        }
        if (startOfText > 0) {
          discarded = inputBuffer.substr(0, startOfText);
        }
        if (buffer.length >= 4) {
          const commandNumber = buffer.substr(2, 2),
            parser = parsers[commandNumber];
          if (!parser) {
            return {
              buffer: buffer.substr(4),
              discarded,
              warning: `unable to parse command ${commandNumber}`
            };
          }
          command = parser(buffer.substr(4), previousCommand);
          if (command) {
            addDeviceName(command);
            command.bytes = buffer.substr(0, 4 + command.length);
            return {
              buffer: buffer.substr(4 + command.length),
              command,
              discarded
            };
          }
          return {buffer, discarded};
        }
        return {buffer, discarded};
      },

      transform = (chunk, encoding, callback) => {
        let command;
        currentBuffer = currentBuffer + chunk.toString('utf8');
        do {
          let buffer, discarded, warning;
          ({buffer, command, discarded, warning} =
           parsePlmBuffer(currentBuffer, previousParsedCommand));
          if (discarded || command || warning) {
            parsingLogger.log({
              event: 'parsedPlmBuffer',
              currentBuffer,
              previousParsedCommand,
              buffer,
              command,
              discarded,
              warning,
              parsedAt: moment()
            });
          }
          currentBuffer = buffer || '';
          if (discarded) {
            /* eslint no-console: "off" */
            console.warn(`discarded ${discarded}`, previousParsedCommand);
            // TODO: implement
            // transformer.push(discarded);
          }
          if (command) {
            previousParsedCommand = command;
            transformer.push(command);
          }
          if (warning) {
            console.warn(warning);
          }
        } while (command);
        callback(null);
      };

    const flush = callback => {
      // TODO: implement
      // transformer.push(currentBuffer);

      callback(null);
    };


    transformer = new Transform({
      readableObjectMode: true,
      transform,
      flush
    });
    return transformer;
  };

exports.createPlmCommandStream = createPlmCommandStream;
