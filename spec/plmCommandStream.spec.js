'use strict';

const util = require('util');
const { createPlmCommandStream } = require('../lib/plmCommandStream.js');

const iso8601Regex =
  new RegExp('^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}Z');

const waitForReadable = stream => new Promise(resolve => {
  if (stream.readable) {
    resolve();
  } else {
    stream.once('readable', resolve);
  }
});

describe('createPlmCommandStream', () => {
  let plmCommandStream, write, read;
  beforeEach(() => {
    plmCommandStream = createPlmCommandStream({
      deviceNames: {
        'im-hub': 'im-hub',
        '010203': 'device1',
        '040506': 'device2'
      }
    });
  });

  it('should have a write method', () => {
    expect(plmCommandStream.write).toEqual(expect.any(Function));
  });

  describe('when writing a buffer with a single command', () => {
    const buffer = '026201020305190006';

    beforeEach(() => {
      plmCommandStream.write(buffer);
    });

    describe('then reading a command', () => {
      let command;
      beforeEach(async () => {
        await waitForReadable(plmCommandStream);
        command = plmCommandStream.read();
      });

      it('should return a parsed command', () => {
        expect(command).toEqual({
          received: expect.stringMatching(iso8601Regex),
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
          await waitForReadable(plmCommandStream);
          secondCommand = plmCommandStream.read();
        });

        it('should return null', () => {
          expect(secondCommand).toBe(null);
        });
      });
    });
  });

  describe('when writing a buffer with a two commands', () => {
    const buffer = '02620102030519000602500102030405062000FF';

    beforeEach(() => {
      plmCommandStream.write(buffer);
    });

    describe('then reading a command', () => {
      let command;
      beforeEach(async () => {
        await waitForReadable(plmCommandStream);
        command = plmCommandStream.read();
      });

      it('should return a parsed command', () => {
        expect(command).toEqual({
          received: expect.stringMatching(iso8601Regex),
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
          await waitForReadable(plmCommandStream);
          secondCommand = plmCommandStream.read();
        });

        it('should return null', () => {
          expect(secondCommand).toEqual({
            received: expect.stringMatching(iso8601Regex),
            command: 'INSTEON Standard Message Received',
            code: '50',
            length: 18,
            fromAddress: '010203',
            toAddress: '040506',
            messageType: 'directAck',
            allLink: false,
            acknowledgement: true,
            extendedMessage: false,
            hopsLeft: 0,
            maxHops: 0,
            command1: '00',
            command2: 'FF',
            insteonCommand: {
              command: 'Light Status Response',
              onLevel: 255,
              allLinkDatabaseDelta: 0,
              messageType: 'directAck',
              fromAddress: '010203',
              toAddress: '040506',
              fromDevice: 'device1',
              toDevice: 'device2'
            },
            fromDevice: 'device1',
            toDevice: 'device2',
            bytes: '02500102030405062000FF'
          });
        });
      });
    });
  });
});
