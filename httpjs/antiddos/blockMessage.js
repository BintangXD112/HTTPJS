// Custom Block Message Utility
function serveBlockMessage(res, reason, detail = '') {
  let title = 'Access Blocked';
  let message = '';
  let status = 429;
  switch (reason) {
    case 'ddos':
      title = 'DDoS Protection';
      message = 'Akses Anda diblokir sementara karena terdeteksi aktivitas mencurigakan/DDoS.';
      break;
    case 'ua':
      title = 'User-Agent Blocked';
      message = 'Akses Anda diblokir karena User-Agent mencurigakan.';
      break;
    case 'perm':
      title = 'Permanently Blocked';
      message = 'Akses Anda diblokir permanen.';
      status = 403;
      break;
    case 'rate':
      title = 'Rate Limit Exceeded';
      message = 'Terlalu banyak request dalam waktu singkat.';
      break;
    default:
      message = 'Akses Anda diblokir.';
  }
  if (detail) message += `<br><small>${detail}</small>`;
  res.writeHead(status, { 'Content-Type': 'text/html' });
  res.end(`<html><head><title>${title}</title></head><body><h1>${title}</h1><p>${message}</p></body></html>`);
}

module.exports = { serveBlockMessage }; 