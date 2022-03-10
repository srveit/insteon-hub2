'use strict'

// A queue for sending queus and handling responses one at a time

const createPlmCommandQueue = (sendCommandBuffer) => {
  /* eslint no-use-before-define: "off" */
  let currentEntry

  const queue = []

  const addCommand = (
    commandBuffer,
    responseMatcher,
    { maxNumberRetries, delay } = { maxNumberRetries: 3, delay: 1 }
  ) => new Promise((resolve, reject) => {
    queue.push({
      commandBuffer,
      responseMatcher,
      resolve,
      reject,
      maxNumberRetries,
      delay,
      retries: 0,
    })
    processQueue()
  })

  const sendWithTimeout = entry => {
    entry.timerId =
        setTimeout(() => handleTimeout(entry), entry.delay * 1000)
    sendCommandBuffer(entry.commandBuffer)
  }

  const processQueue = () => {
    if (!currentEntry) {
      currentEntry = queue.shift()
      if (currentEntry) {
        sendWithTimeout(currentEntry)
      }
    }
  }

  const handleTimeout = entry => {
    /* eslint no-undefined: "off" */
    entry.timerId = undefined
    if (entry.retries >= entry.maxNumberRetries) {
      currentEntry = undefined
      entry.reject({ message: 'response not received' })
      processQueue()
    } else {
      entry.retries = entry.retries + 1
      sendWithTimeout(entry)
    }
  }

  const handleResponse = response => {
    /* eslint no-undefined: "off" */
    if (currentEntry && currentEntry.responseMatcher(response)) {
      const entry = currentEntry
      clearTimeout(entry.timerId)
      entry.timerId = undefined
      currentEntry = undefined
      entry.resolve(response)
      processQueue()
    }
  }

  return Object.freeze({
    addCommand,
    handleResponse,
    queueLength: () => queue.length,
  })
}

exports.createPlmCommandQueue = createPlmCommandQueue
