'use strict'

// NOTE: The following URL is no longer accessible. The contents
// was retrieved Sep 29, 2015 and recorded on this forum page:
// https://forum.universal-devices.com/topic/17006-new-insteon-products/

// https://insteon.atlassian.net/wiki/spaces/IKB/pages/13533225/Insteon+Device+Categories+and+Sub-Categories

const { parseStringPromise } = require('xml2js')
const URL =
  'https://insteon.atlassian.net/cgraphql?q=QueryPreloader_ContentBodyQuery'
const payload = {
  query:
    'query ContentBodyQuery($contentId:ID$versionOverride:Int$embeddedContentRender:String){content(id:$contentId version:$versionOverride embeddedContentRender:$embeddedContentRender){nodes{id body{view{value}}}}}',
  variables: {
    contentId: '13533225',
    versionOverride: null,
    embeddedContentRender: null,
  },
}
const headers = { 'content-type': 'application/json' }

const getData = async (url) => {
  const fetch = (await import('node-fetch')).default
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers,
    })
    const data = await response.json()
    return data
  } catch (error) {
    console.warn(error)
    return undefined
  }
}

const cellValue = (td) => {
  if (typeof td === 'string') {
    return td
      .trim()
      .replace(')[beeper]', ') [with beeper]')
      .replace('HL(Dual Band)', 'HouseLinc (Dual Band)')
      .replace('HL (Dual Band)', 'HouseLinc (Dual Band)')
      .replace(
        'PowerLincModemSerial w/o EEPROM(w/o RF)',
        'PowerLinc Serial Modem w/o EEPROM (w/o RF)'
      )
      .replace('Count-down', 'Countdown')
      .replace('Developer\u2019s', "Developer's")
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
      .replace('2491TxE', '2491T1E')
  }
  if (Array.isArray(td)) {
    return cellValue(td[0])
  }
  if (td.p !== undefined) {
    return cellValue(td.p)
  }
  if (td.span !== undefined) {
    return cellValue(td.span)
  }
  if (td._ !== undefined) {
    return cellValue(td._)
  }
  return td
}

const headerNames = {
  'Device Category': 'categoryId',
  'Device Sub-Category': 'subcategoryId',
  SKU: 'modelNumber',
  Name: 'deviceDescription',
}

const decodeWikiPage = async () => {
  const data = await getData(URL)
  const htmlText = data.data.content.nodes[0].body.view.value
  const html = await parseStringPromise(`<div>${htmlText}</div>`)
  const trs = html.div.div[0].table[0].tbody[0].tr
  const header = trs[0].th.map((e) => e.p[0].trim())
  const deviceRows = trs.slice(1).map((tr) => tr.td.map(cellValue))

  return deviceRows.reduce((categories, deviceRow) => {
    const device = deviceRow.reduce((device, value, i) => {
      device[headerNames[header[i]]] = value
      return device
    }, {})
    if (!categories[device.categoryId]) {
      categories[device.categoryId] = {
        categoryId: device.categoryId,
        subcategories: {},
      }
    }
    categories[device.categoryId].subcategories[device.subcategoryId] = device
    return categories
  }, {})
}
module.exports = decodeWikiPage
