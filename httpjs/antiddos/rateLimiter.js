// Rate Limiter Middleware (Sliding Window, Burst)
const ipReqs = {};
const WINDOW_MS = 5000;
const MAX_REQ = 20;

module.exports = function rateLimiter(options = {}) {
  return (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0].trim() : req.socket.remoteAddress;
    const now = Date.now();
    if (!ipReqs[ip]) ipReqs[ip] = [];
    ipReqs[ip] = ipReqs[ip].filter(ts => now - ts < WINDOW_MS);
    ipReqs[ip].push(now);
    if (ipReqs[ip].length > MAX_REQ) {
      res.writeHead(429, { 'Content-Type': 'text/plain' });
      res.end('Too many requests (rate limited)');
      return;
    }
    next();
  };
}; 