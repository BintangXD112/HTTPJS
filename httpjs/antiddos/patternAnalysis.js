// Request Pattern Analysis Middleware
const reqPatterns = {};
const WINDOW_MS = 10000;
const MAX_SAME_PATH = 5;

module.exports = function patternAnalysis(options = {}) {
  return (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0].trim() : req.socket.remoteAddress;
    const key = ip + '|' + req.url;
    const now = Date.now();
    if (!reqPatterns[key]) reqPatterns[key] = [];
    reqPatterns[key] = reqPatterns[key].filter(ts => now - ts < WINDOW_MS);
    reqPatterns[key].push(now);
    if (reqPatterns[key].length > MAX_SAME_PATH) {
      req._jsChallengeRequired = true;
    }
    next();
  };
}; 