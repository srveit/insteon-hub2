'use strict';
const parsers = require('./parsers');

const createPlmBufferParser = (deviceNames = {}) => {

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
  };

  const parsePlmBuffer = (buffer, previousCommand) => {
    console.log('buffer', buffer);
    const startOfText = buffer.indexOf('02');
    if (startOfText < 0) {
      return { buffer };
    }
    if (startOfText > 0) {
      const discarded = buffer.substr(0, startOfText);
      console.warn(`discarded ${discarded}`);
      buffer = buffer.substr(startOfText);
    }
    if (buffer.length < 4) {
      return { buffer };
    }
    const commandNumber = buffer.substr(2, 2);
    const parser = parsers[commandNumber];
    if (!parser) {
      console.warn(`unable to parse command ${commandNumber}`);
      return { buffer: buffer.substr(4) };
    }
    const command = parser(buffer.substr(4), previousCommand);
    if (command) {
      addDeviceName(command);
      command.bytes = buffer.substr(0, 4 + command.length);
      return {
        buffer: buffer.substr(4 + command.length),
        command
      };
    }
    return { buffer };
  };

  let currentBuffer = '';
  let previousCommand;
  const parsePlmBufferSegment = segment => {
    const commands = [];
    let command;
    currentBuffer += segment;
    do {
      let buffer;
      ({ buffer, command } = parsePlmBuffer(currentBuffer, previousCommand));
      currentBuffer = buffer;
      if (command) {
        previousCommand = command;
        commands.push(command);
      }
    } while (command);
    return commands;
  };

  let previousBuffer = '';

  const processPlmBuffer = newBuffer => {
    const match = newBuffer.match(/<BS>([0-9A-F]+)</);

    if (!match || match[1] === previousBuffer) {
      return [];
    }
    newBuffer = match[1];
    const bufferLength = previousBuffer.length > 2 ? parseInt(previousBuffer.slice(-2), 16) : 0;
    const newBufferLength = parseInt(newBuffer.slice(-2), 16);
    let segment;
    if (newBufferLength >= bufferLength) {
      if (previousBuffer.slice(0, bufferLength) === newBuffer.slice(0, bufferLength)) {
        // Case 1
        //   old aaaaaa000000
        //   new aaaaaabbb000
        //   Added to existing buffer but not rolled over
        segment = newBuffer.slice(bufferLength, newBufferLength);
      } else {
        // Case 3
        //   old aaaaaa000000
        //   new bbbbbbbb0000
        //   Totally new buffer
        segment = newBuffer.slice(0, newBufferLength);
      }
    } else if (previousBuffer.slice(newBufferLength, bufferLength) ===
               newBuffer.slice(newBufferLength, bufferLength)) {
      // Case 2
      //   old aaaaaa000000
      //   new bbbaaabbbbbb
      //   Added to existing buffer and rolled over
      segment = newBuffer.slice(bufferLength, -2) +
        newBuffer.slice(0, newBufferLength);
    } else {
      // Case 3
      //   old aaaaaa000000
      //   new bbb000000000
      //   Totally new buffer
      segment = newBuffer.slice(0, newBufferLength);
    }
    previousBuffer = newBuffer;
    return parsePlmBufferSegment(segment);
  };

  const reset = () => previousBuffer = '';

  return Object.freeze({
    processPlmBuffer,
    reset
  });
};
exports.createPlmBufferParser = createPlmBufferParser;
