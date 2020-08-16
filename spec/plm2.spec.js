'use strict';
'use strict';
const {createPlm} = require('../lib/plm2'),
  {fixture} = require('./helpers/fixture.js'),
  {mockServer} = require('./helpers/mock-server.js');

describe('plm.createPlm', () => {
  /* eslint no-undefined: "off" */
  let server, baseUrl, host, port, username, password, authorization, plm;

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
    plm = createPlm({username, password, host, port, deviceNames});
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

      hubStatus = await plm.getHubStatus();
    });

    it('should return hub status', () =>
       expect(hubStatus).toEqual({
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
});
