const http = require('http');
const fs = require('fs');
const path = require('path');
const fsPromises = require('fs').promises;
// Chalk v5+ ESM compatibility and fallback
let chalk = null;
function getChalkFallback() {
  return {
    green: (s) => `\x1b[32m${s}\x1b[0m`,
    yellow: (s) => `\x1b[33m${s}\x1b[0m`,
    red: (s) => `\x1b[31m${s}\x1b[0m`,
    cyan: (s) => `\x1b[36m${s}\x1b[0m`,
    magenta: (s) => `\x1b[35m${s}\x1b[0m`,
    blue: (s) => `\x1b[34m${s}\x1b[0m`,
    white: (s) => `\x1b[37m${s}\x1b[0m`,
    gray: (s) => `\x1b[90m${s}\x1b[0m`,
    redBright: { bold: (s) => `\x1b[1m\x1b[91m${s}\x1b[0m` },
  };
}
try {
  chalk = require('chalk');
  // flatten for fallback compatibility
  if (chalk.default) chalk = chalk.default;
} catch (e) {
  chalk = getChalkFallback();
}
const os = require('os');

const hostname = '127.0.0.1';
const port = 8000;
const viewDir = path.join(__dirname, 'view');

// DDoS detection: track requests per IP
const requestCounts = {};
const WINDOW_MS = 5000; // 5 seconds
const MAX_REQ = 20;
const blockedIPs = {};
const BLOCK_TIME = 10000; // 10 detik

const MAX_BLOCKS = 3;
const BLOCK_WINDOW = 24 * 60 * 60 * 1000; // 24 jam

// Helper for background + foreground color (for fallback)
function bgFg(str, bg, fg) {
  const bgCodes = { blue: 44, green: 42, yellow: 43, red: 41 };
  const fgCodes = { black: 30, white: 37 };
  return `\x1b[${bgCodes[bg]}m\x1b[${fgCodes[fg]}m${str}\x1b[0m`;
}

function logAccess({ method, url, status, ip, file, time }) {
  const statusColor = status === 200 ? chalk.green : status === 404 ? chalk.yellow : chalk.red;
  console.log(
    bgFg(' ACCESS ', 'blue', 'white'),
    chalk.cyan(method),
    chalk.magenta(url),
    statusColor(String(status)),
    chalk.gray('@'),
    chalk.yellow(time),
    chalk.gray('|'),
    chalk.white('IP:'), chalk.yellow(ip),
    chalk.gray('|'),
    chalk.white('File:'), chalk.blue(file)
  );
}

function logFileChange(event, filename) {
  console.log(
    bgFg(' FILE CHANGE ', 'yellow', 'black'),
    chalk.white(`File ${filename} was ${event}`),
    chalk.gray('@'),
    chalk.yellow(new Date().toLocaleTimeString())
  );
}

// Watch view directory for changes
fs.watch(viewDir, (event, filename) => {
  if (filename) logFileChange(event, filename);
});

function logDDoS({ method, url, status, ip, file, time, count }) {
  console.log(
    bgFg(' DDoS WARNING ', 'red', 'white'),
    chalk.redBright && chalk.redBright.bold ? chalk.redBright.bold(`IP ${ip} sent ${count} reqs in ${WINDOW_MS / 1000}s`) : chalk.red(`IP ${ip} sent ${count} reqs in ${WINDOW_MS / 1000}s`),
    chalk.cyan(method),
    chalk.magenta(url),
    chalk.gray('@'),
    chalk.yellow(time),
    chalk.gray('|'),
    chalk.white('File:'), chalk.blue(file)
  );
}

const BLACKLIST_FILE = path.join(__dirname, 'blacklisted.json');
let blacklisted = new Set();
let blockCounts = {};
let blockTimestamps = {};

// Load blacklist from file
async function loadBlacklist() {
  try {
    const data = await fsPromises.readFile(BLACKLIST_FILE, 'utf-8');
    blacklisted = new Set(JSON.parse(data));
  } catch (e) {
    blacklisted = new Set();
  }
}
// Save blacklist to file
async function saveBlacklist() {
  await fsPromises.writeFile(BLACKLIST_FILE, JSON.stringify([...blacklisted]), 'utf-8');
}
// Reset block count after 24h
function resetBlockCount(ip) {
  blockCounts[ip] = 0;
  blockTimestamps[ip] = Date.now();
}
// On server start, load blacklist
loadBlacklist();

