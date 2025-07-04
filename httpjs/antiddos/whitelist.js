// Whitelist IP Middleware
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;

const WHITELIST_FILE = path.join(__dirname, '../whitelist.json');
let whitelisted = new Set();

async function loadWhitelist() {
  try {
    const data = await fsPromises.readFile(WHITELIST_FILE, 'utf-8');
    whitelisted = new Set(JSON.parse(data));
  } catch (e) {
    whitelisted = new Set();
  }
}

async function saveWhitelist() {
  await fsPromises.writeFile(WHITELIST_FILE, JSON.stringify([...whitelisted]), 'utf-8');
}

// Middleware utama
async function whitelistMiddleware(req, res, next) {
  await loadWhitelist();
  const ip = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0].trim() : req.socket.remoteAddress;
  if (whitelisted.has(ip)) {
    req.isWhitelisted = true;
  }
  next();
}

module.exports = {
  whitelistMiddleware,
  loadWhitelist,
  saveWhitelist,
  whitelisted
}; 