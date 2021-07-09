'use strict';

const createAllLinkDatabase = () => {
  const entries = {},

    addAllLinkRecord = record => {
      if (record.insteonCommand && record.insteonCommand.type === 'Record Response') {
        addAllLinkRecord(record.insteonCommand);
        return;
      }
      if (!record.inUse) {
        return;
      }
      let entry = entries[record.id];
      if (!entry) {
        entry = {
          id: record.id,
          controllerGroups: {},
          responderGroups: {}
        };
        entries[record.id] = entry;
      }
      if (record.isController) {
        entry.deviceCategory = record.deviceCategory;
        entry.deviceSubcategory = record.deviceSubcategory;
        entry.firmware = record.firmware;
        entry.controllerGroups[record.groupNumber] = {
          groupNumber: record.groupNumber,
          bit5: record.bit5
        };
      } else {
        entry.responderGroups[record.groupNumber] = {
          groupNumber: record.groupNumber,
          data: record.data,
          bit5: record.bit5
        };
      }
    },

    links = () => entries;

  return Object.freeze({
    addAllLinkRecord,
    links
  });
};

exports.createAllLinkDatabase = createAllLinkDatabase;
