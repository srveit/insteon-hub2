'use strict'

const EventEmitter = require('events')
const stream = require('stream')
const util = require('util')
const pipeline = util.promisify(stream.pipeline)
const { Writable } = stream
const { createPlmBase } = require('./plmBase')
const { createPlmStream } = require('./plmStream')
const { createPlmCommandQueue } = require('./plmCommandQueue')
const { createPlmCommandStream } = require('./plmCommandStream')
const { createCommandAnnotator } = require('./commandAnnotator')
const { encodeCommand, commandResponseMatcher } = require('./encodeCommand')

const createPlm = ({ username, password, host, port }) => {
  let plmStream, plmPipeline
  const plmBase = createPlmBase({ username, password, host, port })
  const emitter = new EventEmitter()

  const getHubInfo = () => plmBase.getHubInfo()

  const getHubStatus = () => plmBase.getHubStatus()

  const createEmitter = () => new Writable({
    objectMode: true,

    write (record, encoding, callback) {
      emitter.emit('command', record)
      callback(null)
    },
  })

  const sendDeviceControlCommand = buffer => {
    return plmBase.sendDeviceControlCommand(buffer)
  }

  const plmCommandQueue = createPlmCommandQueue(sendDeviceControlCommand)

  const startPolling = deviceNames => {
    plmStream = createPlmStream(plmBase)
    plmPipeline = pipeline(
      plmStream,
      createPlmCommandStream(),
      createCommandAnnotator(deviceNames),
      createEmitter()
    )
  }

  const stopPolling = async () => {
    if (plmStream) {
      plmStream.stopMonitoring()
      /* eslint no-undefined: "off" */
      plmStream = undefined
      return plmPipeline
    }
    return Promise.resolve(undefined)
  }

  const setUsernamePassword = (newUsername, newPassword) =>
    plmBase.setUsernamePassword(newUsername, newPassword)

  const sendModemCommand = modemCommand => {
    const buffer = encodeCommand(modemCommand)
    const matcher = commandResponseMatcher(modemCommand)
    return plmCommandQueue.addCommand(buffer, matcher)
  }

  const startLogging = () => plmStream && plmStream.startLogging()

  const stopLogging = () => plmStream && plmStream.stopLogging()

  emitter.on('command', plmCommandQueue.handleResponse)

  return Object.freeze({
    clearBuffer: plmBase.clearBuffer,
    emitter,
    getHubStatus,
    getHubInfo,
    startLogging,
    stopLogging,
    startPolling,
    stopPolling,
    sendDeviceControlCommand,
    sendModemCommand,
    setUsernamePassword,
  })
}

exports.createPlm = createPlm
