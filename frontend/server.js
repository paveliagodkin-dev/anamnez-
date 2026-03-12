// Minimal static SPA server — no dependencies, pure Node.js
// Serves dist/ and falls back to index.html for all unknown paths (React Router)
import { createServer } from 'http';
import { readFileSync, statSync, existsSync } from 'fs';
import { resolve, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const DIST = resolve(__dirname, 'dist');
const INDEX = resolve(DIST, 'index.html');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
  '.webp': 'image/webp',
};

createServer((req, res) => {
  const url = req.url.split('?')[0];
  const filePath = resolve(DIST, '.' + url);

  try {
    const stat = existsSync(filePath) && statSync(filePath);
    if (stat && stat.isFile()) {
      const type = MIME[extname(filePath)] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'public,max-age=31536000,immutable' });
      res.end(readFileSync(filePath));
    } else {
      // SPA fallback — все роуты React Router отдаём index.html
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
      res.end(readFileSync(INDEX));
    }
  } catch {
    res.writeHead(500);
    res.end('Server error');
  }
}).listen(PORT, '0.0.0.0', () => {
  console.log(`SPA server running on port ${PORT}`);
});
