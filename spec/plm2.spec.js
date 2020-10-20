'use strict';
const {createPlm} = require('../lib/plm2'),
  {fixture} = require('./helpers/fixture.js'),
  {mockServer} = require('./helpers/mock-server.js');

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

describe('plm.createPlm', () => {
  /* eslint no-undefined: "off" */
  let server, baseUrl, host, port, username, password, authorization, plm, startTime;

  const logTime = message => {
    const elapsed = (new Date()).valueOf() - startTime;
    console.log(`${elapsed} ${message}`);
  };

  const deviceNames = {
    'im-hub': 'im-hub',
    //511234: 'hub controller',
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
    591234: 'dining outlet'
  };

  beforeAll(async () => {
    startTime = (new Date()).valueOf();
    server = mockServer([
      {
        path: '/0',
        name: 'allLinkCommand'
      },
      {
        path: '/1',
        name: 'hubCommand'
      },
      {
        path: '/2',
        name: 'sceneCommand'
      },
      {
        path: '/3',
        name: 'deviceControlCommand'
      },
      {
        path: '/sx.xml',
        name: 'deviceControlCommandSync'
      },
      {
        path: '/buffstatus.xml',
        name: 'bufferStatus'
      },
      {
        path: '/index.htm',
        name: 'hubInfo'
      },
      {
        path: '/Linkstatus.xml',
        name: 'linkStatus'
      },
      {
        path: '/rstatus.xml',
        name: 'rStatus'
      },
      {
        path: '/status.xml',
        name: 'status'
      },
      {
        path: '/statusD.xml',
        name: 'statusD'
      }
    ]);
    await server.start();
  });

  afterAll(() => server.stop());

  beforeEach(() => {
    baseUrl = process.env.SERVER_BASE_URL;
    host = process.env.SERVER_HOSTNAME;
    port = process.env.SERVER_PORT;
    username = 'username';
    password = 'password';
    authorization = 'Basic dXNlcm5hbWU6cGFzc3dvcmQ=';
    plm = createPlm({username, password, host, port});
    plm.startPolling(deviceNames);
  });

  afterEach(async () => {
    await plm.stopPolling();
  });

      // addCommandHandler (TODO: figure better way to implement)
      // readDeviceAllLinkDatabase   (TODO: figure better way to implement)
      // readHubAllLinkDatabase   (TODO: figure better way to implement)
      // removeCommandHandler  (TODO: figure better way to implement)
      // sendAllLinkCommand  (Base)
      // sendDeviceControlCommand  (Base)
      // sendInsteonCommandSync  (Base)
      // sendModemCommand  (TODO: figure better way to implement)
      // stop   (TODO: figure better way to implement)

  describe('plm.getHubStatus', () => {
    let hubStatus;
    beforeEach(async () => {
      server.hubInfo.mockReturnValue({
        headers: [{'content-type': 'text/html'}],
        body: await fixture('getHubInfo-response.html')
      });
      server.status.mockReturnValue({
        headers: [{'content-type': 'text/xml'}],
        body: await fixture('status-response.xml')
      });
      server.linkStatus.mockReturnValue({
        headers: [{'content-type': 'text/xml'}],
        body: await fixture('LinkStatus-response.xml')
      });
      server.statusD.mockReturnValue({
        headers: [{'content-type': 'text/xml'}],
        body: await fixture('statusD-response.xml')
      });

      hubStatus = plm.getHubStatus();
    });

    it('should return hub status', () =>
       expect(hubStatus).resolves.toEqual({
         binVersion: 'Hub2-V04-20140904',
         type: 'Hub2',
         hubVersion: '1019',
         firmwareBuildDate: 'Nov 18 2019  13:45:08',
         plmVersion: 'A5',
         deviceId: '010203',
         cls: 'Ready',
         clsg: '',
         clsi: '',
         cds: '9999999999999999',
         day: 'Sunday',
         time: '20:04:24'
       }));
  });

  describe('plm.setUsernamePassword', () => {
    let buffer;
    const username = 'newuser',
      password = 'newpassword';

    beforeEach(async () => {
      server.hubCommand.mockReturnValue({
        headers: [{'content-type': 'text/html'}],
        body: ''
      });
      buffer = await plm.setUsernamePassword(username, password);
    });

    it('should send the request', () =>
       expect(server.hubCommand).toBeCalledWith(
         expect.objectContaining({
           headers: expect.objectContaining({
             authorization,
             host: `${host}:${port}`
           }),
           path: '/1',
           query: {
             L: `${username}=1=${password}`
           }
         }))
      );
  });

  describe('get IM info', () => {
    let result;

    beforeEach(async () => {
      server.deviceControlCommand.mockReset();
      server.bufferStatus.mockReset();
      server.deviceControlCommand.mockImplementation(req => {
        server.bufferStatus.mockImplementation(() => {
          return {
            headers: [{'content-type': 'text/xml'}],
            body: '<response><BS>026049EA700333A50612</BS></response>\n'
          };
        });
        return {};
      });
      result = await plm.sendModemCommand({
        command: 'Get IM Info'
      });
    });

    it('should call deviceControlCommand', async () => {
      expect(server.deviceControlCommand).toHaveBeenCalledWith({
        body: {},
        headers: {
          'accept-encoding': 'gzip, deflate, br',
          authorization: 'Basic dXNlcm5hbWU6cGFzc3dvcmQ=',
          connection: 'close',
          host: `${host}:${port}`,
          'user-agent': 'got (https://github.com/sindresorhus/got)'
        },
        path: '/3',
        query: {
          '0260': 'I=3'
        }
      });
    });

    it('should return IM info', async () => {
      expect(result).toMatchObject({
        received: expect.any(String),
        bytes: '026049EA700333A506',
        code: '60',
        command: 'Get IM Info',
        length: 14
      });
    });
  });

  describe('get engine version', () => {
    let result;

    beforeEach(async () => {
      server.deviceControlCommand.mockReset();
      server.bufferStatus.mockReset();
      server.deviceControlCommand.mockImplementation(() => {
        server.bufferStatus.mockImplementation(() => {
          return {
            headers: [{'content-type': 'text/xml'}],
            body: '<response><BS>0250521234070809200D020618</BS></response>\n'
          };
        });
        return {};
      });
      result = await plm.sendModemCommand({
        command: 'Get INSTEON Engine Version',
        toAddress: '521234'
      });
    });

    it('should call deviceControlCommand', async () => {
      expect(server.deviceControlCommand).toHaveBeenCalledWith({
        body: {},
        headers: {
          'accept-encoding': 'gzip, deflate, br',
          authorization: 'Basic dXNlcm5hbWU6cGFzc3dvcmQ=',
          connection: 'close',
          host: `${host}:${port}`,
          'user-agent': 'got (https://github.com/sindresorhus/got)'
        },
        path: '/3',
        query: {
          '02625212340F0D00': 'I=3'
        }
      });
    });

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
        // insteonCommand: expect.objectContaining({
        //   engineVersion: 2
        // }),
        bytes: '0250521234070809200D02',
        fromDevice: 'porch outlets',
        toDevice: 'hub controller'
      });
    });
  });
});
