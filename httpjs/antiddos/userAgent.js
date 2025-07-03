// User-Agent & Header Validation Middleware
const badUA = ['python-requests', 'curl', 'go-http-client', 'httpclient', 'java', 'node-fetch', 'axios', 'wget'];

module.exports = function userAgentValidator(options = {}) {
  return (req, res, next) => {
    const ua = (req.headers['user-agent'] || '').toLowerCase();
    if (!ua || ua.length < 8 || badUA.includes(ua)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('Access denied: Suspicious User-Agent');
      return;
    }
    next();
  };
}; 