'use strict';
const createDeviceManager = ({deviceNames}) => {
  const devices = Object.entries(deviceNames).reduce(
    (devices, [id, name]) => {
      devices[id] = {name};
      return devices;
    },
    {}
  );

  return Object.freeze({
    devices
  });
};

exports.createDeviceManager = createDeviceManager;
