'use strict';
const util = require('util'),
  request = require('request-promise'),
  { createPlmBufferParser } = require('./plmBufferParser'),
  { createAllLinkDatabase } = require('./allLinkDatabase'),
  encodeCommand = require('./encodeCommand');

const createPlm = ({ username, password, host, port, deviceNames }) => {
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

  const authHeader = () => {
    const data = new Buffer(`${username}:${password}`),
      base64Data = data.toString('base64');
    return `Basic ${base64Data}`;
  };

  const sendImRequest = async (command = '') => {
    const url = `http://${host}:${port}/${command}`;
    // if (command !== 'buffstatus.xml') {
    //   console.log('send', command);
    // }
    return request({
      headers: {
        Authorization: authHeader()
      },
      url: url
    });
  };

  const clearBuffer = async () => sendImRequest('1?XB=M=1');
  const getLinkStatus = async () => sendImRequest('Linkstatus.xml');

  const sendAllLinkCommand = async (command, groupNumber = '') => {
    return await sendImRequest(`0?${command}${groupNumber}=I=0`);
  };

  const parseHubInfo = response => {
    return response.split('\n').reduce(
      (hubInfo, line) => {
        let m;
        if ((m = line.match(/((Hub[0-9])-V[-0-9]+)/))) {
          hubInfo.binVersion = m[1];
          hubInfo.type = m[2];
        } else if ((m = line.match(/Firmware:([0-9]+)  Build ([ :a-zA-Z0-9]+)/))) {
          hubInfo.hubVersion = m[1];
          hubInfo.firmwareBuildDate = m[2];
        } else if ((m = line.match(/PLM Version:([ :a-zA-Z0-9]+)/))) {
          hubInfo.plmVersion = m[1];
        } else if ((m = line.match(/Insteon ID:([. :a-zA-Z0-9]+)/))) {
          hubInfo.deviceId = m[1].replace(/[.]/g, '');
        }
        return hubInfo;
      },
      {}
    );
  };

  const getHubInfo = async () => {
    const response = await sendImRequest();
    return parseHubInfo(response);
  };

  const createCommandHandler = (matches, processCommand) => command => {
    if (matches(command)) {
      return {
        consumed: true,
        finished: processCommand(command)
      };
    }
    return {
      consumed: false
    };
  };

  const commandHandlers = [];

  const addCommandHandler = (matches, processCommand) => {
    const commandHandler = createCommandHandler(matches, processCommand);
    commandHandlers.unshift(commandHandler);
  };

  const removeCommandHandler = commandHandler => {
    const index = commandHandlers.indexOf(commandHandler);
    if (index >= 0) {
      commandHandlers.splice(index, 1);
    }
  };

  const handleCommand = command => {
    const handled = commandHandlers.find(commandHandler => {
      const { consumed, finished } = commandHandler(command);
      if (finished) {
        removeCommandHandler(commandHandler);
      }
      return consumed;
    });
    if (!handled) {
      if (command.command !== 'X10 Received') {
        console.log('q', command);
      }
    }
  };

  const sendModemCommand = async (command) => {
    let response, acknowledgement, reply;
    const buffer = encodeCommand(command),
      commandCode = buffer.substr(2, 2);
    return new Promise(async (resolve, reject) => {
      let matcher, processor, edTerminator, commands = [];
      addCommandHandler(
        command => matcher(command),
        command => processor(command)
      );
      
      const ackMatcher = command => command.code === commandCode,
        directAckMatcher = command => command.code === '50',
        edMatcher = command => command.code === '51';

       const edProcessor = command => {
        if (edTerminator) {
          commands.push(command);
          if (edTerminator(command)) {
            resolve(commands);
            return true;
          }
          return false;
        }
        resolve(command);
        return true;
      };
      const directAckProcessor = command => {
        if (command.messageType === 'directAck' &&
            command.insteonCommand.edExpected) {
          matcher = edMatcher;
          processor = edProcessor;
          edTerminator = command.insteonCommand.edTerminator;
          return false;
        }
        resolve(command);
        return true;
      };
      const ackProcessor = command => {
        if (!command.ack) {
          resolve(undefined);
          return true;
        }
        if (command.messageType === 'direct' ||
            command.messageType === 'allLinkCleanup') {
          matcher = directAckMatcher;
          processor = directAckProcessor;
          return false;
        } else if (command.responseMatcher) {
          matcher = command.responseMatcher;
          processor = edProcessor;
          return false;
        }
        resolve(command);
        return true;
      };
      matcher = ackMatcher;
      processor = ackProcessor;

      await sendImRequest(`3?${buffer}=I=3`);
    });
  };

  const monitorHubStatus = async () => {
    const plmBufferParser = createPlmBufferParser(deviceNames);

    while (true) {
      let newBuffer = await sendImRequest('buffstatus.xml');
      try {
        plmBufferParser.processPlmBuffer(newBuffer).map(handleCommand);
      } catch (error) {
        console.warn(error);
      }
      await sleep(50);
    }
  };

  const start = async () => {
    await clearBuffer();
    monitorHubStatus();
  };


  const readHubAllLinkDatabase = async deviceNames => {
    const hubDatabase = createAllLinkDatabase(deviceNames);
    const hubInfo = await getHubInfo();
    const imInfo = await sendModemCommand({
      command: 'Get IM Info'
    });
    hubDatabase.addDeviceInfo({
      deviceId: imInfo.imId,
      deviceCategory: imInfo.deviceCategory,
      deviceSubcategory: imInfo.deviceSubcategory,
      firmware: imInfo.firmware,
      binVersion: hubInfo.binVersion,
      hubVersion: hubInfo.hubVersion,
      firmwareBuildDate: hubInfo.firmwareBuildDate
    });
    let rec = await sendModemCommand({
      command: 'Get First ALL-Link Record'
    });
    while (rec) {
      hubDatabase.addAllLinkRecord(rec);
      rec = await sendModemCommand({
        command: 'Get Next ALL-Link Record'
      });
    }
    return hubDatabase;
  };

  const readDeviceAllLinkDatabase = async (deviceId, deviceNames) => {
    const database = createAllLinkDatabase(deviceNames),
      productData = await sendModemCommand({
        command: 'Product Data Request',
        toAddress: deviceId
      });

    database.addDeviceInfo({
      deviceId: deviceId,
      deviceCategory: productData.deviceCategory,
      deviceSubcategory: productData.deviceSubcategory,
      firmware: productData.firmware
    });
    const records = await sendModemCommand({
      command: 'Read ALL-Link Database',
      toAddress: deviceId
    });
    records.forEach(record => database.addAllLinkRecord(record.insteonCommand));
    return database;
  };

  return Object.freeze({
    start,
    sendModemCommand,
    readHubAllLinkDatabase,
    readDeviceAllLinkDatabase
  });
};

exports.createPlm = createPlm;
