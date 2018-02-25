'use strict';
const { OUTLET_NAMES } = require('./constants'),
  parsers = {},

  toHex = (value = 0, length = 2) => value.toString(16)
        .padStart(length, '0').toUpperCase().substr(0, length),

  addParsers = (command1, parser) => {
    for (let i = 0; i < 256; i++) {
      parsers['11' + toHex(i)] = response => {
        return {
          command: 'Light ON',
          onLevel: i
        };
      };
    }
  };

addParsers('01', response => {
  return {
    command: 'Assign to ALL-Link Group',
    groupNumber: parseInt(response.command2, 16)
  };
});

addParsers('02', response => {
  return {
    command: 'Delete from ALL-Link Group',
    groupNumber: parseInt(response.command2, 16)
  };
});

parsers['0300'] = response => {
  return {
    command: 'Product Data Request'
  };
};

parsers['0301'] = response => {
  return {
    command: 'FX Username Request'
  };
};

parsers['0302'] = response => {
  return {
    command: 'Device Text String Request'
  };
};

addParsers('09', response => {
  return {
    command: 'Enter Linking Mode',
    groupNumber: parseInt(response.command2, 16)
  };
});

addParsers('0A', response => {
  return {
    command: 'Enter Unlinking Mode',
    groupNumber: parseInt(response.command2, 16)
  };
});

addParsers('0F', response => {
  return {
    command: 'Ping'
  };
});

addParsers('10', response => {
  return {
    command: 'ID Request'
  };
});

addParsers('11', response => {
  return {
    command: 'Light ON',
    onLevel: parseInt(response.command2, 16)
  };
});

addParsers('12', response => {
  return {
    command: 'Light ON Fast',
    onLevel: parseInt(response.command2, 16)
  };
});

addParsers('13', response => {
  return {
    command: 'Light OFF'
  };
});

addParsers('14', response => {
  return {
    command: 'Light OFF Fast'
  };
});

addParsers('15', response => {
  return {
    command: 'Light Brighten One Step'
  };
});

addParsers('16', response => {
  return {
    command: 'Light Dim One Step'
  };
});

parsers['1900'] = response => {
  return {
    command: 'Light Status Request'
  };
};

parsers['1901'] = response => {
  return {
    command: 'Outlet Status Request'
  };
};

const decodeRampRate = byte => 2 * parseInt(byte, 16) + 1;
const decodeOnLevel = byte => parseInt(byte, 16) * 16 + 0x0F;

addParsers('2E', response => {
  return {
    command: 'Light ON at Ramp Rate',
    onLevel: decodeOnLevel(response.command2.substr(0, 1)),
    rampRate: decodeRampRate(response.command2.substr(1, 1))
  };
});

parsers['3201'] = response => {
  return {
    command: `Outlet ON (${OUTLET_NAMES['01']})`
  };
};

parsers['3202'] = response => {
  return {
    command: `Outlet ON (${OUTLET_NAMES['02']})`
  };
};

parsers['3301'] = response => {
  return {
    command: `Outlet OFF (${OUTLET_NAMES['01']})`
  };
};

parsers['3302'] = response => {
  return {
    command: `Outlet OFF (${OUTLET_NAMES['02']})`
  };
};

module.exports = parsers;
