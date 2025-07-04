// Blocklist Export/Import Middleware
const fs = require('fs');
const path = require('path');
const { whitelisted, loadWhitelist } = require('./whitelist');

const BLACKLIST_FILE = path.join(__dirname, '../blacklisted.json');

async function blocklistExportImportMiddleware(req, res, next) {
  const ip = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0].trim() : req.socket.remoteAddress;
  await loadWhitelist();
  if (req.url === '/admin/blocklist/export') {
    if (!whitelisted.has(ip)) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Forbidden' }));
      return;
    }
    const data = fs.readFileSync(BLACKLIST_FILE, 'utf-8');
    res.writeHead(200, { 'Content-Type': 'application/json', 'Content-Disposition': 'attachment; filename="blacklisted.json"' });
    res.end(data);
    return;
  }
  if (req.url === '/admin/blocklist/import' && req.method === 'POST') {
    if (!whitelisted.has(ip)) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Forbidden' }));
      return;
    }
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const arr = JSON.parse(body);
        if (!Array.isArray(arr)) throw new Error('Invalid format');
        fs.writeFileSync(BLACKLIST_FILE, JSON.stringify(arr), 'utf-8');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, count: arr.length }));
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }
  next();
}

module.exports = { blocklistExportImportMiddleware }; 