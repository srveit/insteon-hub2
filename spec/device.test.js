'use strict'
const unroll = require('unroll')
const { createDevice } = require('../lib/device')

unroll.use(it)

describe('device.createDevice', () => {
  let device

  beforeEach(() => {
    device = createDevice({
      id: '561234',
      name: 'front lights',
    })
  })

  it('should have a id', () => {
    expect(device.id()).toEqual('561234')
  })

  it('should have a name', () => {
    expect(device.name()).toEqual('front lights')
  })

  describe('update', () => {
    describe('with SET Button Pressed Responder', () => {
      beforeEach(() => {
        device.update({
          command: 'SET Button Pressed Responder',
          hardwareVersion: '82',
          messageType: 'broadcast',
          fromAddress: '561234',
          deviceCategory: '01',
          deviceSubcategory: '2D',
          firmware: '44',
          fromDevice: 'front lights',
        })
      })

      it('should update the hardware version', () => {
        expect(device.hardwareVersion()).toEqual('82')
      })

      it('should update the firmware version', () => {
        expect(device.firmware()).toEqual('44')
      })

      it('should update the deviceCategory', () => {
        expect(device.deviceCategory()).toEqual('01')
        expect(device.deviceSubcategory()).toEqual('2D')
      })

      it('should update the categoryName', () => {
        expect(device.categoryName()).toEqual('Dimmable Lighting Control')
      })

      it('should update the productKey', () => {
        expect(device.productKey()).toEqual('00009E')
      })

      it('should update the deviceDescription', () => {
        expect(device.deviceDescription()).toEqual('SwitchLinc-Dimmer Dual-Band 1000W')
      })

      it('should update the modelNumber', () => {
        expect(device.modelNumber()).toEqual('2477DH')
      })
    })

    describe('with Get INSTEON Engine Version', () => {
      beforeEach(() => {
        device.update({
          command: 'Get INSTEON Engine Version',
          engineVersion: 2,
          messageType: 'directAck',
          fromAddress: '561234',
          toAddress: '123456',
          fromDevice: 'front lights',
          toDevice: 'hub controller',
        })
      })

      it('should update the engine version', () => {
        expect(device.engineVersion()).toBe(2)
      })
    })

    describe('with Product Data Response', () => {
      describe('with exisiting category', () => {
        beforeEach(() => {
          device.update({
            command: 'Product Data Response',
            productKey: '000000',
            deviceCategory: '01',
            deviceSubcategory: '2D',
            firmware: '44',
            d8: '00',
            userDefined: '1F00010000',
            messageType: 'direct',
            fromAddress: '561234',
            toAddress: '123456',
            fromDevice: 'front lights',
            toDevice: 'hub controller',
          })
        })

        it('should update the productKey', () => {
          expect(device.productKey()).toEqual('00009E')
        })

        it('should update the deviceCategory', () => {
          expect(device.deviceCategory()).toEqual('01')
          expect(device.deviceSubcategory()).toEqual('2D')
        })

        it('should update the firmware version', () => {
          expect(device.firmware()).toEqual('44')
        })

        it('should update the userDefined data', () => {
          expect(device.userDefined()).toEqual('1F00010000')
        })

        it('should update the categoryName', () => {
          expect(device.categoryName()).toEqual('Dimmable Lighting Control')
        })

        it('should update the deviceDescription', () => {
          expect(device.deviceDescription()).toEqual('SwitchLinc-Dimmer Dual-Band 1000W')
        })

        it('should update the modelNumber', () => {
          expect(device.modelNumber()).toEqual('2477DH')
        })
      })

      describe('with non-exisitent category', () => {
        /* eslint no-undefined: "off" */
        beforeEach(() => {
          device.update({
            command: 'Product Data Response',
            productKey: '000000',
            deviceCategory: '44',
            deviceSubcategory: '88',
            firmware: '44',
            d8: '00',
            userDefined: '1F00010000',
            messageType: 'direct',
            fromAddress: '561234',
            toAddress: '123456',
            fromDevice: 'front lights',
            toDevice: 'hub controller',
          })
        })

        it('should not update the productKey', () => {
          expect(device.productKey()).toBe(undefined)
        })

        it('should not update the deviceCategory', () => {
          expect(device.deviceCategory()).toEqual('44')
          expect(device.deviceSubcategory()).toEqual('88')
        })

        it('should update the firmware version', () => {
          expect(device.firmware()).toEqual('44')
        })

        it('should update the userDefined data', () => {
          expect(device.userDefined()).toEqual('1F00010000')
        })

        it('should not update the categoryName', () => {
          expect(device.categoryName()).toBe(undefined)
        })

        it('should not update the deviceDescription', () => {
          expect(device.deviceDescription()).toBe(undefined)
        })

        it('should not update the modelNumber', () => {
          expect(device.modelNumber()).toBe(undefined)
        })
      })

      describe('with non-exisitent subcategory', () => {
        beforeEach(() => {
          device.update({
            command: 'Product Data Response',
            productKey: '000000',
            deviceCategory: '01',
            deviceSubcategory: 'E8',
            firmware: '44',
            d8: '00',
            userDefined: '1F00010000',
            messageType: 'direct',
            fromAddress: '561234',
            toAddress: '123456',
            fromDevice: 'front lights',
            toDevice: 'hub controller',
          })
        })

        it('should not update the productKey', () => {
          expect(device.productKey()).toBe(undefined)
        })

        it('should not update the deviceCategory', () => {
          expect(device.deviceCategory()).toEqual('01')
          expect(device.deviceSubcategory()).toEqual('E8')
        })

        it('should update the firmware version', () => {
          expect(device.firmware()).toEqual('44')
        })

        it('should update the userDefined data', () => {
          expect(device.userDefined()).toEqual('1F00010000')
        })

        it('should update the categoryName', () => {
          expect(device.categoryName()).toEqual('Dimmable Lighting Control')
        })

        it('should not update the deviceDescription', () => {
          expect(device.deviceDescription()).toBe(undefined)
        })

        it('should not update the modelNumber', () => {
          expect(device.modelNumber()).toBe(undefined)
        })
      })
    })

    describe('add All-Link Database record', () => {
      beforeEach(() => {
        device.update()
      })
    })

    unroll(
      'with #command should update #stateProperties',
      testArgs => {
        const command = {
          ...testArgs.stateProperties,
          command: 'Light Status Response',
          messageType: 'directAck',
          fromAddress: '561234',
          toAddress: '123456',
          fromDevice: 'front lights',
          toDevice: 'hub controller',
        }
        device.update(command)
        for (const [stateName, value] of Object.entries(testArgs.stateProperties)) {
          expect(device.state()[stateName]).toEqual(value)
        }
      },
      [
        ['command', 'stateProperties'],
        ['Light Status Response', { onLevel: 0, allLinkDatabaseDelta: 0 }],
      ])
  })
})
