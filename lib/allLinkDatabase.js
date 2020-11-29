'use strict';

const createAllLinkDatabase = () => {
  const entries = {},

    addAllLinkRecord = record => {
      if (!record.inUse) {
        return;
      }
      let entry = entries[record.id];
      if (!entry) {
        entry = {id: record.id};
        entries[record.id] = entry;
      }
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
    },

    links = () => entries;

  return Object.freeze({
    addAllLinkRecord,
    links
  });
};

exports.createAllLinkDatabase = createAllLinkDatabase;
