'use strict';

const path = require('path'),
  fs = require('fs'),
  decodeDevelopersGuide = require('./decodeDevelopersGuide.js'),
  decodeDevicesXml = require('./decodeDevicesXml.js'),
  decodeWikiPage = require('./decodeWikiPage.js'),
  objectToString = require('./objectToString.js'),
  DEVICE_CATEGORIES_FILE = path.join(__dirname, '../lib/deviceCategories.js');

function writeStruct(stream, deviceCategories) {
  stream.write('\'use strict\';\n');
  stream.write('module.exports = ');
  stream.write(objectToString(deviceCategories));
  stream.write(';\n');
}

function writeDevices(deviceCategories) {
  for (const categoryId of Object.keys(deviceCategories).sort()) {
    const category = deviceCategories[categoryId];
    for (const subcategoryId of Object.keys(category.subcategories).sort()) {
      const device = category.subcategories[subcategoryId];
      console.log(
        device.categoryId,
        device.subcategoryId,
        (device.modelNumber || '').padEnd(11, ' '),
        device.deviceDescription
      );
    }
  }
}
    
// values in categories2 overwrite values in categories
function combineCategories(categories, categories2) {
  for (const category2 of Object.values(categories2)) {
    for (const device2 of Object.values(category2.subcategories)) {
      const subcategories = categories[device2.categoryId] &&
        categories[device2.categoryId].subcategories;
      const device = subcategories && subcategories[device2.subcategoryId];
      if (device) {
        if (device2.productKey &&
            device2.productKey !== '000000' &&
            device.productKey !== device2.productKey) {
          device.productKey = device2.productKey;
        }
        if (device2.modelNumber &&
            device.modelNumber !== device2.modelNumber) {
          device.modelNumber = device2.modelNumber;
        }
        if (device.deviceDescription !== device2.deviceDescription) {
          device.deviceDescription = device2.deviceDescription;
        }
      } else if (subcategories) {
        subcategories[device2.subcategoryId] = device2;
      } else {
        console.warn(`unable to find category ${device.categoryId}`);
      }
    }
  }
}

// 2868-222dev-112816-en.pdf
const additionalDevices = [
  ['07', '1E', 'INSTEON Siren', '2868-222'],
];

function addAdditionalDevices(categories, additionalDevices) {
  for (const [categoryId, subcategoryId, deviceDescription, modelNumber] of additionalDevices) {
    if (!categories[categoryId]) {
      categories[categoryId] = {
        categoryId,
        subcategories: {}
      };
    }
    categories[categoryId].subcategories[subcategoryId] = {
      categoryId,
      subcategoryId,
      productKey: '000000',
      deviceDescription,
      modelNumber
    };
  }
}

async function createDeviceCategories() {
  const categories = await decodeDevelopersGuide(),
    categories2 = await decodeDevicesXml(),
    categories3 = await decodeWikiPage(),
    outputStream = fs.createWriteStream(DEVICE_CATEGORIES_FILE);

  combineCategories(categories, categories2);
  combineCategories(categories, categories3);
  addAdditionalDevices(categories, additionalDevices);
  // writeDevices(categories);
  writeStruct(outputStream, categories);
  console.log(`wrote ${DEVICE_CATEGORIES_FILE}`);
}

createDeviceCategories();
