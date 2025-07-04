// Monitoring & Notification Middleware (Real-time Monitoring)
const { whitelisted, loadWhitelist } = require('./whitelist');
const { stats } = require('./stats');

function getActiveStats() {
  return {
    totalRequests: stats.totalRequests,
    blocked: stats.blocked,
    permanentBlocked: stats.permanentBlocked,
    activeIPs: Array.from(stats.activeIPs),
    lastReset: stats.lastReset,
    time: new Date().toISOString()
  };
}

async function monitorMiddleware(req, res, next) {
  const ip = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0].trim() : req.socket.remoteAddress;
  await loadWhitelist();
  if (req.url === '/admin/monitor') {
    if (!whitelisted.has(ip)) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Forbidden' }));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(getActiveStats()));
    return;
  }
  next();
}

module.exports = { monitorMiddleware }; 