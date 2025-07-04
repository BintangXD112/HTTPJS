// Token/Cookie-based Rate Limiter Middleware
const tokenReqs = {};
const WINDOW_MS = 10000; // 10 detik
const MAX_REQ = 10;

function getTokenKey(req) {
  // Cek cookie 'sessionid' atau header 'x-auth-token'
  const cookie = req.headers['cookie'] || '';
  const match = cookie.match(/sessionid=([^;]+)/);
  if (match) return match[1];
  if (req.headers['x-auth-token']) return req.headers['x-auth-token'];
  return null;
}

function tokenLimiter(req, res, next) {
  const token = getTokenKey(req);
  if (!token) return next(); // Jika tidak ada token, lanjutkan (hanya limitasi IP)
  const now = Date.now();
  if (!tokenReqs[token]) tokenReqs[token] = [];
  tokenReqs[token] = tokenReqs[token].filter(ts => now - ts < WINDOW_MS);
  tokenReqs[token].push(now);
  if (tokenReqs[token].length > MAX_REQ) {
    res.writeHead(429, { 'Content-Type': 'text/plain' });
    res.end('Too many requests for your session/token.');
    return;
  }
  next();
}

module.exports = { tokenLimiter }; 