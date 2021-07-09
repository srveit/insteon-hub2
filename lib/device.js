'use strict';

const deviceCategories = require('./deviceCategories');

function createDevice({id, name}) {
  const properties = {
      id,
      name
    },

    state = {},

    update = command => {
      const propertyNames = [
          'deviceCategory',
          'deviceSubcategory',
          'firmware',
          'hardwareVersion',
          'engineVersion',
          'userDefined'
        ],

        stateNames = [
          'onLevel',
          'allLinkDatabaseDelta'
        ],

        categoryDescription =
        deviceCategories[command.deviceCategory];

      if (categoryDescription) {
        properties.categoryName = categoryDescription.categoryName;
        const subcategoryDescription =
          categoryDescription.subcategories[command.deviceSubcategory];
        if (subcategoryDescription) {
          properties.productKey = subcategoryDescription.productKey;
          properties.deviceDescription = subcategoryDescription.deviceDescription;
          properties.modelNumber = subcategoryDescription.modelNumber;
        }
      }
      /* eslint no-undefined: "off" */
      for (const propertyName of propertyNames) {
        if (command[propertyName] !== undefined) {
          properties[propertyName] = command[propertyName];
        }
      }
      for (const stateName of stateNames) {
        if (command[stateName] !== undefined) {
          state[stateName] = command[stateName];
        }
      }
    };

  return Object.freeze({
    id: () => properties.id,
    name: () => properties.name,
    categoryName: () => properties.categoryName,
    productKey: () => properties.productKey,
    deviceDescription: () => properties.deviceDescription,
    modelNumber: () => properties.modelNumber,
    deviceCategory: () => properties.deviceCategory,
    deviceSubcategory: () => properties.deviceSubcategory,
    firmware: () => properties.firmware,
    hardwareVersion: () => properties.hardwareVersion,
    engineVersion: () => properties.engineVersion,
    userDefined: () => properties.userDefined,
    state: () => state,
    update
  });
}

exports.createDevice = createDevice;
