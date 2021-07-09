var net = require('net');

var host = '192.168.1.110'; // update with your Hub's IP
var port = 9761;

var client = new net.Socket();

client.on('connect', function() {
  console.log('Connected to: ' + host + ':' + port);
  client.end();
});

client.on('close', function() {
  console.log('Connection closed');
});

client.connect(port, host);