function logBlock(ip, url, count, perm) {
  if (perm) {
    console.log(bgFg(' PERM BLOCK ', 'red', 'white'), chalk.yellow(`IP ${ip} PERMANENTLY blocked!`), chalk.gray('@'), chalk.yellow(new Date().toLocaleTimeString()));
  } else {
    console.log(bgFg(' BLOCKED ', 'red', 'white'), chalk.yellow(`IP ${ip} diblokir (${count}/${MAX_BLOCKS}) karena spam akses ke ${url}`), chalk.gray('@'), chalk.yellow(new Date().toLocaleTimeString()));
  }
}
function logUnblock(ip) {
  console.log(bgFg(' UNBLOCK ', 'green', 'black'), chalk.yellow(`IP ${ip} diizinkan kembali`), chalk.gray('@'), chalk.yellow(new Date().toLocaleTimeString()));
}

const BLOCKED_HTML = path.join(viewDir, 'blocked.html');
const PERM_BLOCKED_HTML = path.join(viewDir, 'permanent_blocked.html');

async function serveBlockedPage(res, count) {
  let html = await fsPromises.readFile(BLOCKED_HTML, 'utf-8');
  html = html.replace('<span id="blockCount">1</span>', `<span id="blockCount">${count}</span>`);
  res.writeHead(429, { 'Content-Type': 'text/html' });
  res.end(html);
}
async function servePermBlockedPage(res) {
  let html = await fsPromises.readFile(PERM_BLOCKED_HTML, 'utf-8');
  res.writeHead(403, { 'Content-Type': 'text/html' });
  res.end(html);
}

const checkHostCounts = {};
const CHECK_HOST_WINDOW = 60 * 1000; // 1 minute
const CHECK_HOST_MAX = 5;

function logCheckHostTimeout(ip, url, headers) {
  console.log(bgFg(' CHECK-HOST-TIMEOUT ', 'red', 'white'), chalk.cyan(ip), chalk.magenta(url), chalk.white('Check-host.net timeout simulated!'), chalk.gray('@'), chalk.yellow(new Date().toLocaleTimeString()));
  console.log(chalk.gray('Headers:'), JSON.stringify(headers));
}

function logCheckHost(ip, url, headers) {
  console.log(bgFg(' CHECK-HOST ', 'yellow', 'black'), chalk.cyan(ip), chalk.magenta(url), chalk.white('Detected check-host.net or similar!'), chalk.gray('@'), chalk.yellow(new Date().toLocaleTimeString()));
  console.log(chalk.gray('Headers:'), JSON.stringify(headers));
}

function isSuspiciousUA(ua) {
  return !ua || ua.length < 8 || ua === 'python-requests' || ua === 'curl' || ua === 'go-http-client' || ua === 'httpclient' || ua === 'java' || ua === 'node-fetch' || ua === 'axios' || ua === 'wget';
}

function logAllRequests(req, ip) {
  const ua = req.headers['user-agent'] || '-';
  console.log(bgFg(' HTTP REQ ', 'blue', 'white'), chalk.cyan(req.method), chalk.magenta(req.url), chalk.yellow(ip), chalk.gray('UA:'), chalk.white(ua));
}

