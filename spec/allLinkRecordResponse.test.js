'use strict';
const parser = require('../lib/parsers')['57'];

describe('ALL-Link Record Response ', () => {
  let allLinkRecordResponse;

  describe('from controller', () => {
    const buffer = 'E21155123401394414';

    beforeEach(() => {
      allLinkRecordResponse = parser(buffer);
    });

    it('should have properties', () => {
      expect(allLinkRecordResponse).toMatchObject({
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
      });
    });
  });

  describe('from device', () => {
    const buffer = 'A21155123401394414';

    beforeEach(() => {
      allLinkRecordResponse = parser(buffer);
    });

    it('should have properties', () => {
      expect(allLinkRecordResponse).toMatchObject({
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
      });
    });
  });
});
