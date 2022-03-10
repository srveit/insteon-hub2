'use strict'
const ALL_LINK_TYPES = {
  '00': 'IM is Responder',
  '01': 'IM is Controller',
  '03': 'IM is either',
  FF: 'Link Deleted',
}
const ALL_LINK_CODES = Object.entries(ALL_LINK_TYPES).reduce(
  (allLinkCodes, [allLinkCode, allLinkType]) => {
    allLinkCodes[allLinkType] = allLinkCode
    return allLinkCodes
  },
  {}
)
const ALL_LINK_CONTROL_NAMES = {
  '00': 'Find First',
  '01': 'Find Next',
  20: 'Modify First Found or Add',
  40: 'Modify First Controller Found or Add',
  41: 'Modify First Responder Found or Add',
  80: 'Delete First Found',
}
const ALL_LINK_CONTROL_CODES = Object.entries(ALL_LINK_CONTROL_NAMES).reduce(
  (allLinkControlCodes, [code, name]) => {
    allLinkControlCodes[name] = code
    return allLinkControlCodes
  },
  {}
)
const BUTTON_EVENTS = {
  2: 'Tapped',
  3: 'Press and Hold',
  4: 'released',
}
const INSTEON_MESSAGE_TYPES = [
  'direct',
  'directAck',
  'allLinkCleanup',
  'allLinkCleanupAck',
  'broadcast',
  'directNak',
  'allLinkBroadcast',
  'allLinkCleanupNak',
]
const NAK_ERRORS = {
  '00': 'Reserved',
  FB: 'Illegal value in command',
  FC: 'Pre NAK in case database search takes too long',
  FD: 'Unknown INSTEON command',
  FE: 'No load detected',
  FF: 'Not in ALL-Link Group',
}
const OPERATING_FLAGS = {
  'Program Lock On': '00',
  'Program Lock Off': '01',
  'LED On during TX': '02',
  'LED Off during TX': '03',
  'Resume Dim On': '04',
  'Beeper On': '04',
  'Resume Dim Off': '05',
  'Beeper Off': '05',
  'Load Sense On': '06',
  'Stay Awake On': '06',
  '8-Key KeypadLinc': '06',
  'Load Sense Off': '07',
  'Stay Awake Off': '07',
  '6-Key KeypadLinc': '07',
  'Listen Only On': '08',
  'LED Backlight Off': '08',
  'LED Off': '08',
  'Listen Only Off': '09',
  'LED Backlight On': '09',
  'LED On': '09',
  'No I\'m Alive On': '0A',
  'Key Beep On': '0A',
  'No I\'m Alive Off': '0B',
  'Key Beep Off': '0B',
}
const OUTLET_NAMES = {
  '01': 'top',
  '02': 'bottom',
}
const OUTLET_CODES = Object.entries(OUTLET_NAMES).reduce(
  (outletCodes, [code, name]) => {
    outletCodes[name] = code
    return outletCodes
  },
  {}
)
const X10_COMMANDS = [
  'All Units Off',
  'All Lights On',
  'On',
  'Off',
  'Dim',
  'Bright',
  'All Lights Off',
  'Extended Code',
  'Hail Request',
  'Hail Acknowledge',
  'Preset Dim',
  'Preset Dim',
  'Extended Data (analog)',
  'Status = On',
  'Status = Off',
  'Status Request',
]
const X10_HOUSE_CODES = [
  'M',
  'E',
  'C',
  'K',
  'O',
  'G',
  'A',
  'I',
  'N',
  'F',
  'D',
  'L',
  'P',
  'H',
  'B',
  'J',
]
const X10_UNIT_CODES = [
  13,
  5,
  3,
  11,
  15,
  7,
  1,
  9,
  14,
  6,
  4,
  12,
  16,
  8,
  2,
  10,
]

module.exports = {
  ALL_LINK_CODES,
  ALL_LINK_CONTROL_CODES,
  ALL_LINK_CONTROL_NAMES,
  ALL_LINK_TYPES,
  BUTTON_EVENTS,
  INSTEON_MESSAGE_TYPES,
  NAK_ERRORS,
  OPERATING_FLAGS,
  OUTLET_CODES,
  OUTLET_NAMES,
  X10_COMMANDS,
  X10_HOUSE_CODES,
  X10_UNIT_CODES,
}
