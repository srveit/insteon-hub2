'use strict';

const createAllLinkDatabase = deviceNames => {
  const deviceInfo = {},
    entries = {},
    names = Object.assign({}, deviceNames);

  const addAllLinkRecord = record => {
    if (!record.inUse) {
      return;
    }
    let entry = entries[record.id];
    if (!entry) {
      entry = { id: record.id };
      entries[record.id] = entry;
    }
    entry.deviceName = names[record.id];
    if (record.isController) {
      entry.deviceCategory = record.deviceCategory;
      entry.deviceSubcategory = record.deviceSubcategory;
      entry.firmware = record.firmware;
      entry.controller = {
        groupNumber: record.groupNumber,
        bit5: record.bit5
      };
    } else {
      entry.responders = entry.responders || [];
      entry.responders.push({
        groupNumber: record.groupNumber,
        data: record.data,
        bit5: record.bit5
      });
    }
  };

  const addDeviceInfo = info => {
    Object.assign(deviceInfo, info);
    deviceInfo.deviceName = names[deviceInfo.deviceId];
  };
  const info = () => deviceInfo;
  const links = () => entries;

  return Object.freeze({
    addAllLinkRecord,
    addDeviceInfo,
    info,
    links
  });
};

exports.createAllLinkDatabase = createAllLinkDatabase;
