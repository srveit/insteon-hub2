'use strict'

const { Readable } = require('stream')
const { createPlmBufferProcessor } = require('./plmBufferProcessor')
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

const createPlmStream = (plmBase, pollingInterval = 50) => {
  let log = []
  let monitoring
  /* eslint prefer-const: "off" */
  let monitor
  let logging = false

  const plmBufferProcessor = createPlmBufferProcessor()

  const getAndProcessBuffer = async () => {
    try {
      const buffer = await plmBase.getBuffer()

      if (buffer !== null) {
        const chunk = plmBufferProcessor.processPlmBuffer(buffer)

        if (logging) {
          log.push({ buffer, chunk, timestamp: new Date() })
        }

        if (chunk) {
          readable.push(chunk)
        }
      }
    } catch (error) {
      if (logging) {
        log.push({ error, timestamp: new Date() })
      }
    }
  }

  const monitorHubStatus = async () => {
    monitoring = true
    // eslint-disable-next-line no-unmodified-loop-condition
    while (monitoring) {
      getAndProcessBuffer()
      await sleep(pollingInterval)
    }
  }

  const read = () => { }

  const destroy = (err, callback) => {
    monitoring = false
    monitor.then(() => callback(err))
  }

  const readable = new Readable({
    read,
    destroy,
    encoding: 'utf8',
  })

  readable.startLogging = () => {
    logging = true
  }

  readable.stopLogging = () => {
    logging = false
    const logSnapshot = log
    log = []
    return logSnapshot
  }

  readable.stopMonitoring = () => {
    monitoring = false
    readable.resume()
    readable.push(null)
    return monitor
  }

  monitor = monitorHubStatus()

  return readable
}

exports.createPlmStream = createPlmStream
