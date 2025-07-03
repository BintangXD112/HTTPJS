// CAPTCHA Middleware
const fs = require('fs');
const path = require('path');
const captchaPath = path.join(__dirname, '../view/captcha.html');

module.exports = function captchaMiddleware(options = {}) {
  return (req, res, next) => {
    if (req._captchaRequired) {
      fs.readFile(captchaPath, (err, html) => {
        res.writeHead(403, { 'Content-Type': 'text/html' });
        res.end(html);
      });
      return;
    }
    next();
  };
}; 