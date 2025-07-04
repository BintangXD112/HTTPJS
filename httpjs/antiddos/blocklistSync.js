// Blocklist Auto-Update/Sinkronisasi dari Sumber Eksternal
const fs = require('fs');
const path = require('path');
const https = require('https');

const BLACKLIST_FILE = path.join(__dirname, '../blacklisted.json');

function syncBlocklistFromUrl(url, cb) {
  https.get(url, res => {
    let data = '';
    res.on('data', chunk => { data += chunk; });
    res.on('end', () => {
      // Asumsi satu IP per baris
      const ips = data.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
      fs.writeFileSync(BLACKLIST_FILE, JSON.stringify(ips), 'utf-8');
      if (cb) cb(null, ips.length);
    });
  }).on('error', err => {
    if (cb) cb(err);
  });
}

module.exports = { syncBlocklistFromUrl }; 