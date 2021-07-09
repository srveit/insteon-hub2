'use strict';
const { parseStringPromise } = require('xml2js'),
  unzipper = require('unzipper'),
  fetch = require('node-fetch'),
  URL = 'https://www.insteon.com/s/houselinc-device-definitions-2987-bjb7.zip';

const getDevicesXml = async () => {
  try {
    const response = await fetch(URL);
    const directory = await unzipper.Open.buffer(await response.buffer()),
      file = directory.files[0],
      content = await file.buffer();

    return content;
  } catch (error) {
    console.warn(error);
    return undefined;
  }
};


function extractNode(node, alwaysArray) {
  let base = {};
  if (typeof node === 'string') {
    return node;
  }

  if (Array.isArray(node)) {
    if (node.length === 1 && !alwaysArray) {
      return extractNode(node[0]);
    }
    return node.map(extractNode);
  }

  for (const key in node) {
    if (key === '$') {
      base = Object.assign(base, node[key]);
    } else {
      base[key] = extractNode(node[key], ['device'].includes(key));
    }
  }
  return base;
}

const examplesOfDevices = {
  '00': 'ControLinc, RemoteLinc, SignaLinc, etc.',
  '01': 'Dimmable Light Switches, Dimmable Plug-In Modules',
  '02': 'Relay Switches, Relay Plug-In Modules',
  '03': 'PowerLinc Controllers, TRex, Lonworks, ZigBee, etc.',
  '04': 'Irrigation Management, Sprinkler Controllers',
  '05': 'Heating, Air conditioning, Exhausts Fans, Ceiling Fans, Indoor Air Quality',
  '06': 'Pumps, Heaters, Chemicals',
  '07': 'Sensors, Contact Closures',
  '08': 'Audio/Video Equipment',
  '09': 'Electricity, Water, Gas Consumption, Leak Monitors',
  '0A': 'White Goods, Brown Goods',
  '0B': 'Faucets, Showers, Toilets',
  '0C': 'Telephone System Controls, Intercoms',
  '0D': 'PC On/Off, UPS Control, App Activation, Remote Mouse, Keyboards',
  '0E': 'Drapes, Blinds, Awnings',
  '0F': 'Automatic Doors, Gates, Windows, Locks',
  '10': 'Door and Window Sensors, Motion Sensors, Scales',
  '11': 'Video Camera Control, Time-lapse Recorders, Security System Links',
  '12': 'Remote Starters, Car Alarms, Car Door Locks',
  '13': 'Pet Feeders, Trackers',
  '14': 'Model Trains, Robots',
  '15': 'Clocks, Alarms, Timers',
  '16': 'Christmas Lights, Displays',
  'FF': 'For devices that will be assigned a DevCat and SubCat by software'
};

// TODO: add missing devices
function devicesStruct(categories) {
  return categories.reduce(
    (devices, category) => {
      const categoryId = category.devCat.slice(2),
        categoryName = category.description,
        subcategories = category.device ? category.device.reduce(
          (devices, xmlDevice) => {
            
            const subcategoryId = xmlDevice.subcategory.slice(-2),
              device = devices[subcategoryId] || {},
              [deviceDescription, modelNumber] =
              xmlDevice.description.split(/ *\[/);
            device.categoryId = categoryId;
            device.subcategoryId = subcategoryId;
            device.productKey = xmlDevice.productKey.slice(-6);
            device.deviceDescription = deviceDescription;
            if (modelNumber) {
              device.modelNumber = modelNumber.replace(']', '');
            }
            devices[subcategoryId] = device;
            return devices;
          },
          {}
        ) :
        {};
      devices[categoryId] = {
        categoryId,
        categoryName,
        examplesOfDevices: examplesOfDevices[categoryId],
        subcategories
      };
      return devices;
    },
    {}
  );
}

async function decodeDevicesXml() {
  const contents = await getDevicesXml(),
    xml = await parseStringPromise(contents.toString()),
    availableDevices = xml.deviceFactory.availableDevices;

  return devicesStruct(extractNode(availableDevices[0].category));
}

module.exports = decodeDevicesXml;
