'use strict'
const { JsxEmit } = require('typescript')
const { createPlm } = require('../lib/plm')
const { fixture } = require('./helpers/fixture.js')
const { mockServer } = require('./helpers/mock-server.js')

describe('plm.createPlm', () => {
  /* eslint no-undefined: "off" */
  let server, host, port, username, password, authorization, userAgent, plm

  const deviceNames = {
    'im-hub': 'im-hub',
    '070809': 'hub controller',
    '010203': 'device1',
    '040506': 'device2',

    521234: 'porch outlets',
    531234: 'Garage lights',
    541234: 'foyer lamps switch',
    551234: 'foyer chandelier switch',
    561234: 'front lights',
    571234: 'foyer chandelier',
    581234: 'foyer lamps',
    591234: 'dining outlet',
  }

  beforeAll(async () => {
    server = mockServer([
      {
        path: '/0',
        name: 'allLinkCommand',
      },
      {
        path: '/1',
        name: 'hubCommand',
      },
      {
        path: '/2',
        name: 'sceneCommand',
      },
      {
        path: '/3',
        name: 'deviceControlCommand',
      },
      {
        path: '/sx.xml',
        name: 'deviceControlCommandSync',
      },
      {
        path: '/buffstatus.xml',
        name: 'bufferStatus',
      },
      {
        path: '/index.htm',
        name: 'hubInfo',
      },
      {
        path: '/Linkstatus.xml',
        name: 'linkStatus',
      },
      {
        path: '/rstatus.xml',
        name: 'rStatus',
      },
      {
        path: '/status.xml',
        name: 'status',
      },
      {
        path: '/statusD.xml',
        name: 'statusD',
      },
    ])
    await server.start()
  })

  afterAll(() => server.stop())

  beforeEach(() => {
    host = server.env().SERVER_HOSTNAME
    port = server.env().SERVER_PORT
    username = 'username'
    password = 'password'
    authorization = 'Basic dXNlcm5hbWU6cGFzc3dvcmQ='
    userAgent = 'got (https://github.com/sindresorhus/got)'
    plm = createPlm({ username, password, host, port })
    plm.startPolling(deviceNames)
  })

  afterEach(async () => {
    await plm.stopPolling()
  })

  describe('plm.getHubInfo', () => {
    let hubInfo

    beforeEach(async () => {
      const response = await fixture('getHubInfo-response.html')
      server.hubInfo.mockReturnValue({
        headers: [{ 'content-type': 'text/html' }],
        body: response,
      })
      hubInfo = await plm.getHubInfo()
    })

    afterEach(() => {
      server.hubInfo.mockClear()
    })

    it('should send the request', () =>
      expect(server.hubInfo).toBeCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            authorization,
            host: `${host}:${port}`,
          }),
          path: '/index.htm',
        }))
    )

    it('should return the Hub Info', () => {
      expect(hubInfo).toEqual({
        binVersion: 'Hub2-V04-20140904',
        type: 'Hub2',
        hubVersion: '1019',
        firmwareBuildDate: 'Nov 18 2019  13:45:08',
        firmware: 'A5',
        imId: '010203',
      })
    })
  })

  describe('plm.getHubStatus', () => {
    let hubStatus
    beforeEach(async () => {
      server.hubInfo.mockReturnValue({
        headers: [{ 'content-type': 'text/html' }],
        body: await fixture('getHubInfo-response.html'),
      })
      server.status.mockReturnValue({
        headers: [{ 'content-type': 'text/xml' }],
        body: await fixture('status-response.xml'),
      })
      server.linkStatus.mockReturnValue({
        headers: [{ 'content-type': 'text/xml' }],
        body: await fixture('LinkStatus-response.xml'),
      })
      server.statusD.mockReturnValue({
        headers: [{ 'content-type': 'text/xml' }],
        body: await fixture('statusD-response.xml'),
      })

      hubStatus = plm.getHubStatus()
    })

    it('should return hub status', () =>
      expect(hubStatus).resolves.toEqual({
        cls: 'Ready',
        clsg: '',
        clsi: '',
        cds: '9999999999999999',
        day: 'Sunday',
        time: '20:04:24',
      }))
  })

  describe('plm.setUsernamePassword', () => {
    beforeEach(async () => {
      username = 'newuser'
      password = 'newpassword'
      server.hubCommand.mockReturnValue({
        headers: [{ 'content-type': 'text/html' }],
        body: '',
      })
      await plm.setUsernamePassword(username, password)
    })

    it('should send the request', () =>
      expect(server.hubCommand).toBeCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            authorization,
            host: `${host}:${port}`,
          }),
          path: '/1',
          query: {
            L: `${username}=1=${password}`,
          },
        }))
    )
  })

  describe('get IM info', () => {
    let result, log

    beforeEach(async () => {
      server.deviceControlCommand.mockReset()
      server.bufferStatus.mockReset()
      server.deviceControlCommand.mockImplementation(() => {
        server.bufferStatus.mockImplementation(() => {
          return {
            headers: [{ 'content-type': 'text/xml' }],
            body: '<response><BS>026049EA700333A50612</BS></response>\n',
          }
        })
        return {}
      })
      plm.startLogging()
      result = await plm.sendModemCommand({
        command: 'Get IM Info',
      })
      log = plm.stopLogging()
    })

    it('should call deviceControlCommand', async () => {
      expect(server.deviceControlCommand).toHaveBeenCalledWith({
        body: {},
        headers: {
          'accept-encoding': 'gzip, deflate, br',
          authorization,
          connection: expect.any(String),
          host: `${host}:${port}`,
          'user-agent': userAgent,
        },
        path: '/3',
        query: {
          '0260': 'I=3',
        },
      })
    })

    it('should return IM info', async () => {
      expect(result).toMatchObject({
        received: expect.any(String),
        bytes: '026049EA700333A506',
        code: '60',
        command: 'Get IM Info',
        length: 14,
      })
    })

    it('should return the plmStream log', () => {
      expect(log).toEqual([
        expect.objectContaining({
          buffer: '026049EA700333A50612',
          chunk: '026049EA700333A506',
          timestamp: expect.any(Date),
        }),
      ])
    })
  })

  describe('get engine version', () => {
    let result

    beforeEach(async () => {
      server.deviceControlCommand.mockReset()
      server.bufferStatus.mockReset()
      server.deviceControlCommand.mockImplementation(() => {
        server.bufferStatus.mockImplementation(() => {
          return {
            headers: [{ 'content-type': 'text/xml' }],
            body: '<response><BS>02625212340F0D00060250521234070809200D02062A</BS></response>\n',
          }
        })
        return {}
      })
      result = await plm.sendModemCommand({
        command: 'Get INSTEON Engine Version',
        toAddress: '521234',
      })
    })

    it('should call deviceControlCommand', async () => {
      expect(server.deviceControlCommand).toHaveBeenCalledWith({
        body: {},
        headers: {
          'accept-encoding': 'gzip, deflate, br',
          authorization,
          connection: expect.any(String),
          host: `${host}:${port}`,
          'user-agent': userAgent,
        },
        path: '/3',
        query: {
          '02625212340F0D00': 'I=3',
        },
      })
    })

    it('should return engine version', () => {
      expect(result).toMatchObject({
        received: expect.any(String),
        command: 'INSTEON Standard Message Received',
        code: '50',
        length: 18,
        fromAddress: '521234',
        toAddress: '070809',
        messageType: 'directAck',
        allLink: false,
        acknowledgement: true,
        extendedMessage: false,
        hopsLeft: 0,
        maxHops: 0,
        command1: '0D',
        command2: '02',
        insteonCommand: expect.objectContaining({
          engineVersion: '02',
        }),
        bytes: '0250521234070809200D02',
        fromDevice: 'porch outlets',
        toDevice: 'hub controller',
      })
    })
  })

  describe('Get First ALL-Link Record', () => {
    let result

    beforeEach(async () => {
      server.deviceControlCommand.mockReset()
      server.bufferStatus.mockReset()
      server.deviceControlCommand.mockImplementation(() => {
        server.bufferStatus.mockImplementation(() => {
          return {
            headers: [{ 'content-type': 'text/xml' }],
            body: '<response><BS>0269060257EA005212340139441A</BS></response>\n',
          }
        })
        return {}
      })
      result = await plm.sendModemCommand({
        command: 'Get First ALL-Link Record',
      })
    })

    it('should return first record', () => {
      expect(result).toMatchObject({
        received: expect.any(String),
        command: 'ALL-Link Record Response',
        code: '57',
        length: 16,
        inUse: true,
        isController: true,
        hasBeenUsed: true,
        bit2: false,
        bit3: true,
        bit4: false,
        bit5: true,
        groupNumber: 0,
        id: '521234',
        device: 'porch outlets',
        deviceCategory: '01',
        deviceSubcategory: '39',
        firmware: '44',
        numberRetries: 1,
        controllerGroupNumber: 68,
        data: '013944',
        bytes: '0257EA00521234013944',
      })
    })
  })

  describe('Get Next ALL-Link Record', () => {
    let result

    beforeEach(async () => {
      server.deviceControlCommand.mockReset()
      server.bufferStatus.mockReset()
      server.deviceControlCommand.mockImplementation(() => {
        server.bufferStatus.mockImplementation(() => {
          return {
            headers: [{ 'content-type': 'text/xml' }],
            body: '<response><BS>026A060257E2005612340120451A</BS></response>\n',
          }
        })
        return {}
      })
      result = await plm.sendModemCommand({
        command: 'Get Next ALL-Link Record',
      })
    })

    it('should return next record', () => {
      expect(result).toMatchObject({
        received: expect.any(String),
        command: 'ALL-Link Record Response',
        code: '57',
        length: 16,
        inUse: true,
        isController: true,
        hasBeenUsed: true,
        bit2: false,
        bit3: false,
        bit4: false,
        bit5: true,
        groupNumber: 0,
        id: '561234',
        device: 'front lights',
        deviceCategory: '01',
        deviceSubcategory: '20',
        firmware: '45',
        numberRetries: 1,
        controllerGroupNumber: 69,
        data: '012045',
        bytes: '0257E200561234012045',
      })
    })
  })

  describe('Get ALL-Link Record for Sender', () => {
    let result

    beforeEach(async () => {
      server.deviceControlCommand.mockReset()
      server.bufferStatus.mockReset()
      server.deviceControlCommand.mockImplementation(() => {
        server.bufferStatus.mockImplementation(() => {
          return {
            headers: [{ 'content-type': 'text/xml' }],
            body: '<response><BS>026C060257E2005912340120451A</BS></response>\n',
          }
        })
        return {}
      })
      result = await plm.sendModemCommand({
        command: 'Get ALL-Link Record for Sender',
      })
    })

    it('should return first record', () => {
      expect(result).toMatchObject({
        received: expect.any(String),
        command: 'ALL-Link Record Response',
        code: '57',
        length: 16,
        inUse: true,
        isController: true,
        hasBeenUsed: true,
        bit2: false,
        bit3: false,
        bit4: false,
        bit5: true,
        groupNumber: 0,
        id: '591234',
        deviceCategory: '01',
        deviceSubcategory: '20',
        firmware: '45',
        numberRetries: 1,
        controllerGroupNumber: 69,
        data: '012045',
        bytes: '0257E200591234012045',
        device: 'dining outlet',
      })
    })
  })

  describe('Set IM Configuration', () => {
    let result

    beforeEach(async () => {
      server.deviceControlCommand.mockReset()
      server.bufferStatus.mockReset()
      server.deviceControlCommand.mockImplementation(() => {
        server.bufferStatus.mockImplementation(() => {
          return {
            headers: [{ 'content-type': 'text/xml' }],
            body: '<response><BS>026A06026B43060E</BS></response>\n',
          }
        })
        return {}
      })
      result = await plm.sendModemCommand({
        command: 'Set IM Configuration',
        imConfigurationFlags: {
          disableAutomaticLinking: false,
          monitorMode: true,
          disableAutomaticLed: false,
          disableHostComunications: false,
          reserved: 3,
        },
      })
    })

    it('should return the response', () => {
      expect(result).toMatchObject({
        received: expect.any(String),
        command: 'Set IM Configuration',
        code: '6B',
        length: 4,
        imConfigurationFlags: {
          disableAutomaticLinking: false,
          monitorMode: true,
          disableAutomaticLed: false,
          disableHostComunications: false,
          bit4: false,
          bit3: false,
          bit2: true,
          bit1: true,
        },
        ack: true,
        bytes: '026B4306',
      })
    })
  })

  describe('Read 8 bytes from Database', () => {
    let result

    beforeEach(async () => {
      server.deviceControlCommand.mockReset()
      server.bufferStatus.mockReset()
      server.deviceControlCommand.mockImplementation(() => {
        server.bufferStatus.mockImplementation(() => {
          return {
            headers: [{ 'content-type': 'text/xml' }],
            body: '<response><BS>027500000602590000500357123401000022</BS></response>\n',
          }
        })
        return {}
      })
      result = await plm.sendModemCommand({
        command: 'Read 8 bytes from Database',
        address: '0000',
      })
    })

    it('should return the response', () => {
      expect(result).toMatchObject({
        received: expect.any(String),
        command: 'Database Record Found',
        code: '59',
        length: 20,
        address: '0000',
        inUse: false,
        isController: true,
        hasBeenUsed: false,
        bit2: false,
        bit3: false,
        bit4: true,
        bit5: false,
        groupNumber: 3,
        id: '571234',
        device: 'foyer chandelier',
        bytes: '025900005003571234010000',
      })
    })
  })

  describe('stopPolling', () => {
    let result

    beforeEach(async () => {
      result = await plm.stopPolling()
    })

    it('should stop polling', () => {
      expect(result).toBe(undefined)
    })

    describe('and stopPolling is called a second time', () => {
      beforeEach(async () => {
        result = await plm.stopPolling()
      })

      it('should stop polling', () => {
        /* eslint no-undefined: "off" */
        expect(result).toBe(undefined)
      })
    })
  })
})
