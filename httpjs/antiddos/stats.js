// Statistik & Dashboard Middleware
const fs = require('fs');
const path = require('path');
const { whitelisted, loadWhitelist } = require('./whitelist');

// Data statistik sederhana (bisa dikembangkan)
const stats = {
  totalRequests: 0,
  blocked: 0,
  permanentBlocked: 0,
  activeIPs: new Set(),
  lastReset: new Date().toISOString()
};

function incrementStat(type, ip) {
  stats.totalRequests++;
  if (type === 'blocked') stats.blocked++;
  if (type === 'permBlocked') stats.permanentBlocked++;
  if (ip) stats.activeIPs.add(ip);
}

// Middleware utama
async function statsMiddleware(req, res, next) {
  const ip = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0].trim() : req.socket.remoteAddress;
  await loadWhitelist();
  if (req.url === '/admin/stats') {
    if (!whitelisted.has(ip)) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Forbidden' }));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      totalRequests: stats.totalRequests,
      blocked: stats.blocked,
      permanentBlocked: stats.permanentBlocked,
      activeIPs: Array.from(stats.activeIPs),
      lastReset: stats.lastReset
    }));
    return;
  }
  next();
}

module.exports = {
  statsMiddleware,
  incrementStat,
  stats
}; 