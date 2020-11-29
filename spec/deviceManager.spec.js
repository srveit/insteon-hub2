'use strict';
const {createDeviceManager} = require('../lib/deviceManager');

      // readDeviceAllLinkDatabase   (TODO: figure better way to implement)
      // readHubAllLinkDatabase   (TODO: figure better way to implement)

describe('createDeviceManager', () => {
  let deviceManager;
  const deviceNames = {
    'im-hub': 'im-hub',
    170809: 'hub controller',
    210203: 'device1',
    340506: 'device2'
  };

  beforeEach(() => {
    deviceManager = createDeviceManager({deviceNames});
  });

  describe('deviceManager.devices', () => {
    it('should return device map', () => {
      expect(deviceManager.devices).toEqual(expect.objectContaining({
        210203: expect.objectContaining({
          name: 'device1'
        })
      }));
    });
  });

  describe('updateDeviceInfo', () => {
    beforeEach(() => {
      
    });
  });
});
