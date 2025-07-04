// Notifier Utility (Admin Notification)
const fs = require('fs');
const path = require('path');

const NOTIFY_LOG = path.join(__dirname, '../logs/notify.log');

function notifyAdmin(event, detail) {
  const ts = new Date().toISOString();
  const line = `[${ts}] [${event}] ${detail}\n`;
  fs.appendFile(NOTIFY_LOG, line, err => {
    if (err) console.error('Notifier error:', err);
  });
  // Untuk pengembangan: bisa tambahkan integrasi email/Telegram/Discord di sini
}

module.exports = { notifyAdmin }; 