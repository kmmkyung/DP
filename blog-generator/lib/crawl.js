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
// fs: 파일/폴더 만들기, path: 경로 다루기, chromium: Playwright 가 조종하는 브라우저(크롬 계열)
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

// 설정값 모음
//   VIEWPORT              : 브라우저 창 크기(PC 화면 기준 1920x1080). 캡처 이미지의 크기가 됩니다.
//   FULLPAGE_MAX_HEIGHT   : "전체 페이지" 캡처의 최대 높이. 너무 긴 페이지는 위에서부터 이 높이까지만 찍습니다.
//   NAV_TIMEOUT           : 페이지 하나를 여는 데 기다려 줄 최대 시간 (30초, 단위 ms)
//   MAX_SUBPAGES_PER_MENU : 메뉴 하나당 "캡처 없이 내용만 읽어 올" 하위 페이지 최대 개수
const VIEWPORT = { width: 1920, height: 1080 };
const FULLPAGE_MAX_HEIGHT = 15000; // 너무 긴 페이지는 위에서부터 이 높이까지만 캡처
const NAV_TIMEOUT = 30000;
const MAX_SUBPAGES_PER_MENU = 4; // 메뉴당 캡처 없이 내용만 읽어 올 하위 페이지 수

// 메뉴 중 원고에 넣을 필요가 없는 링크
// 정규식: 아래 단어 중 하나라도 메뉴 이름(또는 주소)에 들어 있으면 제외합니다. i = 대소문자 구분 안 함
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
  // 1단계: 이름(아이디/클래스)이 팝업처럼 생긴 요소를 찾아 숨깁니다. 그누보드 팝업(#hd_pop) 등.
  // [id^="layer_pop"] = 아이디가 layer_pop 으로 시작 / [class*="layer_popup"] = 클래스에 layer_popup 이 포함
  const SELECTORS = ['#hd_pop', '.hd_pops', '[id^="layer_pop"]', '[class*="layer_popup"]', '[class*="layerPopup"]', '[class*="main_popup"]'];
  let hidden = 0;
  for (const el of document.querySelectorAll(SELECTORS.join(','))) {
    // display: none = 화면에서 완전히 제거(캡처에 안 찍힘). important 는 사이트의 다른 스타일보다 우선시키는 표시
    el.style.setProperty('display', 'none', 'important');
    hidden++;
  }
  // 2단계: "오늘 하루 보지 않기" 같은 문구가 있는 요소를 찾고, 부모 쪽으로 올라가며(최대 12단계)
  // 화면에 고정된 큰 상자(fixed/absolute, 폭 200px 이상)를 찾아 숨깁니다. 이름으로는 못 찾는 팝업을 잡기 위한 방법입니다.
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
  const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();
  // <meta name="description" content="..."> 같은 정보를 읽는 도우미. name 또는 property(og:...)가 n 인 것을 찾아 content 값을 돌려줍니다.
  const meta = (n) => {
    const el = document.querySelector(`meta[name="${n}"], meta[property="${n}"]`);
    return el ? clean(el.getAttribute('content')) : '';
  };

  // --- GNB 메뉴 ---
  // 헤더/내비 영역의 모든 목록(ul)을 후보로 모은 뒤 점수가 가장 높은 것을 고른다.
  // (처음 찾은 목록을 쓰면 .gnb 안의 언어 선택 KOR/ENG 같은 것을 메뉴로 오인할 수 있음)
  function extractMenu() {
    // ① 후보 수집: 헤더/내비 영역 안의 모든 목록(ul)을 후보로 모읍니다. (Set = 중복 없는 모음)
    const roots = ['#gnb', '.gnb', '#gnb_wrap', '.gnb_wrap', '#nav', '.nav', '#menu', 'header nav', 'nav', '#header', 'header', '#hd', '.header'];
    // 언어 선택(KOR/ENG 등)은 메뉴가 아니므로 걸러 내기 위한 패턴
    const LANG = /^(kor?|kr|eng?|en|chn?|cn|jpn?|jp|한국어|english|中文|日本語)$/i;
    const candidates = new Set();
    for (const sel of roots) {
      for (const root of document.querySelectorAll(sel)) {
        if (root.matches('ul')) candidates.add(root);
        root.querySelectorAll('ul').forEach((ul) => candidates.add(ul));
      }
    }
    // ② 점수 매기기: 점수 = 항목 수 + (하위 메뉴가 있는 항목 수 x 3). 점수가 가장 높은 목록이 진짜 메뉴(GNB)일 가능성이 큽니다.
    // 동점이면 문서에서 먼저 나온(위쪽) 목록을 유지합니다.
    let best = null;
    let bestScore = 0;
    // 문서에 나온 순서(위쪽 먼저)로 정렬합니다.
    const ordered = [...candidates].sort((x, y) => (x.compareDocumentPosition(y) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
    for (const ul of ordered) {
      // 클래스/아이디에 lang 이 들어간 영역(언어 선택)은 제외
      if (ul.closest('[class*="lang" i], [id*="lang" i]')) continue;
      const lis = [...ul.children].filter((li) => li.tagName === 'LI' && li.querySelector('a'));
      if (lis.length < 2) continue;
      const names = lis.map((li) => clean((li.querySelector('a') || li).textContent));
      if (names.every((n) => LANG.test(n))) continue; // 언어 선택 목록
      // 하위 메뉴(ul)를 가진 li가 있으면 GNB일 가능성이 높다
      const nested = lis.filter((li) => li.querySelector('ul')).length;
      const score = lis.length + nested * 3;
      if (score > bestScore) { // 동점이면 문서에서 먼저 나온(=헤더 쪽) 목록 유지
        best = lis;
        bestScore = score;
      }
    }
    // ③ 못 찾았으면 빈 목록. 이 경우 메인 화면만 캡처합니다.
    if (!best) return [];
    return best.map((li) => {
      const links = [...li.querySelectorAll('a')];
      // 항목의 대표 링크(1차 메뉴)와 나머지 링크(하위 메뉴)를 나눕니다.
      const top = li.querySelector(':scope > a, :scope > * > a') || links[0];
      return {
        name: clean(top.textContent),
        href: top.href,
        subs: links.filter((a) => a !== top).map((a) => ({ name: clean(a.textContent), href: a.href })).filter((s) => s.name),
      };
    }).filter((i) => i.name);
  }

  // --- 첫 화면에서 글자가 가장 큰 문구 = 슬로건 후보 ---
  function extractSloganCandidates() {
    const vh = window.innerHeight;
    const seen = new Set();
    const list = [];
    for (const el of document.querySelectorAll('h1, h2, h3, h4, p, strong, em, span, div, dt, dd, li')) {
      // 자기가 직접 가진 글자가 있는 요소만 (글자가 자식 요소 안에만 있는 껍데기는 제외)
      const hasOwnText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1);
      if (!hasOwnText) continue;
      if (el.closest('header, nav, footer, #header, #hd, #gnb, .gnb, #footer, #ft')) continue;
      const r = el.getBoundingClientRect();
      // 첫 화면(스크롤 전, 화면 높이 vh 안)에 실제로 보이는 것만
      if (r.width < 1 || r.height < 1 || r.top > vh || r.bottom < 0) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none') continue;
      const t = clean(el.innerText);
      if (t.length < 4 || t.length > 120 || seen.has(t)) continue;
      seen.add(t);
      list.push({ text: t, fontSize: parseFloat(cs.fontSize) || 0 });
    }
    // 글자 크기가 큰 순서로 정렬해 상위 5개. "가장 크게 쓴 글 = 슬로건일 가능성이 높다"는 가정입니다.
    return list.sort((a, b) => b.fontSize - a.fontSize).slice(0, 5);
  }

  // --- 컬러: 채도가 있는 색 중 많이 쓰인 색 ---
  function extractColors() {
    // 색 변환 도우미 3개: toRgb("rgb(…)" 문자열 → 숫자 3개, 투명이면 null) / hsl(→ 채도·밝기) / hex(→ #135bec 형식)
    const toRgb = (s) => {
      const m = (s || '').match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
      if (p.length > 3 && p[3] === 0) return null; // 투명
      return p.slice(0, 3);
    };
    const hsl = ([r, g, b]) => {
      r /= 255; g /= 255; b /= 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      const l = (max + min) / 2;
      const d = max - min;
      const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
      return { s, l };
    };
    const hex = (rgb) => '#' + rgb.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
    // 색마다 점수를 쌓습니다. 배경색은 차지한 면적에 비례(최대 500점), 글자색은 고정 20점.
    const score = new Map();
    const add = (rgb, w) => {
      if (!rgb) return;
      const { s, l } = hsl(rgb);
      if (s < 0.2 || l < 0.12 || l > 0.92) return; // 흰/검/회색 제외
      const k = hex(rgb);
      if (k === '#0000ee' || k === '#551a8b') return; // 브라우저 기본 링크색(스타일 미지정)
      score.set(k, (score.get(k) || 0) + w);
    };
    // 화면의 모든 요소(최대 5000개)를 훑으며 배경색/글자색 점수를 쌓습니다.
    const els = [...document.querySelectorAll('body *')].slice(0, 5000);
    for (const el of els) {
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) continue;
      const cs = getComputedStyle(el);
      add(toRgb(cs.backgroundColor), Math.min(r.width * r.height, 500000) / 1000);
      if ([...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) add(toRgb(cs.color), 20);
    }
    // 점수가 높은 3개 = 포인트 컬러 후보
    const accents = [...score.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k);

    // 바탕색과 그 밝기(0 어두움 ~ 1 밝음). 원고에서 "화이트/다크 바탕"을 정할 때 씁니다.
    const bodyBg = toRgb(getComputedStyle(document.body).backgroundColor) || toRgb(getComputedStyle(document.documentElement).backgroundColor) || [255, 255, 255];
    return { accents, background: hex(bodyBg), backgroundLightness: hsl(bodyBg).l };
  }

  // 본문(body)과 첫 제목(h1~h3)의 첫 번째 글꼴 이름. serif / sans-serif 같은 일반 이름은 제외합니다.
  function extractFonts() {
    const first = (el) => {
      if (!el) return '';
      const f = getComputedStyle(el).fontFamily.split(',')[0].replace(/["']/g, '').trim();
      return /^(serif|sans-serif|monospace|system-ui|-apple-system|inherit)$/i.test(f) ? '' : f;
    };
    const set = new Set([first(document.body), first(document.querySelector('h1, h2, h3'))].filter(Boolean));
    return [...set];
  }

  // 마지막: 위 결과들을 한 덩어리로 묶어 돌려줍니다. (siteName: og:site_name 메타 값, logoAlt: 로고 이미지의 대체 글)
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
  const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();
  // 머리말/내비/푸터 등 "페이지 본문이 아닌" 영역. skip() 이 true 인 요소는 본문에서 제외합니다.
  const LAYOUT = 'header, nav, footer, #header, #hd, #gnb, .gnb, #footer, #ft, .allMenu';
  const skip = (el) => el.closest(LAYOUT);
  // 실제로 화면에 보이는 요소인가 (크기가 있고 숨김 처리되지 않음)
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none';
  };
  // 중복 제거 (Set)
  const uniq = (arr) => [...new Set(arr)];
  // 요소가 "자기 몫의 글자"를 min 자 이상 가졌는가.
  // (글자가 자식 요소 안에만 있으면 false → 같은 글이 부모와 자식에서 중복으로 잡히는 것을 막습니다)
  const ownText = (el, min) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length >= min);
  // 페이지 맨 위에서부터의 거리 (스크롤 위치와 무관한 절대 위치)
  const absTop = (el) => el.getBoundingClientRect().top + window.scrollY;

  // 제목(h1~h4): 보이는 것만, 2~80자, 최대 12개
  const headings = uniq([...document.querySelectorAll('h1, h2, h3, h4')]
    .filter((el) => !skip(el) && visible(el))
    .map((el) => clean(el.innerText))
    .filter((t) => t.length >= 2 && t.length <= 80)).slice(0, 12);
  // 본문 문단: 자기 글자가 20자 이상인 요소, 20~300자, 최대 12개
  const paragraphs = uniq([...document.querySelectorAll('p, dd, li, div, span')]
    .filter((el) => ownText(el, 20) && !skip(el) && visible(el))
    .map((el) => clean(el.innerText))
    .filter((t) => t.length >= 20 && t.length <= 300)).slice(0, 12);

  // 상단 비주얼: 페이지 맨 위(900px 안)에서 글자가 가장 큰 문구 + 그 다음 문구
  const topTexts = [...document.querySelectorAll('h1, h2, h3, p, strong, span, div')]
    .filter((el) => ownText(el, 2) && !skip(el) && visible(el) && absTop(el) < 900)
    .map((el) => ({ text: clean(el.innerText), size: parseFloat(getComputedStyle(el).fontSize) || 0, top: absTop(el) }))
    .filter((x) => x.text.length >= 2 && x.text.length <= 100);
  const heroTitle = topTexts.slice().sort((a, b) => b.size - a.size)[0];
  const heroSub = heroTitle && topTexts
    .filter((x) => x.top > heroTitle.top && x.text !== heroTitle.text && x.text.length >= 8 && x.size >= 15)
    .sort((a, b) => a.top - b.top)[0];

  // 본문 전체 글자를 한 덩어리로 (연도 검색용)
  const bodyText = clean([...document.querySelectorAll('body *')]
    .filter((el) => !skip(el) && ownText(el, 1))
    .map((el) => el.innerText).join(' '));

  // 연혁: 본문에 등장하는 연도(1950~2039)
  // 정규식: 1950~2039 연도(19[5-9]\d | 20[0-3]\d) 뒤에 "년 . - ~ 공백"이 오거나 끝인 것.
  // 서로 다른 연도가 3개 이상일 때만 "연혁이 있다"고 봅니다. (아래 features.years)
  const years = uniq((bodyText.match(/\b(19[5-9]\d|20[0-3]\d)(?=\s*[년.\-~]|\s|$)/g) || []).map(Number)).sort((a, b) => a - b);

  // 수치: "200억 원", "36억", "32.4%", "20년" 같은 표현이 들어간 짧은 문구
  const stats = uniq([...document.querySelectorAll('p, li, dd, dt, strong, span, em, h3, h4, div')]
    .filter((el) => ownText(el, 2) && !skip(el) && visible(el))
    .map((el) => clean(el.innerText))
    .filter((t) => t.length <= 60 && /\d[\d,.]*\s?(조|억|만|천)?\s?(원|달러|%|년|개국|건|명|개사|배|대)/.test(t))).slice(0, 5);

  // 선택자(sel)에 해당하는, 본문 영역에서 보이는 요소의 개수
  const count = (sel) => [...document.querySelectorAll(sel)].filter((el) => !skip(el) && visible(el)).length;
  // 폭 300px 이상인 이미지 개수 (큰 사진이 많은 페이지인지 판단)
  const bigImages = [...document.querySelectorAll('img')].filter((img) => !skip(img) && img.getBoundingClientRect().width >= 300).length;

  // 카드형 목록: 이미지를 가진 형제 요소가 3개 이상 반복되는 목록
  let cards = 0;
  for (const list of document.querySelectorAll('ul, ol, div')) {
    if (skip(list)) continue;
    const kids = [...list.children].filter((c) => visible(c) && c.querySelector('img, [style*="background"]') && clean(c.innerText).length > 0);
    if (kids.length >= 3 && kids.length > cards) cards = kids.length;
  }

  // 게시판: 날짜(2026.03.10 / 2026-03-10)가 붙은 행
  const boardRows = [...document.querySelectorAll('tr, li')]
    .filter((el) => !skip(el) && visible(el) && /\b20\d{2}[.\-/]\d{1,2}[.\-/]\d{1,2}\b/.test(el.textContent)).length;

  // 입력칸 수 (숨김·검색·버튼·체크박스·라디오는 제외). template.js 에서 3개 이상이면 "문의 폼"으로 봅니다.
  const inputs = [...document.querySelectorAll('input, textarea, select')]
    .filter((el) => !skip(el) && visible(el) && !/hidden|search|submit|button|checkbox|radio/i.test(el.type || '') && !/search|keyword|stx|sfl/i.test(el.name || '')).length;

  // 이 페이지가 불러오는 외부 스크립트 주소들을 한 줄 글자로 (gsap, swiper 같은 라이브러리 이름 찾기용).
  // 파일 하나로 합쳐 둔 사이트는 못 찾는 한계가 있습니다.
  const scripts = [...document.querySelectorAll('script[src]')].map((s) => s.src.toLowerCase()).join(' ');

  return {
    title: clean(document.title),
    headings,
    paragraphs,
    hero: heroTitle ? { title: heroTitle.text, sub: heroSub ? heroSub.text : '' } : null,
    // features = "이 페이지에 무엇이 있는지" 요약. template.js 의 collectFeatures 가 이 값을 읽어 문장을 만듭니다.
    //   years: 연도 목록(3개 이상일 때만) / stats: 수치 문구 / bigImages / cards / sliders / videos / map / formInputs
    //   tables(표 개수: 현재 원고에서는 쓰이지 않음) / boardRows / downloads / libs(감지한 라이브러리 이름)
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
      downloads: [...document.querySelectorAll('a[href]')].filter((a) => !skip(a) && (/\.(pdf|zip|pptx?|hwp)(\?|$)/i.test(a.href) || a.hasAttribute('download') || /다운로드|download/i.test(a.textContent))).length,
      libs: ['gsap', 'scrolltrigger', 'swiper', 'slick', 'aos', 'fullpage', 'lenis', 'three']
        .filter((k) => scripts.includes(k) || (k === 'aos' && document.querySelector('[data-aos]'))),
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
    // networkidle이 안 오는 사이트(채팅위젯, 무한 폴링 등)는 load 기준으로 재시도
    if (!/Timeout/i.test(err.message)) throw err;
    await page.goto(url, { waitUntil: 'load', timeout: NAV_TIMEOUT });
  }
  await page.waitForTimeout(1500); // 메인 비주얼 애니메이션 대기
  // 배경 동영상(video, Vimeo/YouTube iframe)이 있으면 첫 프레임이 뜰 때까지 조금 더 기다린다
  const hasVideo = await page.evaluate(() => !!document.querySelector('video, iframe[src*="vimeo"], iframe[src*="youtube"]'));
  if (hasVideo) await page.waitForTimeout(3500);
  await page.evaluate(hidePopupsInPage);
}

