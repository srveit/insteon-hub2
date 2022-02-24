'use strict';
const {createPlmBufferProcessor} = require('../lib/plmBufferProcessor');

describe('createPlmBufferProcessor', () => {
  /* eslint no-undefined: "off" */
  let plmBufferProcessor;

  beforeEach(() => {
    plmBufferProcessor = createPlmBufferProcessor();
  });

  describe('when no existing buffer', () => {
    let segment, buffer;
    beforeEach(() => {
      buffer = 'aaaaaaaaaaaaaaaa000010';
      segment = plmBufferProcessor.processPlmBuffer(buffer);
    });

    it('should return the segment', () => {
      expect(segment).toEqual('aaaaaaaaaaaaaaaa');
    });

    describe('then returning the same buffer', () => {
      beforeEach(() => {
        buffer = 'aaaaaaaaaaaaaaaa000010';
        segment = plmBufferProcessor.processPlmBuffer(buffer);
      });

      it('should return no segment', () => {
        expect(segment).toBeUndefined();
      });
    });

    describe('then additional data arrives', () => {
      beforeEach(() => {
        buffer = 'aaaaaaaaaaaaaaaabbbb000014';
        segment = plmBufferProcessor.processPlmBuffer(buffer);
      });

      it('should return the new segment', () => {
        expect(segment).toEqual('bbbb');
      });
    });

    describe('then a totally new buffer', () => {
      beforeEach(() => {
        buffer = 'bbbbbbbbbbbbbbbbbbbb000014';
        segment = plmBufferProcessor.processPlmBuffer(buffer);
      });

      it('should return the new segment', () => {
        expect(segment).toEqual('bbbbbbbbbbbbbbbbbbbb');
      });
    });

    describe('then a an new message that rolls over', () => {
      beforeEach(() => {
        buffer = 'bbbbaaaaaaaaaaaabbbbbbbb04';
        segment = plmBufferProcessor.processPlmBuffer(buffer);
      });

      it('should return the new segment', () => {
        expect(segment).toEqual('bbbbbbbbbbbb');
      });
    });

    describe('then a an new message that starts at beginning', () => {
      beforeEach(() => {
        buffer = 'bbbb000000000000000004';
        segment = plmBufferProcessor.processPlmBuffer(buffer);
      });

      it('should return the new segment', () => {
        expect(segment).toEqual('bbbb');
      });
    });
  });

  describe('when empty buffer', () => {
    let segment, buffer;
    beforeEach(() => {
      buffer = '';
      segment = plmBufferProcessor.processPlmBuffer(buffer);
    });

    it('should not return a segment', () => {
      expect(segment).toBeUndefined();
    });
  });
});
