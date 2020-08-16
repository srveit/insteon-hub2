'use strict';

const util = require('util');
const { createAllLinkDatabase } = require('../lib/allLinkDatabase.js');

const iso8601Regex =
  new RegExp('^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}Z');

const waitForReadable = stream => new Promise(resolve => {
  if (stream.readable) {
    resolve();
  } else {
    stream.once('readable', resolve);
  }
});

fdescribe('createAllLinkDatabase', () => {
  let allLinkDatabase;
  beforeEach(() => {
    allLinkDatabase = createAllLinkDatabase();
  });

  describe('allLinkDatabase.addAllLinkRecord', () => {
    it('should exist', () => {
      expect(allLinkDatabase.addAllLinkRecord).toEqual(expect.any(Function));
    });
  });
});
