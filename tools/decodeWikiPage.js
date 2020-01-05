'use strict';

// https://insteon.atlassian.net/wiki/spaces/IKB/pages/13533225/Insteon+Device+Categories+and+Sub-Categories

const { parseStringPromise } = require('xml2js'),
  axios = require('axios'),
  util = require('util'),
  URL = 'https://insteon.atlassian.net/cgraphql?q=QueryPreloader_ContentBodyQuery',
  payload = {
    query: 'query ContentBodyQuery($contentId:ID$versionOverride:Int$embeddedContentRender:String){content(id:$contentId version:$versionOverride embeddedContentRender:$embeddedContentRender){nodes{id body{view{value}}}}}',
    variables: {
      contentId: '13533225',
      versionOverride: null,
      embeddedContentRender: null
    }
  },
  headers = {'content-type': 'application/json'};


const getData = async url => {
  try {
    const response = await axios.post(url, payload, {
      headers
    });
    const data = response.data;
    return data;
  } catch (error) {
    console.warn(error);
    return undefined;
  }
};

function cellValue(td) {
  if (typeof td === 'string') {
    return td.trim()
      .replace(')[beeper]', ') [with beeper]')
      .replace('HL(Dual Band)', 'HouseLinc (Dual Band)')
      .replace('HL (Dual Band)', 'HouseLinc (Dual Band)')
      .replace(
        'PowerLincModemSerial w/o EEPROM(w/o RF)',
        'PowerLinc Serial Modem w/o EEPROM (w/o RF)'
      )
      .replace('Count-down', 'Countdown')
      .replace('Developer\u2019s', 'Developer\'s')
      .replace('\u00a0 -', ' -')
      .replace('Dual-Band,50/60 Hz', 'Dual-Band, 50/60 Hz')
      .replace('w/ ', 'with ')
      .replace(/0x([0-9A-F][0-9A-F])/, '$1')
      .replace('I/OLinc', 'I/O Linc')
      .replace('2444A2xx4', '2444A2WH4')
      .replace('2444A3xx', '2444A3')
      .replace('2444A2xx8', '2444A2WH8')
      .replace('2466Dx', '2466DW')
      .replace('2466Sx', '2466SW')
      .replace('2491TxE', '2491T1E');
  }
  if (Array.isArray(td)) {
    return cellValue(td[0]);
  }
  if (td.p !== undefined) {
    return cellValue(td.p);
  }
  if (td.span !== undefined) {
    return cellValue(td.span);
  }
  if (td._ !== undefined) {
    return cellValue(td._);
  }
  return td;
}

const headerNames = {
  'Device Category': 'categoryId',
  'Device Sub-Category': 'subcategoryId',
  SKU: 'modelNumber',
  Name: 'deviceDescription'
};

async function decodeWikiPage() {
  const data = await getData(URL),
    htmlText = data.data.content.nodes[0].body.view.value,
    html = await parseStringPromise(`<div>${htmlText}</div>`),
    trs = html.div.div[0].table[0].tbody[0].tr,
    header = trs[0].th.map(e => e.p[0].trim()),
    deviceRows = trs.slice(1).map(tr => tr.td.map(cellValue));

  return deviceRows.reduce(
    (categories, deviceRow) => {
      const device = deviceRow.reduce(
        (device, value, i) => {
          device[headerNames[header[i]]] = value;
          return device;
        },
        {}
      );
      if (!categories[device.categoryId]) {
        categories[device.categoryId] = {
          categoryId: device.categoryId,
          subcategories: {}
        };
      }
      categories[device.categoryId].subcategories[device.subcategoryId] =
        device;
      return categories;
    },
    {}
  );
}
module.exports = decodeWikiPage;
