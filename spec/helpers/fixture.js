'use strict';

const fs = require('fs/promises'),
  path = require('path'),

  fixture = filename =>
    fs.readFile(path.join(__dirname, '..', 'fixtures/', filename), 'utf8');

exports.fixture = fixture;