// 스크롤을 끝까지 한 번 내려서 지연 로딩 이미지/스크롤 애니메이션을 모두 띄운 뒤 맨 위로
async function revealWholePage(page) {
  await page.evaluate(async () => {
    // 화면 높이의 80%씩 아래로 내려가며 150ms 씩 쉽니다. 끝에 닿으면 멈추고(최대 40번), 마지막에 맨 위로 돌아옵니다.
    // 스크롤해야 나타나는 이미지와 애니메이션을 미리 띄워서 전체 캡처에 빈 곳이 없게 하려는 것입니다. (무한 스크롤 페이지는 40번에서 멈춤)
    const step = window.innerHeight * 0.8;
    for (let i = 0; i < 40; i++) {
      window.scrollBy(0, step);
      await new Promise((r) => setTimeout(r, 150));
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

  // 지연 로딩 이미지가 뜨도록 스크롤한 뒤, 전체 높이를 잽니다.
  await revealWholePage(page);
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
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
  // 이미 목록에 넣은 주소 기록 (같은 페이지를 두 번 방문하지 않기 위함)
  const seen = new Set([withoutHash(homeUrl)]);
  for (const item of menu) {
    if (pages.length >= maxPages) break;
    if (EXCLUDE_LINK.test(item.name)) continue;
    // 1차 메뉴 링크가 '#'이면 첫 번째 하위 메뉴 링크로 대신 들어간다
    const candidates = [item.href, ...item.subs.map((s) => s.href)];
    const href = candidates.find((h) => isUsableHref(h, homeUrl) && sameSite(h, homeUrl) && !EXCLUDE_LINK.test(h));
    if (!href) continue;
    const key = withoutHash(href);
    if (seen.has(key)) continue;
    seen.add(key);
    // 하위 메뉴 중 방문 가능한 것(같은 사이트, 대표 주소와 다른 것). 나중에 캡처 없이 내용만 읽습니다.
    const subLinks = item.subs.filter((s) => s.name !== item.name && isUsableHref(s.href, homeUrl) && sameSite(s.href, homeUrl) && withoutHash(s.href) !== key);
    pages.push({ name: item.name, url: href, subs: item.subs.map((s) => s.name).filter((n) => n !== item.name), subLinks });
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
async function crawlSite(startUrl, outDir, { maxPages = 8, onProgress = () => {} } = {}) {
  // 결과 폴더 만들기 (recursive: 중간 폴더가 없어도 한 번에 생성, 이미 있어도 오류 없음)
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await launchBrowser(onProgress);
  try {
    // context = 브라우저 안의 독립된 "프로필"(쿠키 등이 분리됨). 창 크기와 언어(한국어)를 정합니다.
    // ignoreHTTPSErrors: 인증서가 만료된 고객사 사이트도 열 수 있게 합니다.
    const context = await browser.newContext({
      viewport: VIEWPORT,
      locale: 'ko-KR',
      ignoreHTTPSErrors: true, // 인증서가 만료된 고객사 사이트도 열 수 있게
    });
    // page = 탭 하나. 아래에서 이 탭 하나로 모든 페이지를 차례로 엽니다.
    const page = await context.newPage();

    onProgress(`메인 페이지 여는 중: ${startUrl}`);
    await openPage(page, startUrl);
    const homeUrl = page.url(); // 리다이렉트 후 최종 주소
    // ② 메인에서 사이트 전체 정보(메뉴, 슬로건 후보, 컬러, 서체 등)를 뽑습니다. (브라우저 안에서 실행되는 함수)
    const site = await page.evaluate(extractSiteInfoInPage);
    // ③ 메뉴를 "방문할 페이지 목록"으로 바꿉니다.
    const pageList = buildPageList(homeUrl, site.menu, maxPages);

    // ④ 페이지마다 결과를 쌓아 두는 배열
    const pages = [];
    for (let i = 0; i < pageList.length; i++) {
      const p = pageList[i];
      // 이미지 파일 이름의 앞부분.  예) 02_회사소개 → 02_회사소개.png, 02_회사소개_full.png
      const baseName = `${String(i + 1).padStart(2, '0')}_${safeFileName(p.name)}`;
      onProgress(`[${i + 1}/${pageList.length}] ${p.name} 캡처 중`);
      try {
        // 메인은 이미 열려 있으므로 다시 열지 않습니다.
        if (!p.isHome) await openPage(page, p.url);
        const shots = await capture(page, outDir, baseName);
        const info = await page.evaluate(extractPageInfoInPage); // 스크롤로 지연 로딩이 끝난 뒤 추출
        const subPages = [];
        // 원고에 쓸 정보가 많은 하위 페이지(연혁, 오시는길, 카탈로그 등)를 먼저 읽는다
        const informative = (n) => (/연혁|history|오시는|location|map|문의|contact|카[달탈]로그|catalog|브로슈어|인증|특허/i.test(n) ? 0 : 1);
        const subLinks = (p.subLinks || []).slice().sort((a, b) => informative(a.name) - informative(b.name));
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
        // 한 페이지 분량의 결과: 메뉴 정보 + 추출 정보 + 하위 페이지 정보 + 캡처 파일 이름
        pages.push({ ...p, ...info, subPages, screenshot: shots.first, screenshotFull: shots.full });
      } catch (err) {
        // 이 페이지만 실패해도 전체를 멈추지 않고, 오류를 기록한 뒤 다음 페이지로 넘어갑니다.
        pages.push({ ...p, error: err.message.split('\n')[0] });
      }
    }

    // 최종 결과: 최종 주소 + 사이트 정보 + 페이지별 정보. (결과 폴더의 site.json 과 같은 내용)
    return { url: homeUrl, ...site, pages };
  } finally {
    // 성공이든 실패든 브라우저는 반드시 닫습니다. (안 닫으면 보이지 않는 브라우저가 PC 에 계속 남습니다)
    await browser.close();
  }
}

// 다른 파일(server.js 등)이 가져다 쓸 수 있게 내보내는 함수들. crawlSite 가 핵심이고 나머지는 재사용/테스트용입니다.
module.exports = { crawlSite, buildPageList, safeFileName };
