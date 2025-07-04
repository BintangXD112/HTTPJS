// Logger Middleware & Utility
const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '../logs');
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR);

function getLogFileName() {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return path.join(LOG_DIR, `${y}-${m}-${d}.log`);
}

function formatLog({ level = 'INFO', ip = '-', event = '', detail = '' }) {
  const ts = new Date().toISOString();
  return `[${ts}] [${level}] [${ip}] [${event}] ${detail}\n`;
}

function logToFile({ level, ip, event, detail }) {
  const logLine = formatLog({ level, ip, event, detail });
  fs.appendFile(getLogFileName(), logLine, err => {
    if (err) console.error('Logger error:', err);
  });
}

// Middleware contoh: log semua request
function requestLogger(req, res, next) {
  const ip = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0].trim() : req.socket.remoteAddress;
  logToFile({ level: 'INFO', ip, event: 'REQUEST', detail: `${req.method} ${req.url}` });
  next();
}

module.exports = {
  logToFile,
  requestLogger,
  formatLog
}; 