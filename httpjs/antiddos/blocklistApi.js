// Blocklist/Whitelist Management API Middleware
const { whitelisted, loadWhitelist, saveWhitelist } = require('./whitelist');
const fs = require('fs');
const path = require('path');

const BLACKLIST_FILE = path.join(__dirname, '../blacklisted.json');

async function loadBlacklist() {
  try {
    const data = fs.readFileSync(BLACKLIST_FILE, 'utf-8');
    return new Set(JSON.parse(data));
  } catch {
    return new Set();
  }
}
async function saveBlacklist(blacklisted) {
  fs.writeFileSync(BLACKLIST_FILE, JSON.stringify([...blacklisted]), 'utf-8');
}

async function blocklistApiMiddleware(req, res, next) {
  const ip = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0].trim() : req.socket.remoteAddress;
  await loadWhitelist();
  if (!req.url.startsWith('/admin/blocklist') && !req.url.startsWith('/admin/whitelist')) return next();
  if (!whitelisted.has(ip)) {
    res.writeHead(403, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Forbidden' }));
    return;
  }
  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    return;
  }
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', async () => {
    const params = new URLSearchParams(body);
    const targetIp = params.get('ip');
    if (!targetIp) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing IP' }));
      return;
    }
    if (req.url === '/admin/blocklist/add') {
      const blacklisted = await loadBlacklist();
      blacklisted.add(targetIp);
      await saveBlacklist(blacklisted);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, action: 'blocklist_add', ip: targetIp }));
      return;
    }
    if (req.url === '/admin/blocklist/remove') {
      const blacklisted = await loadBlacklist();
      blacklisted.delete(targetIp);
      await saveBlacklist(blacklisted);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, action: 'blocklist_remove', ip: targetIp }));
      return;
    }
    if (req.url === '/admin/whitelist/add') {
      await loadWhitelist();
      whitelisted.add(targetIp);
      await saveWhitelist();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, action: 'whitelist_add', ip: targetIp }));
      return;
    }
    if (req.url === '/admin/whitelist/remove') {
      await loadWhitelist();
      whitelisted.delete(targetIp);
      await saveWhitelist();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, action: 'whitelist_remove', ip: targetIp }));
      return;
    }
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  });
}

module.exports = { blocklistApiMiddleware }; 