// GeoIP Blocking Middleware
const https = require('https');
const blockedCountries = ['CN', 'RU', 'BR']; // Contoh: blokir China, Russia, Brazil
const cache = {};

function getCountry(ip, cb) {
  if (cache[ip]) return cb(cache[ip]);
  https.get(`https://ip-api.com/json/${ip}?fields=countryCode`, resp => {
    let data = '';
    resp.on('data', chunk => { data += chunk; });
    resp.on('end', () => {
      try {
        const json = JSON.parse(data);
        cache[ip] = json.countryCode;
        cb(json.countryCode);
      } catch {
        cb(null);
      }
    });
  }).on('error', () => cb(null));
}

function geoipBlockMiddleware(req, res, next) {
  const ip = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0].trim() : req.socket.remoteAddress;
  getCountry(ip, country => {
    if (country && blockedCountries.includes(country)) {
      res.writeHead(403, { 'Content-Type': 'text/html' });
      res.end(`<h1>Access denied from your country (${country})</h1>`);
      return;
    }
    next();
  });
}

module.exports = { geoipBlockMiddleware, blockedCountries }; 