'use strict';
const commandNames = {},
  parsers = {};

const addParser = (code, commandName) => {
  commandNames[code] = commandName;
  parsers[code] = response => {
    const command = {
      command: commandName,
      fromAddress: response.fromAddress,
      groupNumber: response.groupNumber || parseInt(response.command2, 16),
      command1: response.allLinkCommand || response.command1
    };
    if (response.toAddress) {
      command.toAddress = response.toAddress;
    }
    if (response.cleanUpCommand1 && response.cleanUpCommand1 != '00') {
      command.cleanUpCommand = commandNames[response.cleanUpCommand1] ||
        `cleanUpCommand ${response.cleanUpCommand1}`;
    }
    if (response.numberDevices != undefined) {
      command.numberDevices = response.numberDevices;
    }
    return command;
  };
};

addParser('06', 'ALL-Link Cleanup Status Report');
addParser('11', 'ALL-Link Recall');

module.exports = parsers;
