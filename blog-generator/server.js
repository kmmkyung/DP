'use strict';

// 기획자용 로컬 웹 서버
// 실행: npm start → 브라우저에서 http://localhost:3000

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { crawlSite } = require('./lib/crawl');
const { buildManuscript } = require('./lib/template');
const { createZip } = require('./lib/zip');

const PORT = Number(process.env.PORT) || 3000;
const OUTPUT_DIR = path.join(__dirname, 'output');
const PUBLIC_DIR = path.join(__dirname, 'public');

let running = false; // 브라우저를 여러 개 띄우지 않도록 한 번에 하나만 처리

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 1e5) req.destroy();
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function normalizeUrl(input) {
  let s = String(input || '').trim();
  if (!s) throw new Error('URL을 입력해 주세요.');
  if (!/^https?:\/\//i.test(s)) s = `http://${s}`;
  const u = new URL(s); // 형식이 틀리면 여기서 에러
  return u.toString();
}

function jobId(url) {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const stamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  return `${stamp}_${new URL(url).hostname.replace(/[^a-z0-9.-]/gi, '')}`;
}

// output/<job>/ 아래 파일만 내보낸다 (../ 로 다른 폴더 접근 차단)
function resolveOutput(rel) {
  const full = path.resolve(OUTPUT_DIR, rel);
  if (!full.startsWith(OUTPUT_DIR + path.sep)) return null;
  return full;
}

// 파일 확장자 → 브라우저에 알려 줄 "파일 종류"(Content-Type). 이게 틀리면 브라우저가 CSS 를 CSS 로 읽지 않습니다.
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

// public/ 폴더 안의 "정적 파일"(index.html 이 불러 쓰는 CSS, 이미지, 글꼴)을 내려주기 위한 설정입니다.
// 정적 파일 = 서버가 계산하지 않고 파일 그대로 보내 주는 파일.
// 아래 확장자만 허용합니다. (.html, .json 등은 허용하지 않아 의도치 않은 파일 노출을 막습니다)
const STATIC_EXT = new Set(['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico', '.woff', '.woff2']);

// 요청 주소(예: /index.css)를 public/ 안의 실제 파일 경로로 바꿉니다. 내보내면 안 되는 요청이면 null 을 돌려줍니다.
//  - 허용 확장자가 아니면 null
//  - ../ 등으로 public/ 폴더 밖으로 나가려는 시도면 null (resolveOutput 과 같은 방식의 경로 탈출 방지)
function resolvePublic(pathname) {
  let rel;
  try {
    rel = decodeURIComponent(pathname.slice(1)); // 맨 앞의 / 를 떼고, %2e 같은 표기를 원래 글자로 되돌림
  } catch {
    return null; // 잘못된 % 표기
  }
  if (!rel || rel.includes('\0')) return null; // 빈 주소, 널 문자(파일 경로를 속이는 데 쓰임) 거절
  if (!STATIC_EXT.has(path.extname(rel).toLowerCase())) return null;
  const full = path.resolve(PUBLIC_DIR, rel);
  if (!full.startsWith(PUBLIC_DIR + path.sep)) return null;
  return full;
}

function serveFile(res, file, extraHeaders = {}) {
  fs.readFile(file, (err, data) => {
    if (err) return sendJson(res, 404, { error: '파일을 찾을 수 없습니다.' });
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', ...extraHeaders });
    res.end(data);
  });
}

async function handleGenerate(req, res) {
  if (running) return sendJson(res, 409, { error: '다른 사이트를 분석 중입니다. 끝난 뒤 다시 시도해 주세요.' });
  let url;
  let maxPages;
  try {
    const body = JSON.parse((await readBody(req)) || '{}');
    url = normalizeUrl(body.url);
    maxPages = Math.min(Math.max(Number(body.maxPages) || 8, 1), 15);
  } catch (err) {
    return sendJson(res, 400, { error: err.message });
  }

  running = true;
  const id = jobId(url);
  const dir = path.join(OUTPUT_DIR, id);
  try {
    const site = await crawlSite(url, dir, { maxPages, onProgress: (m) => console.log(m) });
    const manuscript = buildManuscript(site);
    fs.writeFileSync(path.join(dir, '원고.txt'), manuscript.text, 'utf8');
    fs.writeFileSync(path.join(dir, 'site.json'), JSON.stringify(site, null, 2), 'utf8');
    console.log(`완료: output/${id}`);
    sendJson(res, 200, { id, site, manuscript });
  } catch (err) {
    console.error(err);
    sendJson(res, 500, { error: `사이트를 분석하지 못했습니다: ${err.message.split('\n')[0]}` });
  } finally {
    running = false;
  }
}

function handleZip(res, id) {
  const dir = resolveOutput(id);
  if (!dir || !fs.existsSync(dir)) return sendJson(res, 404, { error: '결과를 찾을 수 없습니다.' });
  const files = fs.readdirSync(dir)
    .filter((f) => /\.(png|txt)$/.test(f))
    .sort()
    .map((f) => ({ name: f, data: fs.readFileSync(path.join(dir, f)) }));
  const zip = createZip(files);
  res.writeHead(200, {
    'Content-Type': 'application/zip',
    'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(id)}.zip`,
    'Content-Length': zip.length,
  });
  res.end(zip);
}

const server = http.createServer(async (req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost');
  try {
    if (req.method === 'GET' && pathname === '/') return serveFile(res, path.join(PUBLIC_DIR, 'index.html'));
    if (req.method === 'POST' && pathname === '/api/generate') return await handleGenerate(req, res);
    const zipMatch = pathname.match(/^\/zip\/([^/]+)$/);
    if (req.method === 'GET' && zipMatch) return handleZip(res, decodeURIComponent(zipMatch[1]));
    if (req.method === 'GET' && pathname.startsWith('/output/')) {
      const file = resolveOutput(decodeURIComponent(pathname.slice('/output/'.length)));
      if (!file) return sendJson(res, 403, { error: '접근할 수 없는 경로입니다.' });
      return serveFile(res, file);
    }
    // 위 주소들이 아니면 public/ 폴더의 정적 파일인지 확인합니다.
    // 예: index.html 의 <link href="index.css"> 때문에 브라우저가 보내는 GET /index.css
    // 허용되지 않는 요청(resolvePublic 이 null)이면 아래 404 로 넘어갑니다. 파일이 없으면 serveFile 이 404 를 보냅니다.
    if (req.method === 'GET') {
      const file = resolvePublic(pathname);
      // nosniff: 브라우저가 파일 내용을 보고 종류를 멋대로 추측하지 못하게 합니다.
      if (file) return serveFile(res, file, { 'X-Content-Type-Options': 'nosniff' });
    }
    sendJson(res, 404, { error: 'Not found' });
  } catch (err) {
    console.error(err);
    sendJson(res, 500, { error: err.message });
  }
});

server.listen(PORT, () => {
  console.log(`블로그 원고 생성기 실행 중 → http://localhost:${PORT}`);
  console.log('종료하려면 이 창에서 Ctrl + C');
  // 실행 파일(start-windows.bat / start-mac.command)에서 --open 으로 실행하면 브라우저를 자동으로 연다
  if (process.argv.includes('--open')) {
    const url = `http://localhost:${PORT}`;
    const cmd = process.platform === 'win32' ? `start "" "${url}"` : process.platform === 'darwin' ? `open "${url}"` : `xdg-open "${url}"`;
    exec(cmd);
  }
});
