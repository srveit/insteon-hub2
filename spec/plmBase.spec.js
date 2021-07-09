'use strict';
const {createPlmBase} = require('../lib/plmBase'),
  {fixture} = require('./helpers/fixture.js'),
  {mockServer} = require('./helpers/mock-server.js');

describe('plm.createPlmBase', () => {
  /* eslint no-undefined: "off" */
  let server, host, port, username, password, authorization, plmBase;

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
    host = server.env().SERVER_HOSTNAME;
    port = server.env().SERVER_PORT;
    username = 'username';
    password = 'password';
    authorization = 'Basic dXNlcm5hbWU6cGFzc3dvcmQ=';
    plmBase = createPlmBase({username, password, host, port});
  });

  describe('plmBase.sendAllLinkCommand', () => {
    beforeEach(async () => {
      server.allLinkCommand.mockReturnValue({
        headers: [{'content-type': 'text/html'}],
        body: ''
      });
      await plmBase.sendAllLinkCommand('18');
    });

    it('should send the request', () =>
      expect(server.allLinkCommand).toBeCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            authorization: authorization,
            host: `${host}:${port}`
          }),
          path: '/0',
          query: {
            1800: 'I=0'
          }
        }))
    );
  });

  describe('plmBase.sendDeviceControlCommand', () => {
    const command = '02620102030F117F';

    beforeEach(async () => {
      server.deviceControlCommand.mockReturnValue({
        headers: [{'content-type': 'text/html'}],
        body: ''
      });
      await plmBase.sendDeviceControlCommand(command);
    });

    it('should send the request', () =>
      expect(server.deviceControlCommand).toBeCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            authorization,
            host: `${host}:${port}`
          }),
          path: '/3',
          query: {
            '02620102030F117F': 'I=3'
          }
        }))
    );
  });

  describe('plmBase.sendInsteonCommandSync', () => {
    let result;
    const deviceId = '010203',
      command = '1900';

    beforeEach(async () => {
      const response = await fixture('sendInsteonCommandSync-response.xml');
      server.deviceControlCommandSync.mockReturnValue({
        headers: [{'content-type': 'text/xml'}],
        body: response
      });
      result = await plmBase.sendInsteonCommandSync(deviceId, command);
    });

    it('should send the request', () =>
      expect(server.deviceControlCommandSync).toBeCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            authorization,
            host: `${host}:${port}`
          }),
          path: '/sx.xml',
          query: {
            '010203': '1900'
          }
        }))
    );

    it('should return the command response', () => {
      expect(result).toEqual({
        X: '0102032100FF'
      });
    });
  });

  describe('plmBase.clearBuffer', () => {
    beforeEach(async () => {
      server.hubCommand.mockReturnValue({
        headers: [{'content-type': 'text/html'}],
        body: ''
      });
      await plmBase.clearBuffer();
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
            XB: 'M=1'
          }
        }))
    );
  });

  describe('plmBase.getBuffer', () => {
    let buffer;

    beforeEach(async () => {
      const result = await fixture('buffstatus-reponse.xml');
      server.bufferStatus.mockReturnValue({
        headers: [{'content-type': 'text/xml'}],
        body: result
      });
      buffer = await plmBase.getBuffer();
    });

    it('should return the buffer', () =>
      expect(buffer).toEqual(
        '624A3A6F0519000602504A3A6F49EA70200000026251546B05190006025051546B' +
          '49EA702000FF02625155EF0519000602505155EF49EA702000FF02624B2BA605' +
          '19000602504B2BA649EA7021000002624A1AB60519000602504A1AB649EA7020' +
          '00000226'
      ));
  });

  describe('plmBase.setUsernamePassword', () => {
    beforeEach(async () => {
      username = 'newuser';
      password = 'newpassword';
      server.hubCommand.mockReturnValue({
        headers: [{'content-type': 'text/html'}],
        body: ''
      });
      await plmBase.setUsernamePassword(username, password);
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

  describe('plmBase.createScene', () => {
    const sceneNumber = 1,
      sceneName = 'myscene';

    beforeEach(async () => {
      server.sceneCommand.mockReturnValue({
        headers: [{'content-type': 'text/html'}],
        body: ''
      });
    });

    describe('when show is true', () => {
      const show = true;

      beforeEach(async () => {
        await plmBase.createScene({
          sceneNumber,
          sceneName,
          show
        });
      });

      it('should send the request', () =>
        expect(server.sceneCommand).toBeCalledWith(
          expect.objectContaining({
            headers: expect.objectContaining({
              authorization,
              host: `${host}:${port}`
            }),
            path: '/2',
            query: {
              S1: 'myscene=2=t'
            }
          }))
      );
    });

    describe('when show is false', () => {
      const show = false;

      beforeEach(async () => {
        await plmBase.createScene({
          sceneNumber,
          sceneName,
          show
        });
      });

      it('should send the request', () =>
        expect(server.sceneCommand).toBeCalledWith(
          expect.objectContaining({
            headers: expect.objectContaining({
              authorization,
              host: `${host}:${port}`
            }),
            path: '/2',
            query: {
              S1: 'myscene=2=f'
            }
          }))
      );
    });
  });

  describe('plmBase.getHubInfo', () => {
    let result;

    beforeEach(async () => {
      const response = await fixture('getHubInfo-response.html');
      server.hubInfo.mockReturnValue({
        headers: [{'content-type': 'text/html'}],
        body: response
      });
      result = await plmBase.getHubInfo();
    });

    it('should send the request', () =>
      expect(server.hubInfo).toBeCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            authorization,
            host: `${host}:${port}`
          }),
          path: '/index.htm'
        }))
    );

    it('should return the info response', () => {
      expect(result).toEqual({
        binVersion: 'Hub2-V04-20140904',
        type: 'Hub2',
        hubVersion: '1019',
        firmwareBuildDate: 'Nov 18 2019  13:45:08',
        firmware: 'A5',
        imId: '010203'
      });
    });
  });

  describe('plmBase.getHubInfo', () => {
    let hubInfo;

    beforeEach(async () => {
      const response = await fixture('getHubInfo-response.html');
      server.hubInfo.mockReturnValue({
        headers: [{'content-type': 'text/html'}],
        body: response
      });
      hubInfo = await plmBase.getHubInfo();
    });

    afterEach(() => {
      server.hubInfo.mockClear();
    });

    it('should send the request', () =>
      expect(server.hubInfo).toBeCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            authorization,
            host: `${host}:${port}`
          }),
          path: '/index.htm'
        }))
    );

    it('should return the hub info', () => {
      expect(hubInfo).toEqual({
        binVersion: 'Hub2-V04-20140904',
        imId: '010203',
        firmwareBuildDate: 'Nov 18 2019  13:45:08',
        hubVersion: '1019',
        firmware: 'A5',
        type: 'Hub2'
      });
    });

    describe('when it has been retrieved once', () => {
      beforeEach(async () => {
        hubInfo = await plmBase.getHubInfo();
      });

      it('should not call getHubInfo again', () => {
        expect(server.hubInfo).toHaveBeenCalledTimes(1);
      });

      it('should return the hub info', () => {
        expect(hubInfo).toEqual({
          binVersion: 'Hub2-V04-20140904',
          imId: '010203',
          firmwareBuildDate: 'Nov 18 2019  13:45:08',
          hubVersion: '1019',
          firmware: 'A5',
          type: 'Hub2'
        });
      });
    });
  });

  describe('plmBase.getHubStatus', () => {
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

      hubStatus = plmBase.getHubStatus();
    });

    it('should return hub status', () =>
      expect(hubStatus).resolves.toEqual({
        cls: 'Ready',
        clsg: '',
        clsi: '',
        cds: '9999999999999999',
        day: 'Sunday',
        time: '20:04:24'
      }));
  });
});
