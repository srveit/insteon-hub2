'use strict';
const {createPlm} = require('../lib/plm'),
  {mockServer} = require('./helpers/mock_server.js'),
  deviceNames = {
    511234: 'hub controller',
    'im-hub': 'hub controller',

    521234: 'porch outlets',
    531234: 'Garage lights',
    541234: 'foyer lamps switch',
    551234: 'foyer chandelier switch',
    561234: 'front lights',
    571234: 'foyer chandelier',
    581234: 'foyer lamps',
    591234: 'dining outlet',
    '5A1234': 'Danny outlet',
    '5B1234': 'Steph outlet'
  },

  hexLength = bytes =>
    bytes.length.toString(16).padStart(2, '0').toUpperCase();

describe('plm.createPlm', () => {
  /* eslint no-undefined: "off" */
  let server, baseUrl, host, port, username, password, authorization, plm;

  beforeAll(async () => {
    server = mockServer();
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

  it('should have a start function', () =>
     expect(plm.start).toEqual(jasmine.any(Function)));

  describe('plm.start', () => {
    beforeEach(async () => {
      await plm.start();
    });

    afterEach(async () => {
      await plm.stop();
    });

    it('should make a call to clear buffer', () => {
      expect(server.clearBuffer).toHaveBeenCalledWith({
        path: '/1',
        headers: {
          'accept-encoding': 'gzip, deflate, br',
          authorization,
          host: `${host}:${port}`,
          connection: 'close',
          'user-agent': 'got (https://github.com/sindresorhus/got)'
        },
        body: {},
        query: {
          XB: 'M=1'
        }
      });
    });

    describe('when called a second time', () => {
      beforeEach(async () => {
        server.clearBuffer.calls.reset();
        await plm.start();
      });

      it('should not call clearBuffer a second time', () => {
        expect(server.clearBuffer).not.toHaveBeenCalled();
      });
    });
  });
});
