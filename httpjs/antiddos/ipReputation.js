// IP Reputation & GeoIP Middleware
const blockedIPs = ['1.2.3.4']; // Dummy list

module.exports = function ipReputation(options = {}) {
  return (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0].trim() : req.socket.remoteAddress;
    if (blockedIPs.includes(ip)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('Access denied: IP reputation block');
      return;
    }
    next();
  };
}; 