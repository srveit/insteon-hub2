'use strict'
const { createHouse } = require('../lib/house')
const deviceNames = {
  'im-hub': 'im-hub',
  '070809': 'hub controller',
  '010203': 'device1',
  '040506': 'device2',

  521234: 'porch outlets',
  531234: 'Garage lights',
  541234: 'foyer lamps switch',
  551234: 'foyer chandelier switch',
  561234: 'front lights',
  571234: 'foyer chandelier',
  581234: 'foyer lamps',
  591234: 'dining outlet',
}

describe('house.createHouse', () => {
  let house

  beforeEach(() => {
    house = createHouse(deviceNames)
  })

  describe('numberDevices', () => {
    it('should exist', () => {
      expect(house.numberDevices()).toBe(11)
    })
  })

  describe('getDevice', () => {
    let device
    beforeEach(() => {
      device = house.getDevice('581234')
    })
    it('should return the device', () => {
      expect(device.id()).toEqual('581234')
      expect(device.name()).toEqual('foyer lamps')
    })
  })

  describe('update devices', () => {
    describe('with existing device', () => {
      let device
      beforeEach(() => {
        device = house.getDevice('581234')
        house.updateDevices({
          command: 'Product Data Response',
          productKey: '000000',
          deviceCategory: '02',
          deviceSubcategory: '39',
          firmware: '44',
          d8: '00',
          userDefined: '0000000000',
          messageType: 'direct',
          fromAddress: '581234',
          toAddress: '123456',
          fromDevice: 'foyer lamps',
          toDevice: 'hub controller',
        })
      })

      it('should update the categoryName', () => {
        expect(device.categoryName()).toEqual('Switched Lighting Control')
      })
    })

    describe('with non-existent device', () => {
      let result
      beforeEach(() => {
        result = house.updateDevices({
          command: 'Product Data Response',
          productKey: '000000',
          deviceCategory: '02',
          deviceSubcategory: '39',
          firmware: '44',
          d8: '00',
          userDefined: '0000000000',
          messageType: 'direct',
          fromAddress: 'bbbbbb',
          toAddress: '123456',
          fromDevice: 'foyer lamps',
          toDevice: 'hub controller',
        })
      })

      it('should not fail', () => {
        /* eslint no-undefined: "off" */
        expect(result).toBe(undefined)
      })
    })
  })
})
