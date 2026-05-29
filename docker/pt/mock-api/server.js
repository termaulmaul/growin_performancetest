// PT Mock API. No external deps. Catch-all. Configurable status + latency.
const http = require('http');
const url = require('url');

const PORT = Number(process.env.PORT || 8088);
const STATUS = Number(process.env.MOCK_STATUS || 200);
const LATENCY_MS = Number(process.env.MOCK_LATENCY_MS || 0);
const LOG = String(process.env.MOCK_LOG || 'true') === 'true';

function reply(req, res, bodyStr) {
  const body = JSON.stringify({
    status: 'OK',
    message: 'mock response',
    path: req.url,
    method: req.method,
    received: bodyStr ? safeJson(bodyStr) : null,
    timestamp: new Date().toISOString(),
  });
  res.statusCode = STATUS;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Length', Buffer.byteLength(body));
  res.end(body);
}

function safeJson(s) {
  try { return JSON.parse(s); } catch { return s.slice(0, 500); }
}

const server = http.createServer((req, res) => {
  let chunks = [];
  req.on('data', c => chunks.push(c));
  req.on('end', () => {
    const body = Buffer.concat(chunks).toString('utf8');
    if (LOG) console.log(`[mock] ${req.method} ${req.url} bytes=${body.length}`);
    if (LATENCY_MS > 0) setTimeout(() => reply(req, res, body), LATENCY_MS);
    else reply(req, res, body);
  });
});

server.listen(PORT, () => console.log(`[mock] PT mock API listening on :${PORT} status=${STATUS} latency=${LATENCY_MS}ms`));
