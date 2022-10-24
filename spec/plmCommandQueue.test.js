'use strict'
const { createPlmCommandQueue } = require('../lib/plmCommandQueue')

describe('plmCommandQueue.createPlmCommandQueue', () => {
  /* eslint no-undefined: "off" */
  let plmCommandQueue, sendCommandBuffer, setTimeout

  beforeEach(() => {
    jest.useFakeTimers()
    sendCommandBuffer = jest.fn()
    setTimeout = jest.fn()
    plmCommandQueue = createPlmCommandQueue(sendCommandBuffer, setTimeout)
  })

  afterEach(() => {
    jest.clearAllTimers()
  })

  describe('addCommand with no retries', () => {
    let responseHandler

    const delay = 0.1
    const commandBuffer = '01020304'
    const responseMatcher = response => response.match

    beforeEach(() => {
      responseHandler =
        plmCommandQueue.addCommand(
          commandBuffer,
          responseMatcher,
          { maxNumberRetries: 0, delay }
        )
    })

    it('should call sendCommandBuffer', () => {
      expect(sendCommandBuffer).toHaveBeenCalledWith(commandBuffer)
    })

    it('should not queue commandBuffer', () => {
      expect(plmCommandQueue.queueLength()).toBe(0)
    })

    describe('and addCommand called again', () => {
      let responseHandler2

      const secondCommandBuffer = '05060708'

      beforeEach(() => {
        responseHandler2 =
          plmCommandQueue.addCommand(
            secondCommandBuffer,
            responseMatcher,
            { delay }
          )
      })

      it('should not call sendCommandBuffer again', () => {
        expect(sendCommandBuffer).not.toHaveBeenCalledWith(secondCommandBuffer)
      })

      it('should queue secondCommandBuffer', () => {
        expect(plmCommandQueue.queueLength()).toBe(1)
      })

      describe('and handleResponse with matching response called', () => {
        const response = {
          id: 1,
          match: true,
        }

        beforeEach(() => {
          plmCommandQueue.handleResponse(response)
        })

        it('should call sendCommandBuffer', () => {
          expect(sendCommandBuffer).toHaveBeenCalledWith(secondCommandBuffer)
        })

        it('should empty queue', () => {
          expect(plmCommandQueue.queueLength()).toBe(0)
        })

        it('should resolve responseHandler', () => {
          expect(responseHandler).resolves.toEqual(response)
        })

        describe('and non-matching response received', () => {
          beforeEach(() => {
            plmCommandQueue.handleResponse({
              id: 3,
              match: false,
            })
          })

          describe('and second response is received', () => {
            const response2 = {
              id: 2,
              match: true,
            }

            beforeEach(() => {
              plmCommandQueue.handleResponse(response2)
            })

            it('should resolve responseHandler', () => {
              expect(responseHandler2).resolves.toEqual(response2)
            })
          })
        })
      })
    })
  })

  describe('addCommand with default retries', () => {
    let responseHandler

    const defaultDelay = 1
    const commandBuffer = '01020304'
    const responseMatcher = response => response.match

    beforeEach(() => {
      responseHandler =
        plmCommandQueue.addCommand(
          commandBuffer,
          responseMatcher
        )
    })

    it('should call sendCommandBuffer', () => {
      expect(sendCommandBuffer).toHaveBeenCalledWith(commandBuffer)
      expect(setTimeout).toHaveBeenCalledTimes(1)
      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), defaultDelay * 1000)
    })

    describe('and timeout expires', () => {
      let handler

      beforeEach(() => {
        handler = setTimeout.mock.calls[0][0]
        handler()
        handler()
        handler()
      })

      it('should call sendCommandBuffer again', () => {
        expect(sendCommandBuffer).toHaveBeenCalledTimes(4)
      })

      describe('and timeout expires again', () => {
        beforeEach(() => {
          handler()
        })

        it('should reject responseHandler', () => {
          expect(responseHandler).rejects.toEqual({
            message: 'response not received',
          })
        })
      })
    })
  })

  describe('and handleResponse with not outstanding command called', () => {
    const response = {
      id: 1,
      match: true,
    }

    beforeEach(() => {
      plmCommandQueue.handleResponse(response)
    })

    it('should not call sendCommandBuffer', () => {
      expect(sendCommandBuffer).not.toHaveBeenCalled()
    })
  })
})
