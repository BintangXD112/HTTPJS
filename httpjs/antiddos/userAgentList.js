// User-Agent Blacklist/Whitelist Middleware
const blacklist = [
  'python-requests', 'curl', 'go-http-client', 'httpclient', 'java', 'node-fetch', 'axios', 'wget'
];
const whitelist = [
  // Tambahkan UA yang selalu diizinkan di sini
];

function userAgentListMiddleware(req, res, next) {
  const ua = (req.headers['user-agent'] || '').toLowerCase();
  if (whitelist.length && whitelist.some(w => ua.includes(w))) return next();
  if (!ua || ua.length < 8 || blacklist.some(b => ua.includes(b))) {
    res.writeHead(403, { 'Content-Type': 'text/html' });
    res.end('<h1>Access denied: Suspicious User-Agent</h1>');
    return;
  }
  next();
}

module.exports = { userAgentListMiddleware, blacklist, whitelist }; 