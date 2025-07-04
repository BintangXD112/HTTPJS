// Webhook Integration Utility
const fs = require('fs');
const path = require('path');
const https = require('https');

const WEBHOOK_URL = ''; // Isi dengan URL webhook Discord/Slack jika ingin aktif
const WEBHOOK_LOG = path.join(__dirname, '../logs/webhook.log');

function sendWebhook(event, detail) {
  const ts = new Date().toISOString();
  const msg = `[${ts}] [${event}] ${detail}`;
  // Demo: log ke file
  fs.appendFile(WEBHOOK_LOG, msg + '\n', err => {
    if (err) console.error('Webhook log error:', err);
  });
  // Kirim ke webhook jika URL diisi
  if (WEBHOOK_URL) {
    const data = JSON.stringify({ content: msg });
    const url = new URL(WEBHOOK_URL);
    const opts = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
    };
    const req = https.request(opts, res => {});
    req.on('error', err => console.error('Webhook error:', err));
    req.write(data);
    req.end();
  }
}

module.exports = { sendWebhook }; 