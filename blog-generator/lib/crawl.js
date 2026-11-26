'use strict';

// 사이트 분석 + PC 스크린샷 촬영
// Playwright(헤드리스 Chromium)로 실제 브라우저처럼 페이지를 열어서
// 메뉴, 슬로건 후보, 메인 컬러, 서체, 페이지별 제목/문구를 추출한다.

// ─────────────────────────────────────────────
// [이 파일의 역할] 사이트를 "실제 브라우저처럼" 열어서 정보를 모으고 화면을 캡처하는 파일입니다.
// 이 프로젝트에서 가장 길고 어려운 파일이라, 읽는 순서를 먼저 알려 드립니다.
//
// [읽는 순서 추천]
//   1) 맨 아래 crawlSite() — 전체 순서를 지휘하는 함수 (여기부터!)
//   2) openPage / revealWholePage / capture / buildPageList / launchBrowser — crawlSite 가 부르는 도구들
//   3) 위쪽의 "브라우저 안에서 실행되는 함수들" — 어떤 데이터를 뽑는지 훑어보기
//
// [이 파일이 만드는 데이터] crawlSite 가 돌려주는 값 = 결과 폴더의 site.json 과 같은 모양
//   { url, title, siteName, description, menu[], sloganCandidates[], colors, fonts[], pages[...] }
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// [이 파일에서 쓰는 메소드(기본 제공 기능) 설명]
// 메소드 = 값 뒤에 점(.)을 찍어 부르는 기능입니다.   예) "abc".trim()   (값.기능이름())
// 설명은 MDN(JavaScript / Web API), Node.js, Playwright 공식 문서로 대조한 내용입니다.
//
// ■ 문자열 (String) — 글자 값 뒤에 점을 찍어 쓰는 기능
//   trim()  — 문자열 양 끝의 공백·줄바꿈을 지운 새 문자열을 돌려줍니다.
//       예) "  a ".trim() → "a"
//   split()  — 문자열을 구분자(글자나 정규식)에서 잘라 배열로 만듭니다.
//       예) "a,b".split(",") → ["a", "b"]
//   replace()  — 패턴(글자나 정규식)에 맞는 부분을 다른 글자로 바꾼 새 문자열을 돌려줍니다. 정규식 끝에 g 가 있으면 맞는 부분을 모두, 없으면 처음 하나만 바꿉니다. 원본은 그대로입니다.
//       예) "a-b-c".replace(/-/g, "_") → "a_b_c"
//   toLowerCase()  — 모든 글자를 소문자로 바꾼 새 문자열을 돌려줍니다.
//       예) "ABC".toLowerCase() → "abc"
//   padStart()  — 문자열이 정해진 길이가 될 때까지 앞쪽을 지정한 글자로 채웁니다.
//       예) "5".padStart(2, "0") → "05"
//   match()  — 정규식과 맞는 부분을 찾아 돌려줍니다. 하나도 없으면 null 입니다. 정규식에 g 가 있으면 맞는 부분 전부가 배열로 나옵니다.
//       예) "a1b22".match(/\d+/g) → ["1", "22"]
//   toString()  — URL 같은 값을 문자열로 바꿔 돌려줍니다.
//       예) new URL("http://a.com").toString() → "http://a.com/"
//   slice()  — 시작 위치부터 끝 위치 "앞"까지를 잘라낸 새 문자열/배열을 돌려줍니다. 원본은 바뀌지 않고, 끝을 생략하면 맨 끝까지 자릅니다.
//       예) "abcdef".slice(1, 3) → "bc"
//   includes()  — 문자열이 해당 글자를 포함하는지, 또는 배열에 해당 값이 들어 있는지 true/false 로 알려 줍니다.
//       예) ["a", "b"].includes("b") → true
//   test()  — 정규식이 문자열에 맞으면 true, 아니면 false 입니다. 맞는지 검사만 하고 맞는 부분을 꺼내지는 않습니다.
//       예) /^https?:/.test("http://a") → true
//
// ■ 배열 (Array) — 목록 값 뒤에 점을 찍어 쓰는 기능
//   map()  — 배열의 모든 항목에 함수를 적용하고, 그 결과들로 새 배열을 만듭니다. 원본은 바뀌지 않습니다.
//       예) [1, 2].map(function (x) { return x * 2; }) → [2, 4]
//   filter()  — 함수가 true 를 돌려주는 항목만 모아 새 배열을 만듭니다.
//       예) [1, 2, 3].filter(function (x) { return x > 1; }) → [2, 3]
//   join()  — 배열의 항목들을 구분자로 이어 붙여 하나의 문자열로 만듭니다.
//       예) ["a", "b"].join(", ") → "a, b"
//   sort()  — 배열을 정렬합니다. 새 배열을 만들지 않고 "원본 배열 자체"를 바꾸니 주의하세요. 비교 함수를 주지 않으면 값을 글자로 바꿔 비교합니다.
//       예) [3, 1, 2].sort(function (a, b) { return a - b; }) → [1, 2, 3]
//   push()  — 배열 맨 끝에 항목을 추가합니다. 원본 배열이 바뀝니다.
//       예) list.push("a")
//   find()  — 함수가 true 를 돌려주는 첫 번째 항목을 돌려줍니다. 없으면 undefined 입니다.
//   some()  — 조건에 맞는 항목이 하나라도 있으면 true 입니다.
//   every()  — 모든 항목이 조건에 맞으면 true 이고, 하나라도 안 맞으면 false 입니다.
//   forEach()  — 각 항목마다 함수를 실행합니다. 값을 돌려주지는 않습니다.
//
// ■ 숫자·날짜 (Math, Date)
//   Math.max()  — 주어진 숫자들 중 가장 큰 값을 돌려줍니다.
//       예) Math.max(1, 5) → 5
//   Math.min()  — 주어진 숫자들 중 가장 작은 값을 돌려줍니다. Math.min(Math.max(값, 1), 15) 처럼 쓰면 값을 1~15 범위로 제한합니다.
//       예) Math.min(20, 15) → 15
//   Math.abs()  — 부호를 뗀 값을 돌려줍니다.
//       예) Math.abs(-3) → 3
//   Math.round()  — 소수를 가장 가까운 정수로 반올림합니다.
//       예) Math.round(2.6) → 3
//
// ■ Set · Map (중복 없는 모음 / 이름표→값 표)
//   add()  — Set(중복 없는 모음)에 값을 넣습니다. 이미 있는 값이면 아무 일도 하지 않습니다.
//   has()  — Set 에 값이, 또는 Map 에 키가 들어 있는지 true/false 로 알려 줍니다.
//   get()  — Map(이름표→값 표)에서 키에 해당하는 값을 꺼냅니다. 없으면 undefined 입니다.
//   set()  — Map 에 키와 값을 저장합니다. 같은 키가 이미 있으면 값을 덮어씁니다.
//   entries()  — Map 안의 항목을 [키, 값] 쌍으로 하나씩 꺼낼 수 있는 목록으로 돌려줍니다.
//
// ■ JSON · 값 바꾸기 (변환)
//   String()  — 값을 문자열로 바꿉니다.
//       예) String(5) → "5"
//   parseFloat()  — 글자에서 소수 숫자를 읽습니다. "15px" 처럼 뒤에 단위가 붙어 있어도 앞의 숫자만 읽습니다.
//       예) parseFloat("15px") → 15
//
// ■ 파일·경로 (Node: fs, path)
//   path.join()  — 경로 조각들을 운영체제에 맞는 구분자(/ 또는 \)로 이어 붙입니다.
//       예) path.join("a", "b.txt") → "a/b.txt"
//   fs.mkdirSync()  — 폴더를 만듭니다. { recursive: true } 를 주면 중간 폴더가 없어도 한 번에 만들고, 이미 있어도 오류가 나지 않습니다.
//
// ■ 화면 요소 다루기 (브라우저 DOM)
//   document.querySelector()  — CSS 선택자("h1", ".card", "#url" 등)에 맞는 첫 번째 요소를 찾습니다. 없으면 null 입니다.
//   document.querySelectorAll()  — CSS 선택자에 맞는 요소를 전부 찾아 목록으로 돌려줍니다.
//   querySelector()  — 요소 "안쪽"에서 CSS 선택자에 맞는 첫 번째 요소를 찾습니다. 없으면 null 입니다.
//   querySelectorAll()  — 요소 안쪽에서 선택자에 맞는 요소를 전부 찾아 목록으로 돌려줍니다.
//   closest()  — 자기 자신부터 시작해 부모 방향으로 올라가며, 선택자에 맞는 첫 요소를 찾습니다. 없으면 null 입니다.
//       예) el.closest("header, nav") — 머리말/내비 안에 있는 요소인지 검사
//   matches()  — 요소가 해당 CSS 선택자에 맞으면 true 입니다.
//   getBoundingClientRect()  — 요소가 화면에서 차지하는 위치(top, left)와 크기(width, height)를 돌려줍니다. 이 코드에서는 크기가 0 이면 "안 보이는 요소"로
//       봅니다.
//   getAttribute()  — 요소의 속성(href, alt 등) 값을 읽습니다. 없으면 null 입니다.
//   hasAttribute()  — 요소에 해당 속성이 있는지 true/false 로 알려 줍니다.
//   compareDocumentPosition()  — 두 요소가 문서에서 어떤 위치 관계인지 숫자(비트 값)로 알려 줍니다. DOCUMENT_POSITION_FOLLOWING 비트가 켜져 있으면 "뒤에
//       있다"는 뜻입니다.
//   style.setProperty()  — 요소에 CSS 값을 직접 지정합니다. 세 번째 값에 "important" 를 주면 다른 스타일보다 우선합니다.
//       예) el.style.setProperty("display", "none", "important")
//   scrollBy()  — 페이지를 현재 위치에서 지정한 만큼 스크롤합니다.
//   scrollTo()  — 페이지를 지정한 좌표(예: 맨 위 0, 0)로 스크롤합니다.
//   getComputedStyle()  — 여러 CSS 규칙이 합쳐져 "최종적으로 적용된" 스타일 값을 읽습니다. (읽기만 가능)
//
// ■ 브라우저 기본 기능 (시간, 서버 요청, 클립보드)
//   setTimeout()  — 지정한 시간(밀리초) 뒤에 함수를 한 번 실행합니다.
//
// ■ 브라우저 조종 (Playwright)
//   chromium.launch()  — 사람 눈에 보이지 않는 브라우저(크롬 계열)를 실행합니다. channel: "chrome" 이면 설치된 Chrome 을 씁니다.
//   browser.newContext()  — 쿠키 등이 분리된 브라우저 프로필(context)을 만듭니다. 창 크기, 언어도 여기서 정합니다.
//   context.newPage()  — 프로필 안에 새 탭(page)을 엽니다.
//   page.goto()  — 탭에서 주소를 열고, 정해진 시점(load, networkidle 등)까지 기다립니다.
//   page.evaluate()  — 넘겨 준 함수를 "열려 있는 사이트 페이지 안에서" 실행하고, 결과 데이터를 돌려받습니다.
//   page.screenshot()  — 화면을 이미지 파일(PNG)로 저장합니다. fullPage 는 전체 페이지, clip 은 잘라낼 영역입니다.
//   page.waitForTimeout()  — 지정한 시간(밀리초)만 기다립니다. Playwright 공식 문서는 시간 기다리기가 불안정해질 수 있어 운영 코드에서는 권장하지 않는다고 안내합니다. 여기서는
//       애니메이션·영상이 끝나길 기다리려고 썼습니다.
//   page.url()  — 탭이 지금 열고 있는 주소를 돌려줍니다. 다른 주소로 이동(리다이렉트)된 뒤의 최종 주소를 알 수 있습니다.
//   browser.close()  — 브라우저를 닫습니다. 안 닫으면 보이지 않는 브라우저가 PC 에 계속 남습니다.
//
// ■ 새로 만들기 (new)
//   new Set  — 같은 값이 두 번 들어가지 않는 모음(Set)을 만듭니다.
//   new Map  — 키와 값을 짝지어 저장하는 표(Map)를 만듭니다.
//   new Promise  — 시간이 걸리는 일의 결과를 나중에 돌려주기로 한 약속(Promise)을 만듭니다. await 로 기다릴 수 있습니다.
//   new URL  — 주소 글자를 분석해 도메인(hostname), 경로(pathname) 등으로 나눠 줍니다. 형식이 틀리면 오류가 납니다.
// ─────────────────────────────────────────────

