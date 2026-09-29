// Servidor estático mínimo para ver el anuncio en el navegador: node serve.mjs  ->  http://localhost:8080
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.dirname(fileURLToPath(import.meta.url));
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.woff2': 'font/woff2', '.wav': 'audio/wav', '.mp4': 'video/mp4', '.json': 'application/json' };
export function serve(port = 8080) {
  const srv = http.createServer((req, res) => {
    const u = decodeURIComponent(req.url.split('?')[0]);
    const f = path.join(root, u === '/' ? 'index.html' : u);
    if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end('404'); }
    res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' });
    fs.createReadStream(f).pipe(res);
  });
  return new Promise((ok) => srv.listen(port, () => ok(srv)));
}
if (process.argv[1] === fileURLToPath(import.meta.url)) { await serve(+process.env.PORT || 8080); console.log('http://localhost:' + (process.env.PORT || 8080)); }
