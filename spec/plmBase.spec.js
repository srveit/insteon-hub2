'use strict';
const {createPlmBase} = require('../lib/plmBase'),
  {fixture} = require('./helpers/fixture.js'),
  {mockServer} = require('./helpers/mock-server.js');

describe('plm.createPlmBase', () => {
  /* eslint no-undefined: "off" */
  let server, baseUrl, host, port, username, password, authorization, plmBase;

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
    plmBase = createPlmBase({username, password, host, port});
  });

  describe('plmBase.sendAllLinkCommand', () => {
    let buffer;

    beforeEach(async () => {
      server.allLinkCommand.mockReturnValue({
        headers: [{'content-type': 'text/html'}],
        body: ''
      });
      buffer = await plmBase.sendAllLinkCommand('18');
    });

    it('should send the request', () =>
       expect(server.allLinkCommand).toBeCalledWith(
         expect.objectContaining({
           headers: expect.objectContaining({
             authorization,
             host: `${host}:${port}`
           }),
           path: '/0',
           query: {
             '1800': 'I=0'
           }
         }))
      );
  });

  describe('plmBase.sendDeviceControlCommand', () => {
    let buffer;
    const command = '02620102030F117F';

    beforeEach(async () => {
      server.deviceControlCommand.mockReturnValue({
        headers: [{'content-type': 'text/html'}],
        body: ''
      });
      buffer = await plmBase.sendDeviceControlCommand(command);
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
    let buffer;

    beforeEach(async () => {
      server.hubCommand.mockReturnValue({
        headers: [{'content-type': 'text/html'}],
        body: ''
      });
      buffer = await plmBase.clearBuffer();
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
        headers: [{'content-type': 'text/html'}],
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
    let buffer;
    const username = 'newuser',
      password = 'newpassword';

    beforeEach(async () => {
      server.hubCommand.mockReturnValue({
        headers: [{'content-type': 'text/html'}],
        body: ''
      });
      buffer = await plmBase.setUsernamePassword(username, password);
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
    let buffer;
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
        buffer = await plmBase.createScene({
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
        buffer = await plmBase.createScene({
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
        plmVersion: 'A5',
        deviceId: '010203'
      });
    });
  });

  describe('plmBase.getLinkStatus', () => {
    let result;

    beforeEach(async () => {
      const response = await fixture('LinkStatus-response.xml');
      server.linkStatus.mockReturnValue({
        headers: [{'content-type': 'text/xml'}],
        body: response
      });
      result = await plmBase.getLinkStatus();
    });

    it('should send the request', () =>
       expect(server.linkStatus).toBeCalledWith(
         expect.objectContaining({
           headers: expect.objectContaining({
             authorization,
             host: `${host}:${port}`
           }),
           path: '/Linkstatus.xml'
         }))
      );

    it('should return the status response', () => {
      expect(result).toEqual({
        CLS: 'Ready',
        CLSG: '',
        CLSI: ''
      });
    });
  });

  describe('plmBase.getCurrentTime', () => {
    let result;

    beforeEach(async () => {
      const response = await fixture('RStatus-response.xml');
      server.rStatus.mockReturnValue({
        headers: [{'content-type': 'text/xml'}],
        body: response
      });
      result = await plmBase.getCurrentTime();
    });

    it('should send the request', () =>
       expect(server.rStatus).toBeCalledWith(
         expect.objectContaining({
           headers: expect.objectContaining({
             authorization,
             host: `${host}:${port}`
           }),
           path: '/rstatus.xml'
         }))
      );

    it('should return the current time', () => {
      expect(result).toEqual('19:55');
    });
  });

  describe('plmBase.getCurrentTimeAndDay', () => {
    let result;

    beforeEach(async () => {
      const response = await fixture('status-response.xml');
      server.status.mockReturnValue({
        headers: [{'content-type': 'text/xml'}],
        body: response
      });
      result = await plmBase.getCurrentTimeAndDay();
    });

    it('should send the request', () =>
       expect(server.status).toBeCalledWith(
         expect.objectContaining({
           headers: expect.objectContaining({
             authorization,
             host: `${host}:${port}`
           }),
           path: '/status.xml'
         }))
      );

    it('should return the status response', () => {
      expect(result).toEqual({
        DAY: 'Sunday',
        FRT: '20:04:24'
      });
    });
  });

  describe('plmBase.getStatusD', () => {
    let result;

    beforeEach(async () => {
      const response = await fixture('statusD-response.xml');
      server.statusD.mockReturnValue({
        headers: [{'content-type': 'text/xml'}],
        body: response
      });
      result = await plmBase.getStatusD();
    });

    it('should send the request', () =>
       expect(server.statusD).toBeCalledWith(
         expect.objectContaining({
           headers: expect.objectContaining({
             authorization,
             host: `${host}:${port}`
           }),
           path: '/statusD.xml'
         }))
      );

    it('should return the status response', () => {
      expect(result).toEqual({
        CDS: '9999999999999999'
      });
    });
  });
});
