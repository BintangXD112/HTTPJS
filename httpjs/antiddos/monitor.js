// Monitoring & Notification Middleware
const url = require('url');
const ipReqs = require('./rateLimiter').ipReqs || {};

module.exports = function monitor(options = {}) {
  return (req, res, next) => {
    if (req.url === '/status') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        activeIPs: Object.keys(ipReqs).length,
        time: new Date().toISOString()
      }));
      return;
    }
    next();
  };
}; 