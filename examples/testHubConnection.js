'use strict';

const https = require('https'),
  fs = require('fs');

const main = async () => {
  const agent = new https.Agent({});
  https.globalAgent.on('keylog', (line, tlsSocket) => {
    console.log('keylog', line);
    fs.appendFileSync('/tmp/ssl-keys.log', line, { mode: 0o600 });
  });

  
  https.request(
    {
      hostname: 'insteon-hub',
      port: 443,
      path: '/',
      method: 'GET',
      protocol: 'https:',
      agent
    },
    (res) => {
      console.log(res);
    }
  );

  console.log('main');
};

main();
