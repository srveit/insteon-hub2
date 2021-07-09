'use strict';

const createAllLinkRecord = buffer => {
  const flags = parseInt(buffer.substr(0, 2), 16),
    response = {
      inUse: (0x80 & flags) !== 0,
      isController: (0x40 & flags) !== 0,
      bit5: (0x20 & flags) !== 0,
      bit4: (0x10 & flags) !== 0,
      bit3: (0x08 & flags) !== 0,
      smartHop: (0x18 & flags) >> 3,
      bit2: (0x04 & flags) !== 0,
      hasBeenUsed: (0x02 & flags) !== 0,
      bit0: (0x01 & flags) !== 0,
      groupNumber: parseInt(buffer.substr(2, 2), 16),
      id: buffer.substr(4, 6)
    };

  if (response.inUse) {
    if (response.isController) {
      response.deviceCategory = buffer.substr(10, 2);
      response.deviceSubcategory = buffer.substr(12, 2);
      response.firmware = buffer.substr(14, 2);
      response.numberRetries = parseInt(buffer.substr(10, 2), 16);
      response.controllerGroupNumber = parseInt(buffer.substr(14, 2), 16);
    } else {
      response.onLevel = parseInt(buffer.substr(10, 2), 16);
      response.rampRate = parseInt(buffer.substr(12, 2), 16);
      response.responderGroupNumber = parseInt(buffer.substr(14, 2), 16);
    }
    response.data = buffer.substr(10, 6);
  }
  return response;
};

exports.createAllLinkRecord = createAllLinkRecord;
