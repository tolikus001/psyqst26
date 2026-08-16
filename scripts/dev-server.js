const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = parseInt(process.env.PORT || '3000', 10);
const CLIENT_DIR = path.join(__dirname, '..', 'out', 'client');
const MEDIA_DIR = path.join(__dirname, '..', 'baza', 'исходник миникурса', 'media-server', 'files');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.pdf': 'application/pdf',
  '.ico': 'image/x-icon'
};

function resolveFile(urlPath) {
  const cleanPath = unescape(urlPath.split('?')[0]);
  const baseName = path.basename(cleanPath);

  // Search directories priority
  const searchCandidates = [
    path.join(CLIENT_DIR, cleanPath),
    path.join(CLIENT_DIR, baseName),
    path.join(MEDIA_DIR, cleanPath.replace(/^\/data\//, '')),
    path.join(MEDIA_DIR, baseName)
  ];

  for (const candidate of searchCandidates) {
    try {
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        return candidate;
      }
    } catch (e) {}
  }
  return null;
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Content-Length, Accept-Ranges');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    return res.end();
  }

  let reqPath = req.url === '/' ? '/index.html' : req.url;
  const filePath = resolveFile(reqPath);

  if (!filePath) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end(`404 Not Found: ${reqPath}`);
  }

  try {
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.setHeader('Accept-Ranges', 'bytes');

    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize || end >= fileSize) {
        res.setHeader('Content-Range', `bytes */${fileSize}`);
        res.writeHead(416, { 'Content-Type': 'text/plain' });
        return res.end('Requested range not satisfiable');
      }

      const chunkSize = (end - start) + 1;
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Content-Length': chunkSize,
        'Content-Type': contentType
      });

      if (req.method === 'HEAD') return res.end();
      return fs.createReadStream(filePath, { start, end }).pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': contentType
      });

      if (req.method === 'HEAD') return res.end();
      return fs.createReadStream(filePath).pipe(res);
    }
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`500 Internal Error: ${err.message}`);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Локальный сервер запущен на http://localhost:${PORT}`);
  console.log(`📂 Клиентские страницы:`);
  console.log(`   - Главная:    http://localhost:${PORT}/index.html`);
  console.log(`   - Урок 1:     http://localhost:${PORT}/03_lesson1.html`);
  console.log(`   - Урок 2:     http://localhost:${PORT}/04_lesson2.html`);
  console.log(`   - Урок 3:     http://localhost:${PORT}/05_lesson3.html`);
  console.log(`   - Урок 4:     http://localhost:${PORT}/06_lesson4.html`);
  console.log(`   - Урок 5:     http://localhost:${PORT}/07_lesson5.html`);
  console.log(`\n🎧 Аудиостриминг медитаций и видео активен!\n`);
});
