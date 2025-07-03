// Connection Limit Middleware
const ipConnections = {};
const MAX_CONN = 10;

module.exports = function connectionLimit(options = {}) {
  return (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0].trim() : req.socket.remoteAddress;
    ipConnections[ip] = (ipConnections[ip] || 0) + 1;
    if (ipConnections[ip] > MAX_CONN) {
      res.writeHead(429, { 'Content-Type': 'text/plain' });
      res.end('Too many simultaneous connections');
      ipConnections[ip]--;
      return;
    }
    res.on('finish', () => {
      ipConnections[ip]--;
    });
    next();
  };
}; 