'use strict';

function keyValueToString(key, value, indent) {
  const keyString = key.match(/^[$A-Z_a-z][$0-9A-Z_a-z]*/) ?
    key :
    `'${key}'`;
    
  return `${keyString}: ${objectToString(value, indent + '  ')}`;
}

function compareKeys(k1, k2) {
  const specialKeys = [
    'categoryId',
    'subcategoryId',
    'productKey',
    'deviceDescription',
    'modelNumber'
  ],
    i1 = specialKeys.indexOf(k1),
    i2 = specialKeys.indexOf(k2);
  if (i1 >= 0 && i2 >= 0) {
    return i1 - i2;
  }
  return k1.localeCompare(k2);
}

function objectToString(object, indent = '') {
  if (object === undefined) {
    return 'undefined';
  }
  if (object === null) {
    return 'null';
  }
  if (typeof object === 'number') {
    return object.toString(10);
  }
  if (typeof object === 'string') {
    const encodedString = object.replace(/'/g, '\\\'');
    return `'${encodedString}'`;
  }
  if (Array.isArray(object)) {
    if (object.length === 0) {
      return '[]';
    }
    return '[\n' +
      indent + '  ' +
      object.map(element => objectToString(element, indent + '  '))
      .join(',\n  ' + indent) +
      '\n' + indent + ']';
  }
  const keys = Object.keys(object).sort(compareKeys);
  if (keys.length === 0) {
    return '{}';
  }
  return '{\n' +
    indent + '  ' +
    keys.map(key => keyValueToString(key, object[key], indent))
    .join(',\n  ' + indent) +
    '\n' + indent + '}';
}

module.exports = objectToString;
