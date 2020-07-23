'use strict';
const createPlmBufferProcessor = () => {
  let currentBuffer = '',
    previousBuffer = '';

  const processPlmBuffer = buffer => {
    const previousBufferLength = previousBuffer.length > 2 ?
      parseInt(previousBuffer.slice(-2), 16) : 0,
      bufferLength = buffer && buffer.length > 2 ?
      parseInt(buffer.slice(-2), 16) : 0;

    if (!buffer || buffer === previousBuffer) {
      return undefined;
    }
    let segment;
    if (bufferLength >= previousBufferLength) {
      if (previousBuffer.slice(0, previousBufferLength) ===
          buffer.slice(0, previousBufferLength)) {
        // Case 1
        //   old aaaaaa000000
        //   new aaaaaabbb000
        //   Added to existing buffer but not rolled over
        segment = buffer.slice(previousBufferLength, bufferLength);
      } else {
        // Case 3
        //   old aaaaaa000000
        //   new bbbbbbbb0000
        //   Totally new buffer
        segment = buffer.slice(0, bufferLength);
      }
    } else if (previousBuffer.slice(bufferLength, previousBufferLength) ===
               buffer.slice(bufferLength, previousBufferLength)) {
      // Case 2
      //   old aaaaaa000000
      //   new bbbaaabbbbbb
      //   Added to existing buffer and rolled over
      segment = buffer.slice(previousBufferLength, -2) +
        buffer.slice(0, bufferLength);
    } else {
      // Case 3
      //   old aaaaaa000000
      //   new bbb000000000
      //   Totally new buffer
      segment = buffer.slice(0, bufferLength);
    }
    previousBuffer = buffer;
    return segment;
  };

  return Object.freeze({
    processPlmBuffer
  });
};

exports.createPlmBufferProcessor = createPlmBufferProcessor;
