'use strict';
const {createPlmCommandQueue} = require('../lib/plmCommandQueue');

describe('plmCommandQueue.createPlmCommandQueue', () => {
  /* eslint no-undefined: "off" */
  let plmCommandQueue, sendCommandBuffer;
  const delay = 0.1;

  beforeEach(() => {
    jest.useFakeTimers();
    sendCommandBuffer = jest.fn();
    plmCommandQueue = createPlmCommandQueue(sendCommandBuffer, delay);
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('addCommand with no retries', () => {
    let responseHandler, rejection, returnedResponse;

    const commandBuffer = '01020304',
      responseMatcher = response => response.match;

    beforeEach(() => {
      responseHandler =
        plmCommandQueue.addCommand(
          commandBuffer,
          responseMatcher,
          {maxNumberRetries: 1, delay}
        );
      responseHandler.then(response => {
        returnedResponse = response;
      });
      responseHandler.catch(returnedError => {
        rejection = returnedError;
      });
    });

    it('should call sendCommandBuffer', () => {
      expect(sendCommandBuffer).toHaveBeenCalledWith(commandBuffer);
    });

    it('should not queue commandBuffer', () => {
      expect(plmCommandQueue.queueLength()).toBe(0);
    });

    describe('and addCommand called again', () => {
      let responseHandler2, returnedResponse2, rejection2;
      const secondCommandBuffer = '05060708';
      beforeEach(() => {
        responseHandler2 =
          plmCommandQueue.addCommand(
            secondCommandBuffer,
            responseMatcher,
            {delay}
          );
        responseHandler2.then(response => {
          returnedResponse2 = response;
        });
        responseHandler2.catch(returnedError => {
          rejection2 = returnedError;
        });
      });

      it('should not call sendCommandBuffer again', () => {
        expect(sendCommandBuffer).not.toHaveBeenCalledWith(secondCommandBuffer);
      });

      it('should queue secondCommandBuffer', () => {
        expect(plmCommandQueue.queueLength()).toBe(1);
      });

      describe('and handleResponse with matching response called', () => {
        const response = {
          id: 1,
          match: true
        };

        beforeEach(() => {
          plmCommandQueue.handleResponse(response);
        });

        it('should call sendCommandBuffer', () => {
          expect(sendCommandBuffer).toHaveBeenCalledWith(secondCommandBuffer);
        });

        it('should empty queue', () => {
          expect(plmCommandQueue.queueLength()).toBe(0);
        });

        it('should resolve responseHandler', () => {
          expect(returnedResponse).toEqual(response);
        });

        describe('and second response is received', () => {
          const response2 = {
            id: 2,
            match: true
          };

          beforeEach(() => {
            plmCommandQueue.handleResponse(response2);
          });
          it('should resolve responseHandler', () => {
            expect(returnedResponse2).toEqual(response2);
          });
        });

      });
    });
  });

  describe('addCommand with one retry', () => {
    let responseHandler, rejection, returnedResponse;

    const commandBuffer = '01020304',
      responseMatcher = response => response.match;

    beforeEach(() => {
      responseHandler =
        plmCommandQueue.addCommand(
          commandBuffer,
          responseMatcher,
          {maxNumberRetries: 1, delay}
        );
      responseHandler.catch(returnedError => {
         rejection = returnedError;
      });
    });

    it('should call sendCommandBuffer', () => {
      expect(sendCommandBuffer).toHaveBeenCalledWith(commandBuffer);
      expect(setTimeout).toHaveBeenCalledTimes(1);
    });

    describe('and timeout expires', () => {
      beforeEach(() => {
        jest.advanceTimersByTime(delay * 1.1 * 1000);
      });

      it('should call sendCommandBuffer again', () => {
        expect(sendCommandBuffer).toHaveBeenCalledTimes(2);
      });

      describe('and timeout expires again', () => {
        beforeEach(() => {
          jest.advanceTimersByTime(delay * 1.1 * 1000);
        });
        
        it('should reject responseHandler', () => {
          expect(rejection).toEqual({
            message: 'response not received'
          });
        });
      });
    });
  });
});
