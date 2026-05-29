// Local PT Mock API. Zero deps. Catch-all + /health + /login + /auth/api/v1/login.
const http = require('http');
const PORT = Number(process.env.PORT || 8080);
const LATENCY = Number(process.env.MOCK_LATENCY_MS || 80);
const ERROR_RATE = Number(process.env.MOCK_ERROR_RATE || 0);
const STATUS_OVERRIDE = process.env.MOCK_STATUS ? Number(process.env.MOCK_STATUS) : null;

function reply(res, code, obj) {
  const body = JSON.stringify(obj);
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Length', Buffer.byteLength(body));
  res.end(body);
}

function withDelay(fn) { return LATENCY > 0 ? setTimeout(fn, LATENCY) : fn(); }

const server = http.createServer((req, res) => {
  const chunks = [];
  req.on('data', c => chunks.push(c));
  req.on('end', () => {
    const body = Buffer.concat(chunks).toString('utf8');
    console.log('[mock]', req.method, req.url, 'bytes=' + body.length);
    withDelay(() => {
      if (req.url === '/health') return reply(res, 200, { ok: true });

      if (STATUS_OVERRIDE) return reply(res, STATUS_OVERRIDE, { forced: STATUS_OVERRIDE, path: req.url });

      if (ERROR_RATE > 0 && Math.random() < ERROR_RATE) {
        const codes = [400, 401, 500, 502, 503];
        return reply(res, codes[Math.floor(Math.random()*codes.length)], { error: 'injected', path: req.url });
      }

      if (req.url === '/login' || req.url.endsWith('/auth/api/v1/login')) {
        return reply(res, 200, { token: 'mock-token-' + Date.now(), access_token: 'mock-token', expires_in: 3600 });
      }
      if (req.url.endsWith('/auth/api/v1/protected/pin-login')) {
        return reply(res, 200, { pin_token: 'mock-pin-token' });
      }

      return reply(res, 200, {
        status: 'OK',
        path: req.url,
        method: req.method,
        received: tryJson(body),
        ts: Date.now(),
      });
    });
  });
});

function tryJson(s) { try { return JSON.parse(s); } catch { return s.slice(0, 500); } }

server.listen(PORT, '0.0.0.0', () => {
  console.log('[mock] listen :' + PORT + ' latency=' + LATENCY + 'ms errorRate=' + ERROR_RATE);
});
