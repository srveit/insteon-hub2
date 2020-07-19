'use strict';
const {createPlmBase} = require('../lib/plmBase'),
  {fixture} = require('./helpers/fixture.js'),
  {mockServer} = require('./helpers/mock-server.js'),

  hexLength = bytes =>
    bytes.length.toString(16).padStart(2, '0').toUpperCase();

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
      server.bufferStatus.mockReturnValue({
        error: undefined,
        headers: [{'content-type': 'text/html'}],
        body: ''
      });
      buffer = await plmBase.sendAllLinkCommand('18', 0);
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
      server.bufferStatus.mockReturnValue({
        error: undefined,
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

  describe('plmBase.sendDeviceControlCommand', () => {
    let buffer;
    const command = '02620102030F117F';

    beforeEach(async () => {
      server.bufferStatus.mockReturnValue({
        error: undefined,
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
        error: undefined,
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
        error: undefined,
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

  describe('plmBase.setUsernamePassword', () => {
    let buffer;
    const username = 'newuser',
      password = 'newpassword';

    beforeEach(async () => {
      server.hubCommand.mockReturnValue({
        error: undefined,
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

  describe('plmBase.getBuffer', () => {
    let buffer;

    beforeEach(async () => {
      const result = await fixture('buffstatus-reponse.xml');
      server.bufferStatus.mockReturnValue({
        error: undefined,
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
});