const server = http.createServer(async (req, res) => {
  // Get real IP if behind Cloudflare or proxy
  let ip = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0].trim() : req.socket.remoteAddress;
  logAllRequests(req, ip);
  const now = Date.now();
  const ua = (req.headers['user-agent'] || '').toLowerCase();
  const ref = (req.headers['referer'] || '').toLowerCase();
  const isCheckHost = ua.includes('check-host') || ref.includes('check-host') || ua.includes('uptimerobot') || ua.includes('pingdom') || ua.includes('statuscake');
  const suspiciousUA = isSuspiciousUA(ua);
  const uncommonMethod = req.method !== 'GET' && req.method !== 'POST' && req.method !== 'OPTIONS';
  if (isCheckHost || suspiciousUA || uncommonMethod || req.method === 'HEAD') {
    if (!checkHostCounts[ip]) checkHostCounts[ip] = [];
    checkHostCounts[ip] = checkHostCounts[ip].filter(ts => now - ts < CHECK_HOST_WINDOW);
    checkHostCounts[ip].push(now);
    logCheckHost(ip, req.url, req.headers);
    if (checkHostCounts[ip].length > CHECK_HOST_MAX) {
      logCheckHostTimeout(ip, req.url, req.headers);
      setTimeout(() => {
        try { res.destroy(); } catch(e) {}
      }, 10000);
      return;
    }
  }
  await loadBlacklist();
  if (blacklisted.has(ip)) {
    logBlock(ip, req.url, MAX_BLOCKS, true);
    await servePermBlockedPage(res);
    return;
  }
  if (blockedIPs[ip] && now < blockedIPs[ip]) {
    let count = blockCounts[ip] || 1;
    await serveBlockedPage(res, count);
    logBlock(ip, req.url, count, false);
    return;
  }
  // DDoS detection logic
  if (!requestCounts[ip]) requestCounts[ip] = [];
  requestCounts[ip] = requestCounts[ip].filter(ts => now - ts < WINDOW_MS);
  requestCounts[ip].push(now);
  const count = requestCounts[ip].length;
  // Block jika spam
  if (count > 10) {
    // Hitung blokir keberapa
    if (!blockCounts[ip] || (blockTimestamps[ip] && now - blockTimestamps[ip] > BLOCK_WINDOW)) {
      blockCounts[ip] = 1;
      blockTimestamps[ip] = now;
    } else {
      blockCounts[ip]++;
    }
    // Permanent block jika sudah 3x
    if (blockCounts[ip] >= MAX_BLOCKS) {
      blacklisted.add(ip);
      await saveBlacklist();
      logBlock(ip, req.url, blockCounts[ip], true);
      await servePermBlockedPage(res);
      return;
    }
    blockedIPs[ip] = now + BLOCK_TIME;
    logBlock(ip, req.url, blockCounts[ip], false);
    setTimeout(() => {
      delete blockedIPs[ip];
      logUnblock(ip);
    }, BLOCK_TIME);
    await serveBlockedPage(res, blockCounts[ip]);
    return;
  }
  // Reset block count jika sudah 24 jam
  if (blockTimestamps[ip] && now - blockTimestamps[ip] > BLOCK_WINDOW) {
    resetBlockCount(ip);
  }
  let filePath = path.join(viewDir, req.url === '/' ? 'index.html' : req.url);
  const extname = String(path.extname(filePath)).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
  };
  const start = Date.now();

  fs.readFile(filePath, (error, content) => {
    let status = 200;
    if (error) {
      if (error.code === 'ENOENT') {
        status = 404;
        logAccess({ method: req.method, url: req.url, status, ip, file: path.basename(filePath), time: new Date().toLocaleTimeString() });
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1>', 'utf-8');
      } else {
        status = 500;
        logAccess({ method: req.method, url: req.url, status, ip, file: path.basename(filePath), time: new Date().toLocaleTimeString() });
        res.writeHead(500);
        res.end('Sorry, check with the site admin for error: ' + error.code + ' ..\n');
      }
    } else {
      // Log jika akses file selain index.html
      if (req.url !== '/' && path.basename(filePath) !== 'index.html') {
        console.log(bgFg(' FILE ACCESS ', 'yellow', 'black'), chalk.cyan(ip), chalk.magenta(req.url), chalk.white('->'), chalk.blue(path.basename(filePath)), chalk.gray('@'), chalk.yellow(new Date().toLocaleTimeString()));
      }
      res.writeHead(200, { 'Content-Type': mimeTypes[extname] || 'application/octet-stream' });
      res.end(content, 'utf-8');
    }
    logAccess({
      method: req.method,
      url: req.url,
      status,
      ip,
      file: path.basename(filePath),
      time: new Date().toLocaleTimeString()
    });
  });
});

server.listen(port, hostname, () => {
  console.log(bgFg(' SERVER STARTED ', 'green', 'black'), chalk.white(`http://${hostname}:${port}/`));
  console.log(chalk.gray('Watching for file changes in'), chalk.yellow(viewDir));
});

// Show nodemon restart info
if (process.env.npm_lifecycle_event === 'dev' || process.env.NODE_ENV === 'development') {
  process.once('SIGUSR2', function () {
    console.log(bgFg(' RESTART ', 'red', 'white'), chalk.white('Server restarting due to file change...'));
    process.kill(process.pid, 'SIGUSR2');
  });
} 