// fs: 파일/폴더 만들기, path: 경로 다루기, chromium: Playwright 가 조종하는 브라우저(크롬 계열)
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const VIEWPORT = { width: 1920, height: 1080 };
const FULLPAGE_MAX_HEIGHT = 15000;
const NAV_TIMEOUT = 30000;
const MAX_SUBPAGES_PER_MENU = 4;

const EXCLUDE_LINK = /login|logout|admin|sitemap|privacy|policy|개인정보|이용약관|로그인|로그아웃|회원가입|사이트맵/i;

// 주소 앞의 "www." 를 떼고 소문자로 맞춥니다.  WWW.Gosung.com → gosung.com
// (www 가 있든 없든 같은 사이트로 보려는 용도)
function stripWww(host) {
  return host.replace(/^www\./i, '').toLowerCase();
}

// 두 주소가 "같은 사이트"인지 검사합니다.
// 메뉴에 외부 링크(뉴스 기사, 유튜브)가 섞여 있어도 우리 사이트 안에서만 돌아다니기 위한 장치입니다. 주소 형식이 이상하면 false.
function sameSite(a, b) {
  try {
    return stripWww(new URL(a).hostname) === stripWww(new URL(b).hostname);
  } catch {
    return false;
  }
}

// 주소 뒤의 "#..."(같은 페이지 안의 위치 표시)를 지웁니다.  /a#top → /a
// 같은 페이지를 두 번 방문하지 않도록 주소를 비교할 때 씁니다.
function withoutHash(u) {
  try {
    const url = new URL(u);
    url.hash = '';
    return url.toString();
  } catch {
    return u;
  }
}

