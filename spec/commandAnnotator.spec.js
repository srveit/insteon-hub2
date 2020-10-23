'use strict';

const util = require('util');
const { createCommandAnnotator } = require('../lib/commandAnnotator.js');

const iso8601Regex =
  new RegExp('^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}Z');

const waitForReadable = stream => new Promise(resolve => {
  if (stream.readable) {
    resolve();
  } else {
    stream.once('readable', resolve);
  }
});

describe('createCommandAnnotator', () => {
  let commandAnnotator, write, read;

  const deviceNames = {
    'im-hub': 'im-hub',
    '070809': 'hub controller',
    '010203': 'device1',
    '040506': 'device2'
  };
  beforeEach(() => {
    commandAnnotator = createCommandAnnotator(deviceNames);
  });

  it('should have a write method', () => {
    expect(commandAnnotator.write).toEqual(expect.any(Function));
  });

  describe('when writing a command with a fromAddress and toAddress', () => {
    const baseCommand = {
      received: '2020-07-29T23:18:29.956Z',
      command: 'Send INSTEON Standard-length Message',
      code: '62',
      length: 14,
      messageType: 'direct',
      allLink: false,
      acknowledgement: false,
      extendedMessage: false,
      hopsLeft: 1,
      maxHops: 1,
      fromAddress: 'im-hub',
      toAddress: '010203',
      command1: '19',
      command2: '00',
      ack: true,
      insteonCommand: {
        command: 'Light Status Request',
        messageType: 'direct',
        fromAddress: 'im-hub',
        toAddress: '010203'
      },
      bytes: '026201020305190006'
    };

    beforeEach(() => {
      commandAnnotator.write(baseCommand);
    });

    describe('then reading a command', () => {
      let command;
      beforeEach(async () => {
        await waitForReadable(commandAnnotator);
        command = commandAnnotator.read();
      });

      it('should return a parsed command', () => {
        expect(command).toEqual({
          received: '2020-07-29T23:18:29.956Z',
          command: 'Send INSTEON Standard-length Message',
          code: '62',
          length: 14,
          messageType: 'direct',
          allLink: false,
          acknowledgement: false,
          extendedMessage: false,
          hopsLeft: 1,
          maxHops: 1,
          fromAddress: 'im-hub',
          toAddress: '010203',
          command1: '19',
          command2: '00',
          ack: true,
          insteonCommand: {
            command: 'Light Status Request',
            messageType: 'direct',
            fromAddress: 'im-hub',
            toAddress: '010203',
            fromDevice: 'im-hub',
            toDevice: 'device1'
          },
          fromDevice: 'im-hub',
          toDevice: 'device1',
          bytes: '026201020305190006'
        });
      });

      describe('then reading a second time', () => {
        let secondCommand;
        beforeEach(async () => {
          await waitForReadable(commandAnnotator);
          secondCommand = commandAnnotator.read();
        });

        it('should return null', () => {
          expect(secondCommand).toBe(null);
        });
      });
    });
  });

  describe('when writing a command with an id', () => {
    const baseCommand = {
      received: '2020-07-29T23:18:29.956Z',
      command: 'ALL-Link Record Response',
      code: '57',
      length: 16,
      inUse: true,
      isController: true,
      hasBeenUsed: true,
      bit2: false,
      bit3: true,
      bit4: false,
      bit5: true,
      groupNumber: 0,
      id: '010203',
      deviceCategory: '01',
      deviceSubcategory: '39',
      firmware: '44',
      numberRetries: 1,
      controllerGroupNumber: 68,
      data: '013944',
      bytes: '0257EA00010203013944'
    };

    beforeEach(() => {
      commandAnnotator.write(baseCommand);
    });

    describe('then reading a command', () => {
      let command;
      beforeEach(async () => {
        await waitForReadable(commandAnnotator);
        command = commandAnnotator.read();
      });

      it('should return a parsed command', () => {
        expect(command).toEqual({
          received: '2020-07-29T23:18:29.956Z',
          command: 'ALL-Link Record Response',
          code: '57',
          length: 16,
          inUse: true,
          isController: true,
          hasBeenUsed: true,
          bit2: false,
          bit3: true,
          bit4: false,
          bit5: true,
          groupNumber: 0,
          id: '010203',
          device: 'device1',
          deviceCategory: '01',
          deviceSubcategory: '39',
          firmware: '44',
          numberRetries: 1,
          controllerGroupNumber: 68,
          data: '013944',
          bytes: '0257EA00010203013944'
        });
      });

      describe('then reading a second time', () => {
        let secondCommand;
        beforeEach(async () => {
          await waitForReadable(commandAnnotator);
          secondCommand = commandAnnotator.read();
        });

        it('should return null', () => {
          expect(secondCommand).toBe(null);
        });
      });
    });
  });

  describe('when writing a command with only fromAddress', () => {
    const baseCommand = {
      received: '2020-07-29T23:18:29.956Z',
      command: 'Send INSTEON Standard-length Message',
      code: '62',
      length: 14,
      messageType: 'direct',
      allLink: false,
      acknowledgement: false,
      extendedMessage: false,
      hopsLeft: 1,
      maxHops: 1,
      fromAddress: 'im-hub',
      toAddress: '010203',
      command1: '19',
      command2: '00',
      ack: true,
      insteonCommand: {
        command: 'Light Status Request',
        messageType: 'direct',
        fromAddress: 'im-hub',
        toAddress: '010203'
      },
      bytes: '026201020305190006'
    };

    beforeEach(() => {
      commandAnnotator.write(baseCommand);
    });

    describe('then reading a command', () => {
      let command;
      beforeEach(async () => {
        await waitForReadable(commandAnnotator);
        command = commandAnnotator.read();
      });

      it('should return a parsed command', () => {
        expect(command).toEqual({
          received: '2020-07-29T23:18:29.956Z',
          command: 'Send INSTEON Standard-length Message',
          code: '62',
          length: 14,
          messageType: 'direct',
          allLink: false,
          acknowledgement: false,
          extendedMessage: false,
          hopsLeft: 1,
          maxHops: 1,
          fromAddress: 'im-hub',
          toAddress: '010203',
          command1: '19',
          command2: '00',
          ack: true,
          insteonCommand: {
            command: 'Light Status Request',
            messageType: 'direct',
            fromAddress: 'im-hub',
            toAddress: '010203',
            fromDevice: 'im-hub',
            toDevice: 'device1'
          },
          fromDevice: 'im-hub',
          toDevice: 'device1',
          bytes: '026201020305190006'
        });
      });
    });
  });

  describe('when writing a command with command id', () => {
    const baseCommand = {
      received: '2020-07-29T23:18:29.956Z',
      command: 'Get IM Info',
      code: '60',
      length: 14,
      imId: '070809',
      deviceCategory: '03',
      deviceSubcategory: '33',
      firmware: 'A5',
      ack: true,
      bytes: '02600708090333A506'
    };

    beforeEach(() => {
      commandAnnotator.write(baseCommand);
    });

    describe('then reading a command', () => {
      let command;
      beforeEach(async () => {
        await waitForReadable(commandAnnotator);
        command = commandAnnotator.read();
      });

      it('should return a parsed command with imDevice', () => {
        expect(command).toEqual({
          received: '2020-07-29T23:18:29.956Z',
          command: 'Get IM Info',
          code: '60',
          length: 14,
          imId: '070809',
          imDevice: 'hub controller',
          deviceCategory: '03',
          deviceSubcategory: '33',
          firmware: 'A5',
          ack: true,
          bytes: '02600708090333A506'
        });
      });
    });
  });

  describe('when writing a command with device id', () => {
    const baseCommand = {
      received: '2020-07-29T23:18:29.956Z',
      command: 'ALL-Link Cleanup Failure Report',
      code: '56',
      length: 16,
      state: '01',
      groupNumber: 2,
      deviceId: '010203',
      ack: true,
      bytes: '0256010201020306'
    };

    beforeEach(() => {
      commandAnnotator.write(baseCommand);
    });

    describe('then reading a command', () => {
      let command;
      beforeEach(async () => {
        await waitForReadable(commandAnnotator);
        command = commandAnnotator.read();
      });

      it('should return a parsed command with deviceName', () => {
        expect(command).toEqual({
          received: '2020-07-29T23:18:29.956Z',
          command: 'ALL-Link Cleanup Failure Report',
          code: '56',
          length: 16,
          state: '01',
          groupNumber: 2,
          deviceId: '010203',
          deviceName: 'device1',
          ack: true,
          bytes: '0256010201020306'
        });
      });
    });
  });
});
