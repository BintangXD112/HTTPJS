// Path-based Temporary Block Middleware
const BLOCK_TIME_PATH = 60000; // 1 menit
const PATH_WINDOW = 10000; // 10 detik
const PATH_MAX = 10;
const pathReqs = {};
const pathBlocked = {};

function pathBlockerMiddleware(req, res, next) {
  const ip = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0].trim() : req.socket.remoteAddress;
  const pathKey = `${ip}:${req.url}`;
  const now = Date.now();
  if (pathBlocked[pathKey] && now < pathBlocked[pathKey]) {
    res.writeHead(429, { 'Content-Type': 'text/html' });
    res.end('<h1>Too many requests to this path. Try again later.</h1>');
    return;
  }
  if (!pathReqs[pathKey]) pathReqs[pathKey] = [];
  pathReqs[pathKey] = pathReqs[pathKey].filter(ts => now - ts < PATH_WINDOW);
  pathReqs[pathKey].push(now);
  if (pathReqs[pathKey].length > PATH_MAX) {
    pathBlocked[pathKey] = now + BLOCK_TIME_PATH;
    res.writeHead(429, { 'Content-Type': 'text/html' });
    res.end('<h1>Too many requests to this path. Temporarily blocked.</h1>');
    return;
  }
  next();
}

module.exports = { pathBlockerMiddleware }; 