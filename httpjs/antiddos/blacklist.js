// Dynamic Blacklist/Whitelist Middleware
const blacklist = new Set();
const whitelist = new Set();

module.exports = function blacklistMiddleware(options = {}) {
  return (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0].trim() : req.socket.remoteAddress;
    if (whitelist.has(ip)) return next();
    if (blacklist.has(ip)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('Access denied: Blacklisted');
      return;
    }
    next();
  };
};
// Untuk menambah/hapus IP, bisa expose method pada modul ini jika perlu. 