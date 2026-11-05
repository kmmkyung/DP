'use strict';

// 기획자용 로컬 웹 서버
// 실행: npm start → 브라우저에서 http://localhost:3000

// ─────────────────────────────────────────────
// [이 파일의 역할]
// 기획자의 PC 안에서 돌아가는 "작은 웹 서버"입니다. (npm start 로 실행, 주소 http://localhost:3000)
// 브라우저(public/index.html 화면)가 보낸 요청을 받아서 일을 시키고, 결과를 돌려줍니다.
//
// [처리하는 주소]
//   GET  /               → public/index.html (화면)
//   GET  /index.css 등   → public/ 폴더의 정적 파일 (CSS, 이미지 등)
//   POST /api/generate   → 사이트 분석 + 원고 생성 (핵심: handleGenerate)
//   GET  /output/...     → 결과 폴더의 캡처 이미지, 원고 파일
//   GET  /zip/<결과폴더> → 이미지 + 원고를 ZIP 으로 묶어 다운로드
//
// [일의 흐름]
//   화면 → POST /api/generate → crawlSite(lib/crawl.js: 사이트를 열고 캡처)
//        → buildManuscript(lib/template.js: 원고 작성) → output/ 에 저장 → 결과를 화면으로 돌려줌
//
// [읽는 순서 추천] 맨 아래 http.createServer(주소 분배) → handleGenerate(핵심) → 나머지 보조 함수
// ─────────────────────────────────────────────
//
// 사용하는 모듈. require = "다른 파일/기능을 가져다 쓴다"는 뜻입니다.
//   http          : 웹 서버를 만드는 Node 기본 기능 (따로 설치할 필요 없음)
//   fs            : 파일 읽기/쓰기
//   path          : 파일 경로를 안전하게 다루기 (Windows 와 Mac 의 경로 구분자 차이를 알아서 처리)
//   child_process : 다른 프로그램 실행 (여기서는 브라우저 자동 열기에만 사용)
const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
// 우리가 만든 파일들: 사이트 분석(crawl), 원고 작성(template), ZIP 만들기(zip)
const { crawlSite } = require('./lib/crawl');
const { buildManuscript } = require('./lib/template');
const { createZip } = require('./lib/zip');

// 서버가 열리는 포트(번호표). 환경 변수 PORT 가 있으면 그 값, 없으면 3000.
// 다른 프로그램이 3000번을 쓰고 있다면 다른 번호로 실행할 수 있습니다. 예) Mac: PORT=3001 node server.js
// __dirname = 이 파일이 있는 폴더. 그 아래 output(결과물 저장)과 public(화면 파일) 폴더를 가리킵니다.
const PORT = Number(process.env.PORT) || 3000;
const OUTPUT_DIR = path.join(__dirname, 'output');
const PUBLIC_DIR = path.join(__dirname, 'public');

// 지금 분석 중인지 표시하는 깃발. true 이면 새 요청을 거절합니다.
// (브라우저를 동시에 여러 개 띄우면 PC 가 느려지고 결과가 섞이기 때문)
let running = false; // 브라우저를 여러 개 띄우지 않도록 한 번에 하나만 처리

// JSON(데이터를 글자로 표현한 형식)으로 응답을 보냅니다.
//   status: 결과 번호 (200 성공 / 400 잘못된 요청 / 403 금지 / 404 없음 / 409 이미 작업 중 / 500 서버 오류)
//   body  : 화면에 돌려줄 내용(객체). JSON.stringify 로 글자로 바꿔서 보냅니다.
function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

// 브라우저가 보낸 요청 "본문"(여기서는 입력한 URL 등)을 끝까지 읽어서 글자로 돌려줍니다.
// 데이터는 한 번에 오지 않고 조각(chunk)으로 나눠 도착하므로, data 이벤트마다 이어 붙이고 end 가 오면 완료입니다.
// 100KB(1e5)를 넘으면 연결을 끊어서, 누군가 거대한 데이터를 보내 서버를 괴롭히는 것을 막습니다.
// Promise = "나중에 결과가 나오는 약속". 호출하는 쪽에서 await 로 기다릴 수 있습니다.
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