// 링크로 쓸 수 없는 href (#, javascript:, 현재 페이지 앵커)
// 반환값 true = 방문해도 되는 링크.
// javascript: / mailto: / tel: 링크와, 현재 페이지 안의 # 앵커 링크는 제외합니다.
function isUsableHref(href, currentUrl) {
  if (!href || /^(javascript|mailto|tel):/i.test(href)) return false;
  if (href.includes('#') && withoutHash(href) === withoutHash(currentUrl)) return false;
  return true;
}

// 메뉴 이름으로 파일 이름을 만듭니다. 파일 이름에 쓸 수 없는 글자(\ / : * ? " < > |)를 지우고,
// 공백은 _ 로 바꾸고, 30자까지만 씁니다.  예) "AI Solution" → "AI_Solution"
function safeFileName(name) {
  const cleaned = String(name)
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 30);
  return cleaned || 'page';
}

// ★ 가장 헷갈리기 쉬운 부분 ★
// 아래 함수들(hidePopupsInPage, extractSiteInfoInPage, extractPageInfoInPage)은 page.evaluate(함수) 로
// "열려 있는 사이트 페이지 안에서" 실행됩니다.
//   - 그래서 안에서 document(페이지의 HTML 구조), getComputedStyle(실제로 적용된 스타일) 같은 브라우저 기능을 쓸 수 있습니다.
//   - 반대로 이 파일 위쪽의 변수(예: VIEWPORT)나 Node 기능(fs, path)은 함수 안에서 쓸 수 없습니다.
//     같은 파일에 적혀 있어도 "실행되는 곳"이 다릅니다.
//   - 결과는 글자/숫자/배열 같은 "데이터"로만 돌려받을 수 있습니다. (HTML 요소 자체는 돌려받을 수 없음)
// ---------- 브라우저 안에서 실행되는 함수들 (page.evaluate) ----------

