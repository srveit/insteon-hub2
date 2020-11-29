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
            controller: {
              bit5: true,
              groupNumber: 17
            }
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
              controller: {
                bit5: true,
                groupNumber: 17
              },
              responders: [
                {
                  bit5: true,
                  data: '013944',
                  groupNumber: 17,
                }
              ]
            }
          });
        });          
      });
    });
  });
});
