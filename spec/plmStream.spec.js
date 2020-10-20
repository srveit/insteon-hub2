'use strict';
const got = require('got');

const {createPlmBase} = require('../lib/plmBase'),
  {createPlmStream} = require('../lib/plmStream'),
  {fixture} = require('./helpers/fixture.js'),
  {mockServer} = require('./helpers/mock-server.js');

const waitForReadable = stream => new Promise(resolve => {
  stream.once('readable', resolve);
});

const waitForClose = stream => new Promise(resolve => {
  stream.once('close', resolve);
});

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

describe('createPlmStream', () => {
  /* eslint no-undefined: "off" */
  let server, baseUrl, host, port, username, password, authorization, plmBase,
    plmStream;

  beforeAll(async () => {
    server = mockServer([
      {
        path: '/buffstatus.xml',
        name: 'bufferStatus'
      }
    ]);
    await server.start();
  });

  afterAll(() => server.stop());

  beforeEach(async () => {
    baseUrl = process.env.SERVER_BASE_URL;
    host = process.env.SERVER_HOSTNAME;
    port = process.env.SERVER_PORT;
    username = 'username';
    password = 'password';
    authorization = 'Basic dXNlcm5hbWU6cGFzc3dvcmQ=';
    plmBase = createPlmBase({username, password, host, port});
    plmStream = createPlmStream(plmBase);
  });

  afterEach(async () => {
    plmStream.stopMonitoring();
    await waitForClose(plmStream);
  });

  describe('when reading', () => {
    let segment;

    beforeEach(async () => {
      const result = '<response><BS>AAAAAA06</BS></response>';
      server.bufferStatus.mockReturnValue({
        headers: {'content-type': 'text/html'},
        body: result
      });
      await waitForReadable(plmStream);
      segment = plmStream.read();
    });

    it('should return a segment', () => {
      expect(segment).toEqual('AAAAAA');
    });

    describe('and read a second time', () => {
      beforeEach(async () => {
        await sleep(100);
        segment = plmStream.read();
      });

      it('should not return a segment', () => {
        expect(segment).toBe(null);
      });
    });

    describe('and stopMonitoring', () => {
      beforeEach(async () => {
        await plmStream.stopMonitoring();
      });

      it('should stop reading', () => {
        expect(plmStream.readable).toBe(false);
      });
    });
  });
});
