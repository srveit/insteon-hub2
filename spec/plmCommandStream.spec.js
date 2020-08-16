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
    plmCommandStream = createPlmCommandStream();
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
            toAddress: '010203'
          },
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

  describe('when writing a buffer in two parts with a single command', () => {
    const buffer1 = '02',
      buffer2 = '6201020305190006';

    beforeEach(() => {
      plmCommandStream.write(buffer1);
      plmCommandStream.write(buffer2);
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
            toAddress: '010203'
          },
          bytes: '026201020305190006'
        });
      });
    });
  });

  describe('when writing a buffer with an unknown command', () => {
    const buffer = '027E0102030519000602';

    beforeEach(() => {
      plmCommandStream.write(buffer);
    });

    describe('then reading a command', () => {
      let command;
      beforeEach(async () => {
        await waitForReadable(plmCommandStream);
        command = plmCommandStream.read();
      });

      it('should return an unknown command', () => {
        expect(command).toEqual({
          received: expect.stringMatching(iso8601Regex),
          discarded: true,
          reason: 'unknown command number: 7E',
          bytes: '027E'
        });
      });

      describe('then reading a second time', () => {
        let secondCommand;
        beforeEach(async () => {
          await waitForReadable(plmCommandStream);
          secondCommand = plmCommandStream.read();
        });

        it('should return a discarded command', () => {
          expect(secondCommand).toEqual({
            received: expect.stringMatching(iso8601Regex),
            discarded: true,
            reason: 'data before start of text byte',
            bytes: '01'
          });
        });

        describe('then reading a third time', () => {
          let thirdCommand;
          beforeEach(async () => {
            await waitForReadable(plmCommandStream);
            thirdCommand = plmCommandStream.read();
          });

          it('should return an unknown command', () => {
            expect(thirdCommand).toEqual({
              received: expect.stringMatching(iso8601Regex),
              discarded: true,
              reason: 'unknown command number: 03',
              bytes: '0203'
            });
          });

          describe('then reading a fourth time', () => {
            let fourthCommand;
            beforeEach(async () => {
              await waitForReadable(plmCommandStream);
              fourthCommand = plmCommandStream.read();
            });

            it('should return a discarded command', () => {
              expect(fourthCommand).toEqual({
                received: expect.stringMatching(iso8601Regex),
                discarded: true,
                reason: 'data before start of text byte',
                bytes: '05190006'
              });
            });

            describe('then reading a fifth time', () => {
              let fifthCommand;
              beforeEach(async () => {
                await waitForReadable(plmCommandStream);
                fifthCommand = plmCommandStream.read();
              });

              it('should return a null command', () => {
                expect(fifthCommand).toBe(null);
              });

              describe('then ending the stream', () => {
                let sixthCommand;
                beforeEach(async () => {
                  plmCommandStream.end();
                  await waitForReadable(plmCommandStream);
                  sixthCommand = plmCommandStream.read();
                });

                it('should return a discarded command', () => {
                  expect(sixthCommand).toEqual({
                    received: expect.stringMatching(iso8601Regex),
                    discarded: true,
                    reason: 'data before start of text byte',
                    bytes: '02'
                  });
                });
              });
            });
          });
        });
      });
    });
  });

  describe('when writing a buffer with an known command parser that doesn\'t known the second command byte', () => {
    const buffer = '025004050649EA703000';

    beforeEach(() => {
      plmCommandStream.write(buffer);
    });

    describe('then reading a command', () => {
      let command;
      beforeEach(async () => {
        await waitForReadable(plmCommandStream);
        command = plmCommandStream.read();
      });

      it('should return a truncated command', () => {
        expect(command).toEqual({
          received: expect.stringMatching(iso8601Regex),
          discarded: true,
          reason: 'command truncated',
          bytes: '0250'
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
            toAddress: '010203'
          },
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
              toAddress: '040506'
            },
            bytes: '02500102030405062000FF'
          });
        });

        describe('then ending the stream', () => {
          let thirdCommand;
          beforeEach(async () => {
            plmCommandStream.end();
            await waitForReadable(plmCommandStream);
            thirdCommand = plmCommandStream.read();
          });

          it('should return a null command', () => {
            expect(thirdCommand).toBe(null);
          });
        });
      });
    });
  });

  describe('when writing a buffer with a noise in front of command', () => {
    const buffer = 'ABCDEF02500102030405062000FF';

    beforeEach(() => {
      plmCommandStream.write(buffer);
    });

    describe('then reading a command', () => {
      let command;
      beforeEach(async () => {
        await waitForReadable(plmCommandStream);
        command = plmCommandStream.read();
      });

      it('should return a "discarded" command', () => {
        expect(command).toEqual({
          received: expect.stringMatching(iso8601Regex),
          discarded: true,
          reason: 'data before start of text byte',
          bytes: 'ABCDEF'
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
            bytes: '02500102030405062000FF'
          });
        });
      });
    });
  });
});
