'use strict';
const parsers = {};

parsers['11'] = response => {
  return {
    command: 'ALL-Link Recall',
    groupNumber: response.groupNumber,
    command1: response.allLinkCommand,
    command2: response.broadcastCommand2
  };
};

module.exports = parsers;
