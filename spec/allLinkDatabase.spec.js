'use strict';

const util = require('util');
const { createAllLinkDatabase } = require('../lib/allLinkDatabase.js');

const iso8601Regex =
  new RegExp('^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}Z');

const waitForReadable = stream => new Promise(resolve => {
  if (stream.readable) {
    resolve();
  } else {
    stream.once('readable', resolve);
  }
});

describe('createAllLinkDatabase', () => {
  let allLinkDatabase;
  beforeEach(() => {
    allLinkDatabase = createAllLinkDatabase();
  });

  describe('allLinkDatabase.addAllLinkRecord', () => {
    describe('when not in use', () => {
      const allLinkRecord = {
        command: 'ALL-Link Record Response',
        code: '57',
        inUse: false,
        isController: true,
        hasBeenUsed: true,
        bit2: false,
        bit3: false,
        bit4: false,
        bit5: true,
        deviceCategory: '01',
        deviceSubcategory: '39',
        firmware: '44',
        numberRetries: 1,
        controllerGroupNumber: 68,
        data: '013944',

        groupNumber: 17,
        id: '551234',
        length: 16,
        received: expect.any(String)
      };

      beforeEach(() => {
        allLinkDatabase.addAllLinkRecord(allLinkRecord);
      });

      it('should not add any links', () => {
        expect(allLinkDatabase.links()).toEqual({
        });
      });
    });

    describe('when controller', () => {
      const allLinkRecord = {
        command: 'ALL-Link Record Response',
        code: '57',
        inUse: true,
        isController: true,
        hasBeenUsed: true,
        bit2: false,
        bit3: false,
        bit4: false,
        bit5: true,
        deviceCategory: '01',
        deviceSubcategory: '39',
        firmware: '44',
        numberRetries: 1,
        controllerGroupNumber: 68,
        data: '013944',

        groupNumber: 17,
        id: '551234',
        length: 16,
        received: expect.any(String)
      };

      beforeEach(() => {
        allLinkDatabase.addAllLinkRecord(allLinkRecord);
      });

      it('should add a link', () => {
        expect(allLinkDatabase.links()).toEqual({
          551234: {
            id: '551234',
            deviceCategory: '01',
            deviceSubcategory: '39',
            firmware: '44',
            controllerGroups: {
              17: {
                bit5: true,
                groupNumber: 17
              }
            },
            responderGroups: {}
          }
        });
      });

      describe('and adding responder', () => {
        const allLinkRecord = {
          command: 'ALL-Link Record Response',
          code: '57',
          inUse: true,
          isController: false,
          hasBeenUsed: true,
          bit2: false,
          bit3: false,
          bit4: false,
          bit5: true,
          onLevel: 1,
          rampRate: 57,
          responderGroupNumber: 68,
          data: '013944',

          groupNumber: 17,
          id: '551234',
          length: 16,
          received: expect.any(String)
        };

        beforeEach(() => {
          allLinkDatabase.addAllLinkRecord(allLinkRecord);
        });

        it('should add a responder', () => {
          expect(allLinkDatabase.links()).toEqual({
            551234: {
              id: '551234',
              deviceCategory: '01',
              deviceSubcategory: '39',
              firmware: '44',
              controllerGroups: {
                17: {
                  bit5: true,
                  groupNumber: 17
                }
              },
              responderGroups: {
                17: {
                  bit5: true,
                  data: '013944',
                  groupNumber: 17,
                }
              }
            }
          });
        });          
      });
    });

    describe('when controller Database Record Found', () => {
      const allLinkRecord = {
        received: '2020-12-06T19:52:20.962Z',
        command: 'Database Record Found',
        code: '59',
        length: 20,
        address: '1EB8',
        inUse: true,
        isController: true,
        bit5: true,
        bit4: false,
        bit3: false,
        bit2: false,
        hasBeenUsed: true,
        bit0: false,
        groupNumber: 13,
        id: '551234',
        deviceCategory: '01',
        deviceSubcategory: '39',
        firmware: '44',
        numberRetries: 1,
        controllerGroupNumber: 68,
        data: '013944',
        bytes: '02591EB8E20D551234013944'
      };
      beforeEach(() => {
        allLinkDatabase.addAllLinkRecord(allLinkRecord);
      });

      it('should add a link', () => {
        expect(allLinkDatabase.links()).toEqual({
          551234: {
            id: '551234',
            deviceCategory: '01',
            deviceSubcategory: '39',
            firmware: '44',
            controllerGroups: {
              13: {
                bit5: true,
                groupNumber: 13
              }
            },
            responderGroups: {}
          }
        });
      });

      describe('and controller Database Record Found again', () => {
        const allLinkRecord = {
          received: '2020-12-06T19:52:20.518Z',
          command: 'Database Record Found',
          code: '59',
          length: 20,
          address: '1EC8',
          inUse: true,
          isController: true,
          bit5: true,
          bit4: false,
          bit3: false,
          bit2: false,
          hasBeenUsed: true,
          bit0: false,
          groupNumber: 0,
          id: '551234',
          deviceCategory: '01',
          deviceSubcategory: '39',
          firmware: '44',
          numberRetries: 1,
          controllerGroupNumber: 68,
          data: '013944',
          bytes: '02591EC8E200551234013944',
          device: 'activity outlet'
        };

        beforeEach(() => {
          allLinkDatabase.addAllLinkRecord(allLinkRecord);
        });

        it('should add a link', () => {
          expect(allLinkDatabase.links()).toEqual({
            551234: {
              id: '551234',
              deviceCategory: '01',
              deviceSubcategory: '39',
              firmware: '44',
              controllerGroups: {
                0: {
                  bit5: true,
                  groupNumber: 0
                },
                13: {
                  bit5: true,
                  groupNumber: 13
                }
              },
              responderGroups: {}
            }
          });
        });
      });
    });

    describe('when device Database Record Found', () => {
      const allLinkRecord = {
        received: '2020-12-13T18:06:33.483Z',
        command: 'INSTEON Extended Message Received',
        code: '51',
        length: 46,
        fromAddress: '551234',
        toAddress: '561234',
        command1: '2F',
        command2: '00',
        data: '00010FFF00AA00561234FF1C01',
        crc: '59',
        messageType: 'direct',
        allLink: false,
        acknowledgement: false,
        extendedMessage: true,
        hopsLeft: 0,
        maxHops: 1,
        insteonCommand: {
          command: 'Read/Write ALL-Link Database',
          type: 'Record Response',
          inUse: true,
          isController: false,
          bit5: true,
          bit4: false,
          bit3: true,
          bit2: false,
          hasBeenUsed: true,
          bit0: false,
          groupNumber: 0,
          id: '561234',
          onLevel: 255,
          rampRate: 28,
          responderGroupNumber: 1,
          data: 'FF1C01',
          address: '0FFF',
          messageType: 'direct',
          fromAddress: '551234',
          toAddress: '561234',
          fromDevice: 'family outlet south',
          toDevice: 'hub controller',
          device: 'hub controller'
        },
        bytes: '0251551234561234112F0000010FFF00AA00561234FF1C0159',
        fromDevice: 'family outlet south',
        toDevice: 'hub controller'
      };

      beforeEach(() => {
        allLinkDatabase.addAllLinkRecord(allLinkRecord);
      });

      it('should add a link', () => {
        expect(allLinkDatabase.links()).toEqual({
          561234: {
            id: '561234',
            controllerGroups: {},
            responderGroups: {
              0: {
                bit5: true,
                data: 'FF1C01',
                groupNumber: 0
              }
            }
          }
        });
      });

      describe('and device Database Record Found again', () => {
        const allLinkRecord = {
          received: '2020-12-13T18:06:33.823Z',
          command: 'INSTEON Extended Message Received',
          code: '51',
          length: 46,
          fromAddress: '551234',
          toAddress: '561234',
          command1: '2F',
          command2: '00',
          data: '00010FF700E201561234010000',
          crc: '43',
          messageType: 'direct',
          allLink: false,
          acknowledgement: false,
          extendedMessage: true,
          hopsLeft: 0,
          maxHops: 1,
          insteonCommand: {
            command: 'Read/Write ALL-Link Database',
            type: 'Record Response',
            inUse: true,
            isController: true,
            bit5: true,
            bit4: false,
            bit3: false,
            bit2: false,
            hasBeenUsed: true,
            bit0: false,
            groupNumber: 1,
            id: '561234',
            deviceCategory: '01',
            deviceSubcategory: '00',
            firmware: '00',
            numberRetries: 1,
            controllerGroupNumber: 0,
            data: '010000',
            address: '0FF7',
            messageType: 'direct',
            fromAddress: '551234',
            toAddress: '561234',
            fromDevice: 'family outlet south',
            toDevice: 'hub controller',
            device: 'hub controller'
          },
          bytes: '0251551234561234112F0000010FF700E20156123401000043',
          fromDevice: 'family outlet south',
          toDevice: 'hub controller'
        };

        beforeEach(() => {
          allLinkDatabase.addAllLinkRecord(allLinkRecord);
        });

        it('should add a link', () => {
          expect(allLinkDatabase.links()).toEqual({
            561234: {
              id: '561234',
              deviceCategory: '01',
              deviceSubcategory: '00',
              firmware: '00',
              controllerGroups: {
                1: {
                  bit5: true,
                  groupNumber: 1
                }
              },
              responderGroups: {
                0: {
                  bit5: true,
                  data: 'FF1C01',
                  groupNumber: 0
                }
              }
            }
          });
        });
      });
    });
  });
});
