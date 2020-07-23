'use strict';
const {createPlmStream} = require('../lib/plmStream'),
  {fixture} = require('./helpers/fixture.js'),
  {mockServer} = require('./helpers/mock-server.js');

const nextTick = () => new Promise(resolve => setImmediate(resolve));

const waitForReadable = stream => new Promise(resolve => {
  stream.once('readable', (a, b, c) => {
    console.log('a', a);
    console.log('b', b);
    console.log('c', c);
    resolve();
  });
});

describe('createPlmStream', () => {
  /* eslint no-undefined: "off" */
  let server, baseUrl, host, port, username, password, authorization, plmStream;

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
    plmStream = createPlmStream({username, password, host, port});
//    await nextTick();
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
  });
});
