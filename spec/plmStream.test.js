'use strict'

const { createPlmBase } = require('../lib/plmBase')
const { createPlmStream } = require('../lib/plmStream')
const { mockServer } = require('./helpers/mock-server.js')

const waitForReadable = stream => new Promise(resolve => {
  stream.once('readable', resolve)
})

const waitForClose = stream => new Promise(resolve => {
  stream.once('close', resolve)
})

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

jest.setTimeout(10000) // 10 seconds

describe('createPlmStream', () => {
  /* eslint no-undefined: "off" */
  let server, host, port, username, password, plmBase,
    plmStream

  beforeAll(async () => {
    server = mockServer([
      {
        path: '/buffstatus.xml',
        name: 'bufferStatus',
      },
    ])
    await server.start()
  })

  afterAll(() => server.stop())

  beforeEach(async () => {
    host = server.env().SERVER_HOSTNAME
    port = server.env().SERVER_PORT
    username = 'username'
    password = 'password'
    plmBase = createPlmBase({ username, password, host, port })
    plmStream = createPlmStream(plmBase)
  })

  afterEach(async () => {
    plmStream.stopMonitoring()
    await waitForClose(plmStream)
  })

  describe('when logging', () => {
    let segment

    beforeEach(async () => {
      plmStream.startLogging()
      server.bufferStatus.mockReturnValueOnce({
        headers: { 'content-type': 'text/xml' },
        body: '<response><BS>AAAAAA06</BS></response>',
      })

      await waitForReadable(plmStream)
      segment = plmStream.read()
    })

    it('should return a segment', () => {
      expect(segment).toEqual('AAAAAA')
    })

    describe('and read a second time', () => {
      let segment2

      beforeEach(async () => {
        server.bufferStatus.mockReturnValueOnce({
          headers: { 'content-type': 'text/xml' },
          body: '<response><BS>BBBBAA04</BS></response>',
        })
        await waitForReadable(plmStream)
        segment2 = plmStream.read()
      })

      it('should return second segment', () => {
        expect(segment2).toBe('BBBB')
      })

      describe('and an error occurs', () => {
        beforeEach(async () => {
          server.bufferStatus.mockReturnValueOnce({
            error: 'test error',
          })
          await sleep(200)
        })

        describe('and stopLogging', () => {
          let log
          beforeEach(() => {
            log = plmStream.stopLogging()
          })

          it('should return a log', () => {
            expect(log).toEqual([
              expect.objectContaining({
                buffer: 'AAAAAA06',
                chunk: 'AAAAAA',
                timestamp: expect.any(Date),
              }),
              expect.objectContaining({
                buffer: 'BBBBAA04',
                chunk: 'BBBB',
                timestamp: expect.any(Date),
              }),
              expect.objectContaining({
                error: expect.any(Error),
                timestamp: expect.any(Date),
              }),
            ])
          })
        })
      })
    })
  })

  describe('when reading', () => {
    let segment

    beforeEach(async () => {
      server.bufferStatus.mockReturnValueOnce({
        headers: { 'content-type': 'text/xml' },
        body: '<response><BS>AAAAAA06</BS></response>',
      })
      await waitForReadable(plmStream)
      segment = plmStream.read()
    })

    it('should return a segment', () => {
      expect(segment).toEqual('AAAAAA')
    })

    describe('and read a second time', () => {
      beforeEach(async () => {
        segment = plmStream.read()
      })

      it('should not return a segment', () => {
        expect(segment).toBe(null)
      })
    })

    describe('and an error occurs and a successful read occurs', () => {
      beforeEach(async () => {
        server.bufferStatus.mockReturnValueOnce({
          error: 'test error',
        })
        server.bufferStatus.mockReturnValueOnce({
          headers: { 'content-type': 'text/xml' },
          body: '<response><BS>CCCCCC06</BS></response>',
        })
        await waitForReadable(plmStream)
        segment = plmStream.read()
      })

      it('should work', () => {
        expect(segment).toBe('CCCCCC')
      })
    })

    describe('and stopMonitoring', () => {
      beforeEach(async () => {
        await plmStream.stopMonitoring()
      })

      it('should stop reading', () => {
        expect(plmStream.readable).toBe(false)
      })
    })
  })
})
