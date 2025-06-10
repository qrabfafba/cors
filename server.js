// A simple Node.js server that proxies requests to avoid CORS issues.
const http = require('http');
const https = require('https');
const url = require('url');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  // Set CORS headers to allow any origin
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Request-Method', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // The destination URL is everything after the leading "/"
  const destinationUrl = req.url.slice(1);

  if (!destinationUrl) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Please provide a destination URL. Usage: /https://example.com');
    return;
  }

  const parsedUrl = url.parse(destinationUrl);
  const protocol = parsedUrl.protocol === 'https:' ? https : http;

  const proxyReq = protocol.request(destinationUrl, { headers: req.headers, method: req.method }, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  req.pipe(proxyReq, { end: true });

  proxyReq.on('error', (err) => {
    console.error('Proxy Error:', err);
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end('Proxy Error: Could not connect to the destination.');
  });
});

server.listen(PORT, () => {
  console.log(`CORS Proxy Server running on port ${PORT}`);
});
