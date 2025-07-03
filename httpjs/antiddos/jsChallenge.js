// JS Challenge Middleware
const fs = require('fs');
const path = require('path');
const jsChallengePath = path.join(__dirname, '../view/js_challenge.html');

module.exports = function jsChallenge(options = {}) {
  return (req, res, next) => {
    if (req._jsChallengeRequired) {
      fs.readFile(jsChallengePath, (err, html) => {
        res.writeHead(403, { 'Content-Type': 'text/html' });
        res.end(html);
      });
      return;
    }
    next();
  };
}; 