// 입력한 주소를 정리합니다.   "gosungeng.co.kr" → "http://gosungeng.co.kr/"
//   - 앞뒤 공백 제거, http:// 나 https:// 가 없으면 http:// 를 붙임 (대부분의 사이트가 https 로 자동 이동시킵니다)
//   - new URL() 로 주소 형식을 검사: 이상한 주소면 여기서 오류가 나고, 부른 쪽(handleGenerate)이 400 으로 알려 줍니다.
function normalizeUrl(input) {
  let s = String(input || '').trim();
  if (!s) throw new Error('URL을 입력해 주세요.');
  if (!/^https?:\/\//i.test(s)) s = `http://${s}`;
  const u = new URL(s); // 형식이 틀리면 여기서 에러
  return u.toString();
}

// 결과 폴더 이름을 만듭니다.  예) 20261103-100344_gosungeng.co.kr  (날짜시간_도메인)
// pad: 숫자를 두 자리로 맞춤 (5 → "05"). 도메인에서 폴더 이름에 쓸 수 없는 글자는 지웁니다.
function jobId(url) {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const stamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  return `${stamp}_${new URL(url).hostname.replace(/[^a-z0-9.-]/gi, '')}`;
}

// [보안] 요청 주소로 파일을 내보낼 때 "../" 로 위쪽 폴더(예: server.js)를 읽어 가는 것을 막는 함수입니다.
// path.resolve 가 ../ 를 정리한 "최종 경로"를 계산하고, 그 경로가 output 폴더 안이 아니면 null 을 돌려줍니다.
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

// 파일 하나를 읽어서 응답으로 보냅니다.
//   - 확장자로 파일 종류(MIME)를 정해 알려 줌. 모르는 종류는 application/octet-stream(그냥 데이터)
//   - 읽기 실패(파일 없음 등)면 404 JSON 을 보냄
//   - extraHeaders: 필요할 때 추가로 붙이는 응답 머리말 (정적 파일의 nosniff 등)
function serveFile(res, file, extraHeaders = {}) {
  fs.readFile(file, (err, data) => {
    if (err) return sendJson(res, 404, { error: '파일을 찾을 수 없습니다.' });
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', ...extraHeaders });
    res.end(data);
  });
}

// [핵심] "원고 만들기" 요청(POST /api/generate)을 처리합니다.
// 순서: ① 동시 실행 검사 → ② 입력 검사 → ③ 사이트 분석(crawlSite) → ④ 원고 작성(buildManuscript) → ⑤ 저장 → ⑥ 응답
async function handleGenerate(req, res) {
  // ① 이미 다른 분석이 진행 중이면 거절(409)합니다.
  if (running) return sendJson(res, 409, { error: '다른 사이트를 분석 중입니다. 끝난 뒤 다시 시도해 주세요.' });
  // ② 입력 검사: 화면이 보낸 데이터를 읽고 URL 을 정리합니다. 잘못되면 400(잘못된 요청)으로 이유를 알려 줍니다.
  let url;
  let maxPages;
  try {
    const body = JSON.parse((await readBody(req)) || '{}');
    url = normalizeUrl(body.url);
    // 페이지 수는 1~15 로 제한합니다. (Number(...) || 8 : 숫자가 아니면 기본값 8)
    maxPages = Math.min(Math.max(Number(body.maxPages) || 8, 1), 15);
  } catch (err) {
    return sendJson(res, 400, { error: err.message });
  }

  // 여기부터 "분석 중". 아래 finally 에서 반드시 해제합니다.
  running = true;
  const id = jobId(url);
  const dir = path.join(OUTPUT_DIR, id);
  try {
    // ③ 사이트를 열어 분석하고 캡처합니다. 1~2분 걸릴 수 있어 await 로 기다립니다.
    // onProgress: 진행 상황을 이 서버를 켠 창(터미널)에 출력
    const site = await crawlSite(url, dir, { maxPages, onProgress: (m) => console.log(m) });
    // ④ 분석 결과로 원고를 만듭니다. (AI 를 쓰지 않는 템플릿 치환 방식이라 외부 호출이 없습니다)
    const manuscript = buildManuscript(site);
    // ⑤ 결과 저장: 원고.txt(복사용 평문), site.json(분석 데이터 원본: 나중에 원고만 다시 쓰거나 확인할 때 사용)
    fs.writeFileSync(path.join(dir, '원고.txt'), manuscript.text, 'utf8');
    fs.writeFileSync(path.join(dir, 'site.json'), JSON.stringify(site, null, 2), 'utf8');
    console.log(`완료: output/${id}`);
    // ⑥ 화면에 결과를 돌려줍니다. 화면의 render 함수가 이걸 받아 미리보기를 그립니다.
    sendJson(res, 200, { id, site, manuscript });
  // 분석 중 어떤 오류든(접속 실패, 시간 초과 등) 여기로 옵니다.
  // 터미널에는 자세한 오류를 남기고, 화면에는 첫 줄만 알려 줍니다.
  } catch (err) {
    console.error(err);
    sendJson(res, 500, { error: `사이트를 분석하지 못했습니다: ${err.message.split('\n')[0]}` });
  // 성공이든 실패든 마지막에 항상 실행: "분석 중" 표시를 풀어서 다음 요청을 받을 수 있게 합니다.
  // (이걸 빼먹으면 한 번 오류가 난 뒤 서버가 계속 "분석 중"으로 막힙니다)
  } finally {
    running = false;
  }
}

// 결과 폴더의 이미지(.png)와 원고(.txt)를 ZIP 하나로 묶어 다운로드시킵니다.
//   - id 는 resolveOutput 으로 검사해서 output 폴더 밖은 막음
//   - Content-Disposition: attachment → 브라우저가 화면에 열지 않고 "파일로 저장"하게 함
//   - filename*=UTF-8''... + encodeURIComponent: 한글이 들어간 파일 이름이 깨지지 않게 하는 표기법
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

// 요청 분배기: 요청이 올 때마다 실행되어 "주소(pathname)와 방식(GET/POST)"을 보고 담당 함수에 연결합니다.
//   new URL(req.url, "http://localhost"): 요청 주소에서 "?..." 부분을 뺀 경로(pathname)만 뽑는 데 사용
// 위에서부터 순서대로 검사하고, 처음 맞는 것에서 return 으로 끝냅니다. 어디에도 안 맞으면 마지막에 404.
const server = http.createServer(async (req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost');
  try {
    if (req.method === 'GET' && pathname === '/') return serveFile(res, path.join(PUBLIC_DIR, 'index.html'));
    if (req.method === 'POST' && pathname === '/api/generate') return await handleGenerate(req, res);
    // /zip/20261103-100344_gosungeng.co.kr 처럼 /zip/ 뒤에 이름이 오는 주소인지 검사하는 정규식
    const zipMatch = pathname.match(/^\/zip\/([^/]+)$/);
    if (req.method === 'GET' && zipMatch) return handleZip(res, decodeURIComponent(zipMatch[1]));
    // 결과 폴더의 파일(캡처 이미지, 원고)을 내보냅니다. resolveOutput 이 폴더 밖 접근을 막고, 막히면 403(금지)을 보냅니다.
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
  // 위 처리 중 예상 못 한 오류가 나도 서버가 꺼지지 않도록 여기서 받아서 500 으로 응답합니다.
  } catch (err) {
    console.error(err);
    sendJson(res, 500, { error: err.message });
  }
});

// 서버를 켭니다. 켜지면 안쪽 함수가 한 번 실행됩니다.
// [주의: 보안] 주소(host)를 지정하지 않아서 같은 네트워크의 다른 PC 에서도 접속할 수 있습니다.
// 자기 PC 에서만 쓰게 하려면 server.listen(PORT, "127.0.0.1", ...) 처럼 주소를 지정해야 합니다. (아직 적용 전)
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