// 레이어 팝업("오늘 하루 보지 않기" 등) 숨기기
function hidePopupsInPage() {
  const SELECTORS = ['#hd_pop', '.hd_pops', '[id^="layer_pop"]', '[class*="layer_popup"]', '[class*="layerPopup"]', '[class*="main_popup"]'];
  let hidden = 0;
  for (const el of document.querySelectorAll(SELECTORS.join(','))) {
    el.style.setProperty('display', 'none', 'important');
    hidden++;
  }
  const KEYWORDS = /오늘\s*하루|하루\s*동안|다시\s*보지|24시간\s*동안/;
  for (const el of document.querySelectorAll('label, a, button, span, p, div')) {
    const t = (el.textContent || '').trim();
    if (t.length > 40 || !KEYWORDS.test(t)) continue;
    let cur = el;
    for (let i = 0; i < 12 && cur && cur !== document.body; i++) {
      const cs = getComputedStyle(cur);
      const r = cur.getBoundingClientRect();
      if ((cs.position === 'fixed' || cs.position === 'absolute') && r.width > 200) {
        cur.style.setProperty('display', 'none', 'important');
        hidden++;
        break;
      }
      cur = cur.parentElement;
    }
  }
  return hidden;
}

// 메인 페이지 한 장에서 사이트 전체 정보를 뽑아 한 덩어리 객체로 돌려줍니다.
// 아래 작은 함수들을 조합: extractMenu / extractSloganCandidates / extractColors / extractFonts + 제목·설명
// 홈 화면에서 사이트 전체 정보 추출
function extractSiteInfoInPage() {
  // 글자 정리: 여러 공백/줄바꿈을 한 칸 공백으로 줄이고 앞뒤 공백을 지웁니다.
  function clean(s) { return (s || '').replace(/\s+/g, ' ').trim(); }
  // <meta name="description" content="..."> 같은 정보를 읽는 도우미. name 또는 property(og:...)가 n 인 것을 찾아 content 값을 돌려줍니다.
  function meta(n) {
    const el = document.querySelector(`meta[name="${n}"], meta[property="${n}"]`);
    return el ? clean(el.getAttribute('content')) : '';
  }

  // --- GNB 메뉴 ---
  // 헤더/내비 영역의 모든 목록(ul)을 후보로 모은 뒤 점수가 가장 높은 것을 고른다.
  // (처음 찾은 목록을 쓰면 .gnb 안의 언어 선택 KOR/ENG 같은 것을 메뉴로 오인할 수 있음)
  function extractMenu() {
    const roots = ['#gnb', '.gnb', '#gnb_wrap', '.gnb_wrap', '#nav', '.nav', '#menu', 'header nav', 'nav', '#header', 'header', '#hd', '.header'];
    const LANG = /^(kor?|kr|eng?|en|chn?|cn|jpn?|jp|한국어|english|中文|日本語)$/i;
    const candidates = new Set();
    for (const sel of roots) {
      for (const root of document.querySelectorAll(sel)) {
        if (root.matches('ul')) candidates.add(root);
        root.querySelectorAll('ul').forEach(function (ul) { return candidates.add(ul); });
      }
    }
    let best = null;
    let bestScore = 0;
    const ordered = [...candidates].sort(function (x, y) {
      return x.compareDocumentPosition(y) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    });
    for (const ul of ordered) {
      if (ul.closest('[class*="lang" i], [id*="lang" i]')) continue;
      const lis = [...ul.children].filter(function (li) { return li.tagName === 'LI' && li.querySelector('a'); });
      if (lis.length < 2) continue;
      const names = lis.map(function (li) { return clean((li.querySelector('a') || li).textContent); });
      if (names.every(function (n) { return LANG.test(n); })) continue;
      const nested = lis.filter(function (li) { return li.querySelector('ul'); }).length;
      const score = lis.length + nested * 3;
      if (score > bestScore) {
        best = lis;
        bestScore = score;
      }
    }
    if (!best) return [];
    return best.map(function (li) {
      const links = [...li.querySelectorAll('a')];
      const top = li.querySelector(':scope > a, :scope > * > a') || links[0];
      return {
        name: clean(top.textContent),
        href: top.href,
        subs: links.filter(function (a) { return a !== top; }).map(function (a) {
          return { name: clean(a.textContent), href: a.href };
        }).filter(function (s) {
          return s.name;
        }),
      };
    }).filter(function (i) { return i.name; });
  }

  // --- 첫 화면에서 글자가 가장 큰 문구 = 슬로건 후보 ---
  function extractSloganCandidates() {
    const vh = window.innerHeight;
    const seen = new Set();
    const list = [];
    for (const el of document.querySelectorAll('h1, h2, h3, h4, p, strong, em, span, div, dt, dd, li')) {
      const hasOwnText = [...el.childNodes].some(function (n) { return n.nodeType === 3 && n.textContent.trim().length > 1; });
      if (!hasOwnText) continue;
      if (el.closest('header, nav, footer, #header, #hd, #gnb, .gnb, #footer, #ft')) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1 || r.top > vh || r.bottom < 0) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none') continue;
      const t = clean(el.innerText);
      if (t.length < 4 || t.length > 120 || seen.has(t)) continue;
      seen.add(t);
      list.push({ text: t, fontSize: parseFloat(cs.fontSize) || 0 });
    }
    return list.sort(function (a, b) { return b.fontSize - a.fontSize; }).slice(0, 5);
  }

  // --- 컬러: 채도가 있는 색 중 많이 쓰인 색 ---
  function extractColors() {
    // 색 변환 도우미 3개: toRgb("rgb(…)" 문자열 → 숫자 3개, 투명이면 null) / hsl(→ 채도·밝기) / hex(→ #135bec 형식)
    function toRgb(s) {
      const m = (s || '').match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
      if (p.length > 3 && p[3] === 0) return null;
      return p.slice(0, 3);
    }
    function hsl([r, g, b]) {
      r /= 255; g /= 255; b /= 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      const l = (max + min) / 2;
      const d = max - min;
      const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
      return { s, l };
    }
    function hex(rgb) { return '#' + rgb.map(function (v) { return Math.round(v).toString(16).padStart(2, '0'); }).join(''); }
    const score = new Map();
    function add(rgb, w) {
      if (!rgb) return;
      const { s, l } = hsl(rgb);
      if (s < 0.2 || l < 0.12 || l > 0.92) return;
      const k = hex(rgb);
      if (k === '#0000ee' || k === '#551a8b') return;
      score.set(k, (score.get(k) || 0) + w);
    }
    const els = [...document.querySelectorAll('body *')].slice(0, 5000);
    for (const el of els) {
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) continue;
      const cs = getComputedStyle(el);
      add(toRgb(cs.backgroundColor), Math.min(r.width * r.height, 500000) / 1000);
      if ([...el.childNodes].some(function (n) { return n.nodeType === 3 && n.textContent.trim(); })) add(toRgb(cs.color), 20);
    }
    const accents = [...score.entries()].sort(function (a, b) {
      return b[1] - a[1];
    }).slice(0, 3).map(function ([k]) { return k; });

    const bodyBg = toRgb(getComputedStyle(document.body).backgroundColor) || toRgb(getComputedStyle(document.documentElement).backgroundColor) || [255, 255, 255];
    return { accents, background: hex(bodyBg), backgroundLightness: hsl(bodyBg).l };
  }

  // 본문(body)과 첫 제목(h1~h3)의 첫 번째 글꼴 이름. serif / sans-serif 같은 일반 이름은 제외합니다.
  function extractFonts() {
    function first(el) {
      if (!el) return '';
      const f = getComputedStyle(el).fontFamily.split(',')[0].replace(/["']/g, '').trim();
      return /^(serif|sans-serif|monospace|system-ui|-apple-system|inherit)$/i.test(f) ? '' : f;
    }
    const set = new Set([first(document.body), first(document.querySelector('h1, h2, h3'))].filter(Boolean));
    return [...set];
  }

  const title = clean(document.title);
  const logoImg = document.querySelector('header img[alt], #header img[alt], .logo img[alt], h1 img[alt]');
  return {
    title,
    siteName: meta('og:site_name'),
    logoAlt: logoImg ? clean(logoImg.getAttribute('alt')) : '',
    description: meta('description') || meta('og:description'),
    menu: extractMenu(),
    sloganCandidates: extractSloganCandidates(),
    colors: extractColors(),
    fonts: extractFonts(),
  };
}

// 페이지 하나에서 "글 + 구성 요소"를 뽑습니다. 원고 문장의 재료가 됩니다. (메뉴 페이지와 하위 페이지 모두 이 함수를 씁니다)
// 돌려주는 값: { title, headings[], paragraphs[], hero{ title, sub }, features{ years[], stats[], cards, boardRows, map, ... } }
// 각 페이지의 제목/본문 문구 + 페이지 구성 요소(연혁, 수치, 지도, 폼, 슬라이드 등) 추출
// 원고에서 "이 페이지에 실제로 무엇이 있는지"를 문장으로 만들기 위한 재료
function extractPageInfoInPage() {
  function clean(s) { return (s || '').replace(/\s+/g, ' ').trim(); }
  const LAYOUT = 'header, nav, footer, #header, #hd, #gnb, .gnb, #footer, #ft, .allMenu';
  function skip(el) { return el.closest(LAYOUT); }
  // 실제로 화면에 보이는 요소인가 (크기가 있고 숨김 처리되지 않음)
  function visible(el) {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none';
  }
  // 중복 제거 (Set)
  function uniq(arr) { return [...new Set(arr)]; }
  // 요소가 "자기 몫의 글자"를 min 자 이상 가졌는가.
  // (글자가 자식 요소 안에만 있으면 false → 같은 글이 부모와 자식에서 중복으로 잡히는 것을 막습니다)
  function ownText(el, min) {
    return [...el.childNodes].some(function (n) {
      return n.nodeType === 3 && n.textContent.trim().length >= min;
    });
  }
  // 페이지 맨 위에서부터의 거리 (스크롤 위치와 무관한 절대 위치)
  function absTop(el) { return el.getBoundingClientRect().top + window.scrollY; }

  const headings = uniq([...document.querySelectorAll('h1, h2, h3, h4')]
    .filter(function (el) { return !skip(el) && visible(el); })
    .map(function (el) { return clean(el.innerText); })
    .filter(function (t) { return t.length >= 2 && t.length <= 80; })).slice(0, 12);
  const paragraphs = uniq([...document.querySelectorAll('p, dd, li, div, span')]
    .filter(function (el) { return ownText(el, 20) && !skip(el) && visible(el); })
    .map(function (el) { return clean(el.innerText); })
    .filter(function (t) { return t.length >= 20 && t.length <= 300; })).slice(0, 12);

  const topTexts = [...document.querySelectorAll('h1, h2, h3, p, strong, span, div')]
    .filter(function (el) { return ownText(el, 2) && !skip(el) && visible(el) && absTop(el) < 900; })
    .map(function (el) {
      return { text: clean(el.innerText), size: parseFloat(getComputedStyle(el).fontSize) || 0, top: absTop(el) };
    })
    .filter(function (x) { return x.text.length >= 2 && x.text.length <= 100; });
  const heroTitle = topTexts.slice().sort(function (a, b) { return b.size - a.size; })[0];
  const heroSub = heroTitle && topTexts
    .filter(function (x) { return x.top > heroTitle.top && x.text !== heroTitle.text && x.text.length >= 8 && x.size >= 15; })
    .sort(function (a, b) { return a.top - b.top; })[0];

  const bodyText = clean([...document.querySelectorAll('body *')]
    .filter(function (el) { return !skip(el) && ownText(el, 1); })
    .map(function (el) { return el.innerText; }).join(' '));

  const years = uniq((bodyText.match(/\b(19[5-9]\d|20[0-3]\d)(?=\s*[년.\-~]|\s|$)/g) || []).map(Number)).sort(function (a, b) {
    return a - b;
  });

  const stats = uniq([...document.querySelectorAll('p, li, dd, dt, strong, span, em, h3, h4, div')]
    .filter(function (el) { return ownText(el, 2) && !skip(el) && visible(el); })
    .map(function (el) { return clean(el.innerText); })
    .filter(function (t) { return t.length <= 60 && /\d[\d,.]*\s?(조|억|만|천)?\s?(원|달러|%|년|개국|건|명|개사|배|대)/.test(t); })).slice(0, 5);

  // 선택자(sel)에 해당하는, 본문 영역에서 보이는 요소의 개수
  function count(sel) {
    return [...document.querySelectorAll(sel)].filter(function (el) { return !skip(el) && visible(el); }).length;
  }
  const bigImages = [...document.querySelectorAll('img')].filter(function (img) {
    return !skip(img) && img.getBoundingClientRect().width >= 300;
  }).length;

  let cards = 0;
  for (const list of document.querySelectorAll('ul, ol, div')) {
    if (skip(list)) continue;
    const kids = [...list.children].filter(function (c) {
      return visible(c) && c.querySelector('img, [style*="background"]') && clean(c.innerText).length > 0;
    });
    if (kids.length >= 3 && kids.length > cards) cards = kids.length;
  }

  const boardRows = [...document.querySelectorAll('tr, li')]
    .filter(function (el) {
      return !skip(el) && visible(el) && /\b20\d{2}[.\-/]\d{1,2}[.\-/]\d{1,2}\b/.test(el.textContent);
    }).length;

  const inputs = [...document.querySelectorAll('input, textarea, select')]
    .filter(function (el) {
      return !skip(el) && visible(el) && !/hidden|search|submit|button|checkbox|radio/i.test(el.type || '') && !/search|keyword|stx|sfl/i.test(el.name || '');
    }).length;

  // 이 페이지가 불러오는 외부 스크립트 주소들을 한 줄 글자로 (gsap, swiper 같은 라이브러리 이름 찾기용).
  // 파일 하나로 합쳐 둔 사이트는 못 찾는 한계가 있습니다.
  const scripts = [...document.querySelectorAll('script[src]')].map(function (s) { return s.src.toLowerCase(); }).join(' ');

  return {
    title: clean(document.title),
    headings,
    paragraphs,
    hero: heroTitle ? { title: heroTitle.text, sub: heroSub ? heroSub.text : '' } : null,
    features: {
      years: years.length >= 3 ? years : [],
      stats,
      bigImages,
      cards,
      sliders: count('.swiper, .swiper-container, .slick-slider, .owl-carousel, .bx-wrapper'),
      videos: document.querySelectorAll('video, iframe[src*="vimeo"], iframe[src*="youtube"], iframe[src*="youtu.be"]').length,
      map: !!document.querySelector('iframe[src*="map"], #map, .map_wrap, .root_daum_roughmap, [id*="map" i] canvas') || /dapi\.kakao\.com|map\.naver|maps\.google|openapi\.map/.test(scripts),
      formInputs: inputs,
      tables: count('table'),
      boardRows,
      downloads: [...document.querySelectorAll('a[href]')].filter(function (a) {
        return !skip(a) && (/\.(pdf|zip|pptx?|hwp)(\?|$)/i.test(a.href) || a.hasAttribute('download') || /다운로드|download/i.test(a.textContent));
      }).length,
      libs: ['gsap', 'scrolltrigger', 'swiper', 'slick', 'aos', 'fullpage', 'lenis', 'three']
        .filter(function (k) { return scripts.includes(k) || (k === 'aos' && document.querySelector('[data-aos]')); }),
    },
  };
}

// 여기서부터는 "내 PC(Node)" 쪽에서 실행되는 코드입니다. 위의 page.evaluate 함수들과 실행되는 곳이 다릅니다.
// page = Playwright 가 조종하는 브라우저 탭 하나를 뜻합니다.
// ---------- Node 쪽 로직 ----------

// 페이지를 열고 "캡처할 준비"까지 마칩니다.
//   1) 네트워크가 잠잠해질 때까지 기다리며 열기(networkidle, 최대 30초).
//      채팅 위젯처럼 계속 통신하는 사이트는 시간 초과가 나므로, 그때는 load(기본 로딩 완료) 기준으로 다시 시도합니다.
//   2) 메인 비주얼 애니메이션이 끝나도록 1.5초 더 기다림 (배경 영상이 있으면 3.5초 추가)
//   3) 팝업 숨기기
async function openPage(page, url) {
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: NAV_TIMEOUT });
  } catch (err) {
    if (!/Timeout/i.test(err.message)) throw err;
    await page.goto(url, { waitUntil: 'load', timeout: NAV_TIMEOUT });
  }
  await page.waitForTimeout(1500);
  const hasVideo = await page.evaluate(function () {
    return !!document.querySelector('video, iframe[src*="vimeo"], iframe[src*="youtube"]');
  });
  if (hasVideo) await page.waitForTimeout(3500);
  await page.evaluate(hidePopupsInPage);
}

