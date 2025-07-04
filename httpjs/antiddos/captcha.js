// Captcha Middleware
const fs = require('fs');
const path = require('path');
const url = require('url');
const crypto = require('crypto');
const { blockedIPs, blockCounts } = require('../server'); // akan diatur ulang agar tidak circular

const CAPTCHA_FILE = path.join(__dirname, '../view/captcha.html');
const captchaSessions = {};

function generateCaptcha() {
  // Captcha sederhana: angka random 4 digit
  return String(Math.floor(1000 + Math.random() * 9000));
}

function serveCaptchaPage(res, sessionId, captcha) {
  let html = fs.readFileSync(CAPTCHA_FILE, 'utf-8');
  html = html.replace('<!--CAPTCHA_CODE-->', captcha);
  html = html.replace('<!--SESSION_ID-->', sessionId);
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(html);
}

function captchaMiddleware(req, res, next) {
  const ip = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0].trim() : req.socket.remoteAddress;
  if (blockedIPs && blockedIPs[ip]) {
    // Jika request ke /captcha/verify (POST), cek jawaban
    if (req.url.startsWith('/captcha/verify') && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        const params = new URLSearchParams(body);
        const answer = params.get('captcha_answer');
        const sessionId = params.get('session_id');
        if (captchaSessions[sessionId] && captchaSessions[sessionId].captcha === answer) {
          // Captcha benar, unblock IP
          delete blockedIPs[ip];
          delete captchaSessions[sessionId];
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end('<h2>Captcha benar! Silakan refresh halaman.</h2>');
        } else {
          res.writeHead(403, { 'Content-Type': 'text/html' });
          res.end('<h2>Captcha salah. Silakan ulangi.</h2>');
        }
      });
      return;
    }
    // Jika request ke /captcha, tampilkan captcha
    if (req.url.startsWith('/captcha')) {
      const sessionId = crypto.randomBytes(8).toString('hex');
      const captcha = generateCaptcha();
      captchaSessions[sessionId] = { ip, captcha };
      serveCaptchaPage(res, sessionId, captcha);
      return;
    }
    // Jika terblokir dan bukan akses captcha, redirect ke /captcha
    res.writeHead(302, { Location: '/captcha' });
    res.end();
    return;
  }
  next();
}

module.exports = { captchaMiddleware }; 