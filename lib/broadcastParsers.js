'use strict';
const { OUTLET_NAMES } = require('./constants'),
  parsers = {},

  toHex = (value = 0, length = 2) => value.toString(16)
        .padStart(length, '0').toUpperCase().substr(0, length),

  addParsers = (command1, parser) => {
    for (let i = 0; i < 256; i++) {
      parsers['11' + toHex(i)] = response => {
        return {
          command: 'Light ON',
          onLevel: i
        };
      };
    }
  };

addParsers('01', response => {
  return {
    command: 'SET Button Pressed Responder',
    data: response.command2
  };
});

addParsers('02', response => {
  return {
    command: 'SET Button Pressed Controller',
    data: response.command2
  };
});

module.exports = parsers;
