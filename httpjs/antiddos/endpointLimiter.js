// Rate Limiting Per Endpoint Middleware
const endpointLimits = {
  '/login': { windowMs: 10000, max: 5 },
  '/register': { windowMs: 10000, max: 5 },
  'default': { windowMs: 10000, max: 20 }
};

const endpointReqs = {};

function endpointLimiter(req, res, next) {
  const ip = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0].trim() : req.socket.remoteAddress;
  const endpoint = Object.keys(endpointLimits).find(e => req.url.startsWith(e)) || 'default';
  const { windowMs, max } = endpointLimits[endpoint];
  const key = `${ip}:${endpoint}`;
  const now = Date.now();
  if (!endpointReqs[key]) endpointReqs[key] = [];
  endpointReqs[key] = endpointReqs[key].filter(ts => now - ts < windowMs);
  endpointReqs[key].push(now);
  if (endpointReqs[key].length > max) {
    res.writeHead(429, { 'Content-Type': 'text/plain' });
    res.end('Too many requests for this endpoint.');
    return;
  }
  next();
}

module.exports = { endpointLimiter, endpointLimits }; 