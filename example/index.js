const http = require('http');
const fs = require('fs');
const path = require('path');

const range = require('../index');

const server = http.createServer(handleRequest);

function resolve(...args) {
  return path.join(__dirname, ...args);
}

function handleRequest(req, res) {
  if (req.url === '/video.mp4') {
    res.setHeader('content-type', 'video/mp4');
    range(resolve('big_buck_bunny.mp4'))(req, res);
    return;
  }

  if (req.url === '/') {
    res.setHeader('content-type', 'text/html');
    fs.createReadStream(resolve('index.html')).pipe(res);
    return;
  }

  res.writeHead(404);
  res.end();
}

const PORT = 3000;
server.listen(PORT, () => {
  console.log('Example server is listening on %d', PORT);
});