// 스크롤을 끝까지 한 번 내려서 지연 로딩 이미지/스크롤 애니메이션을 모두 띄운 뒤 맨 위로
async function revealWholePage(page) {
  await page.evaluate(async function () {
    const step = window.innerHeight * 0.8;
    for (let i = 0; i < 40; i++) {
      window.scrollBy(0, step);
      await new Promise(function (r) { return setTimeout(r, 150); });
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight) break;
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(800);
}

// 스크린샷을 2장 찍어 파일로 저장하고 파일 이름을 돌려줍니다.
//   - 첫 화면(예: 01_MAIN.png): 스크롤하기 "전"의 현재 화면 1920x1080. 사람이 처음 본 모습 그대로.
//   - 전체 페이지(예: 01_MAIN_full.png): 끝까지 스크롤해 숨은 내용을 띄운 뒤 위에서 아래까지. clip 으로 최대 15000px 까지만.
async function capture(page, outDir, baseName) {
  const first = `${baseName}.png`;
  await page.screenshot({ path: path.join(outDir, first) });

  await revealWholePage(page);
  const height = await page.evaluate(function () { return document.documentElement.scrollHeight; });
  const full = `${baseName}_full.png`;
  await page.screenshot({
    path: path.join(outDir, full),
    fullPage: true,
    clip: { x: 0, y: 0, width: VIEWPORT.width, height: Math.min(height, FULLPAGE_MAX_HEIGHT) },
  });
  return { first, full };
}

// 메뉴(menu) → 방문할 페이지 목록을 만듭니다. 맨 앞에 MAIN(메인)을 넣고, 메뉴마다 아래를 처리합니다.
//   제외 이름(로그인 등) 건너뜀 → 방문 주소 결정 → 같은 사이트가 아니거나 이미 넣은 주소면 건너뜀 → maxPages 에 닿으면 중단
// 돌려주는 값: [{ name, url, subs[], subLinks[], isHome }]
// GNB 결과를 "방문할 페이지 목록"으로 정리
function buildPageList(homeUrl, menu, maxPages) {
  const pages = [{ name: 'MAIN', url: homeUrl, subs: [], isHome: true }];
  const seen = new Set([withoutHash(homeUrl)]);
  for (const item of menu) {
    if (pages.length >= maxPages) break;
    if (EXCLUDE_LINK.test(item.name)) continue;
    const candidates = [item.href, ...item.subs.map(function (s) { return s.href; })];
    const href = candidates.find(function (h) {
      return isUsableHref(h, homeUrl) && sameSite(h, homeUrl) && !EXCLUDE_LINK.test(h);
    });
    if (!href) continue;
    const key = withoutHash(href);
    if (seen.has(key)) continue;
    seen.add(key);
    const subLinks = item.subs.filter(function (s) {
      return s.name !== item.name && isUsableHref(s.href, homeUrl) && sameSite(s.href, homeUrl) && withoutHash(s.href) !== key;
    });
    pages.push({ name: item.name, url: href, subs: item.subs.map(function (s) { return s.name; }).filter(function (n) {
      return n !== item.name;
    }), subLinks });
  }
  return pages;
}

// PC에 설치된 Google Chrome을 우선 사용한다.
// 번들 Chromium에는 H.264 등 일부 코덱이 없어 배경 동영상이 빈 화면으로 찍힐 수 있기 때문
// (Playwright 문서 browsers.md "Media codecs" 참고). Chrome이 없으면 번들 Chromium 사용.
// 반환값: Playwright 브라우저 객체. 크롬이 설치되어 있으면 channel: "chrome" 으로 실행하고,
// 없으면 오류가 나므로 catch 에서 내장 Chromium 으로 대체합니다.
async function launchBrowser(onProgress) {
  try {
    const browser = await chromium.launch({ channel: 'chrome' });
    onProgress('설치된 Google Chrome으로 캡처합니다');
    return browser;
  } catch {
    onProgress('Google Chrome이 없어 내장 Chromium으로 캡처합니다 (배경 동영상이 안 보일 수 있음)');
    return chromium.launch();
  }
}

// [전체 지휘자] 사이트 분석과 캡처를 처음부터 끝까지 진행합니다. server.js 의 handleGenerate 가 이 함수를 부릅니다.
//   ① 브라우저 열기 → ② 메인을 열어 사이트 정보 추출 → ③ 방문할 페이지 목록 만들기
//   ④ 페이지마다: 열기 → 캡처 → 정보 추출 → (하위 페이지는 캡처 없이 정보만) → 결과에 추가
//   ⑤ 브라우저 닫기(finally) → 결과 돌려주기
/**
 * @param {string} startUrl 분석할 홈페이지 주소
 * @param {string} outDir 스크린샷 저장 폴더
 * @param {{maxPages?: number, onProgress?: (msg: string) => void}} options
 */
async function crawlSite(startUrl, outDir, { maxPages = 8, onProgress = function () {} } = {}) {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await launchBrowser(onProgress);
  try {
    const context = await browser.newContext({
      viewport: VIEWPORT,
      locale: 'ko-KR',
      ignoreHTTPSErrors: true,
    });
    const page = await context.newPage();

    onProgress(`메인 페이지 여는 중: ${startUrl}`);
    await openPage(page, startUrl);
    const homeUrl = page.url();
    const site = await page.evaluate(extractSiteInfoInPage);
    const pageList = buildPageList(homeUrl, site.menu, maxPages);

    const pages = [];
    for (let i = 0; i < pageList.length; i++) {
      const p = pageList[i];
      const baseName = `${String(i + 1).padStart(2, '0')}_${safeFileName(p.name)}`;
      onProgress(`[${i + 1}/${pageList.length}] ${p.name} 캡처 중`);
      try {
        if (!p.isHome) await openPage(page, p.url);
        const shots = await capture(page, outDir, baseName);
        const info = await page.evaluate(extractPageInfoInPage);
        const subPages = [];
        // 원고에 쓸 정보가 많은 하위 페이지(연혁, 오시는길, 카탈로그 등)를 먼저 읽는다
        function informative(n) { return /연혁|history|오시는|location|map|문의|contact|카[달탈]로그|catalog|브로슈어|인증|특허/i.test(n) ? 0 : 1; }
        const subLinks = (p.subLinks || []).slice().sort(function (a, b) { return informative(a.name) - informative(b.name); });
        for (const sub of subLinks.slice(0, MAX_SUBPAGES_PER_MENU)) {
          onProgress(`  └ ${sub.name} 내용 확인 중`);
          try {
            await openPage(page, sub.href);
            await revealWholePage(page);
            subPages.push({ name: sub.name, url: sub.href, ...(await page.evaluate(extractPageInfoInPage)) });
          } catch (err) {
            subPages.push({ name: sub.name, url: sub.href, error: err.message.split('\n')[0] });
          }
        }
        pages.push({ ...p, ...info, subPages, screenshot: shots.first, screenshotFull: shots.full });
      } catch (err) {
        pages.push({ ...p, error: err.message.split('\n')[0] });
      }
    }

    return { url: homeUrl, ...site, pages };
  } finally {
    // 성공이든 실패든 브라우저는 반드시 닫습니다. (안 닫으면 보이지 않는 브라우저가 PC 에 계속 남습니다)
    await browser.close();
  }
}

// 다른 파일(server.js 등)이 가져다 쓸 수 있게 내보내는 함수들. crawlSite 가 핵심이고 나머지는 재사용/테스트용입니다.
module.exports = { crawlSite, buildPageList, safeFileName };
