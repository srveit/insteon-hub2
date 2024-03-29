'use strict'

const { readFile } = require('fs/promises')
const path = require('path')
const URL = 'http://cache.insteon.com/pdf/INSTEON_DevCats_and_Product_Keys_20081008.pdf'
const CATEGORY_BOUNDARIES_FILE = path.join(__dirname, 'categoryBoundaries.json')

async function readJsonFile (filename) {
  const contents = await readFile(filename)
  return JSON.parse(contents.toString())
}

async function parseCategoriesTable (contents) {
  const PDFParser = (await import('pdf2json')).default

  return new Promise(function (resolve, reject) {
    const pdfParser = new PDFParser()

    pdfParser.on('pdfParser_dataError', errData => reject(errData.parserError))
    pdfParser.on('pdfParser_dataReady', pdfData => {
      resolve(pdfData.Pages.map(page => page.Texts.reduce(
        (rows, item) => {
          rows[item.y] = rows[item.y] || {}
          rows[item.y][item.x] = decodeURIComponent(item.R[0].T)
          return rows
        },
        {}
      )))
    })
    pdfParser.parseBuffer(contents)
  })
}

function extractDevices (rows) {
  let previousDevice
  return Object.entries(rows).reduce(
    (devices, [pageNumber, page]) => Object.entries(page).reduce(
      (devices, [y, columns]) => {
        const xs = Object.keys(columns).map(x => parseFloat(x)).sort((x1, x2) => x1 - x2)
        const values = Object.values(columns)

        if (xs[0] > 14 && values.length >= 3) {
          const description = values.slice(2).map(w => w.trim()).join(' ')
            .replace('Di mmer', 'Dimmer')
            .replace('Count-down', 'Countdown')
            .replace('Tr ansmitter', 'Transmitter')
            .replace(
              '2412N INSTEON Central Controller',
              'INSTEON Central Controller [2412N]'
            )
            .replace('c ontroller', 'controller')
            .replace('Doors’', 'Doors\'')
            .replace('INSTEO N', 'INSTEON')
          const device = {
            location: pageNumber * 100 + parseFloat(y),
            pageNumber,
            y: parseFloat(y),
            subcategoryId: values[0].trim().slice(-2),
            productKey: values[1].trim().slice(-6)
              .replace(/legacy/i, '000000'),
            description,
          }
          devices.push(device)
          previousDevice = device
        }
        if (values.length === 1 && xs[0] > 20 && previousDevice) {
          previousDevice.description += ' ' + values[0].trim()
        }
        return devices
      },
      devices
    ),
    []
  )
}

function extractCategories (rows) {
  return rows.reduce(
    (categories, page, pageNumber) => Object.entries(page).reduce(
      (categories, [y, columns]) => {
        const xs = Object.keys(columns).map(x => parseFloat(x)).sort((x1, x2) => x1 - x2)
        const values = Object.values(columns)

        if (values.length === 1 && xs[0] > 5.7 && xs[0] < 6) {
          categories.push({
            location: pageNumber * 100 + parseFloat(y),
            pageNumber,
            y: parseFloat(y),
            categoryId: values[0].trim().slice(-2),
          })
        }
        return categories
      },
      categories
    ),
    []
  )
}

function extractCategoryDescriptions (rows) {
  return Object.entries(rows).reduce(
    (categoryDescriptions, [pageNumber, page]) => Object.entries(page).reduce(
      (categoryDescriptions, [y, columns]) => {
        const xs = Object.keys(columns).map(x => parseFloat(x)).sort((x1, x2) => x1 - x2)
        const values = Object.values(columns)

        if (xs[0] > 8 && xs[0] < 9) {
          categoryDescriptions.push({
            location: pageNumber * 100 + parseFloat(y),
            pageNumber,
            y: parseFloat(y),
            values: values.map(v => v.trim()).join(' '),
          })
        }
        return categoryDescriptions
      },
      categoryDescriptions
    ),
    []
  ).sort((cd1, cd2) => {
    if (cd1.location === cd2.location) {
      return 0
    }
    if (cd1.location > cd2.location) {
      return 1
    }
    return -1
  })
}

function addCategoryBoundaries (categories, categoryBoundaries) {
  let i = 1
  return categories.reduce(
    (categories, { categoryId }) => {
      categories[categoryId] = {
        categoryId,
        subcategories: {},
        top: categoryBoundaries[i - 1][0] * 100 +
          categoryBoundaries[i - 1][1],
        bottom: categoryBoundaries[i][0] * 100 +
          categoryBoundaries[i][1],
      }
      i += 1
      return categories
    },
    {}
  )
}

function findCategory (categories, { pageNumber, y }) {
  const location = pageNumber * 100 + y
  return Object.values(categories).find(category => category.top < location &&
                         category.bottom >= location)
}

function addCategoryDescriptions (categories, categoryDescriptions) {
  for (const categoryDescription of categoryDescriptions) {
    const category = findCategory(categories, categoryDescription)
    if (!category.categoryName) {
      category.categoryName = categoryDescription.values
    } else {
      if (!category.examplesOfDevices) {
        category.examplesOfDevices = categoryDescription.values
      } else {
        category.examplesOfDevices = (
          category.examplesOfDevices + ' ' + categoryDescription.values
        )
          .replace('Plug- In', 'Plug-In')
          .replace('Time- lapse', 'Time-lapse')
      }
    }
  }
}

function addDevices (categories, devices) {
  for (const device of devices) {
    const [deviceDescription, modelNumber] =
      device.description.split(/ *\[/)
    const category = findCategory(categories, device)
    const subcategory = {
      categoryId: category.categoryId,
      subcategoryId: device.subcategoryId,
      productKey: device.productKey,
      deviceDescription,
    }
    if (modelNumber) {
      subcategory.modelNumber = modelNumber
        .replace(']', '')
        .replace('????', '')
        .replace('new smaller board', '')
    }
    category.subcategories[device.subcategoryId] = subcategory
  }
}

function removeTopBottom (categories) {
  for (const category of Object.values(categories)) {
    delete category.top
    delete category.bottom
  }
}

const getDevelopersGuide = async () => {
  const fetch = (await import('node-fetch')).default

  try {
    const response = await fetch(URL)
    return response.buffer()
  } catch (error) {
    console.warn(error)
    return undefined
  }
}

async function decodeDevelopersGuide (filename) {
  const categoryBoundaries =
    await readJsonFile(CATEGORY_BOUNDARIES_FILE)
  const contents = await getDevelopersGuide()
  const rows = await parseCategoriesTable(contents)
  const categories = extractCategories(rows)
  const categoryDescriptions = extractCategoryDescriptions(rows)
  const devices = extractDevices(rows)

  const categories1 = addCategoryBoundaries(categories, categoryBoundaries)
  addCategoryDescriptions(categories1, categoryDescriptions)
  addDevices(categories1, devices)
  removeTopBottom(categories1)
  return categories1
}

module.exports = decodeDevelopersGuide
