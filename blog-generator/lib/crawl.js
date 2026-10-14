'use strict';

// 사이트 분석 + PC 스크린샷 촬영
// Playwright(헤드리스 Chromium)로 실제 브라우저처럼 페이지를 열어서
// 메뉴, 슬로건 후보, 메인 컬러, 서체, 페이지별 제목/문구를 추출한다.

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const VIEWPORT = { width: 1920, height: 1080 };
const FULLPAGE_MAX_HEIGHT = 15000; // 너무 긴 페이지는 위에서부터 이 높이까지만 캡처
const NAV_TIMEOUT = 30000;
const MAX_SUBPAGES_PER_MENU = 4; // 메뉴당 캡처 없이 내용만 읽어 올 하위 페이지 수

// 메뉴 중 원고에 넣을 필요가 없는 링크
const EXCLUDE_LINK = /login|logout|admin|sitemap|privacy|policy|개인정보|이용약관|로그인|로그아웃|회원가입|사이트맵/i;

function stripWww(host) {
  return host.replace(/^www\./i, '').toLowerCase();
}

function sameSite(a, b) {
  try {
    return stripWww(new URL(a).hostname) === stripWww(new URL(b).hostname);
  } catch {
    return false;
  }
}

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
function isUsableHref(href, currentUrl) {
  if (!href || /^(javascript|mailto|tel):/i.test(href)) return false;
  if (href.includes('#') && withoutHash(href) === withoutHash(currentUrl)) return false;
  return true;
}

function safeFileName(name) {
  const cleaned = String(name)
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 30);
  return cleaned || 'page';
}

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

// 홈 화면에서 사이트 전체 정보 추출
function extractSiteInfoInPage() {
  const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();
  const meta = (n) => {
    const el = document.querySelector(`meta[name="${n}"], meta[property="${n}"]`);
    return el ? clean(el.getAttribute('content')) : '';
  };

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
        root.querySelectorAll('ul').forEach((ul) => candidates.add(ul));
      }
    }
    let best = null;
    let bestScore = 0;
    const ordered = [...candidates].sort((x, y) => (x.compareDocumentPosition(y) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
    for (const ul of ordered) {
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
    if (!best) return [];
    return best.map((li) => {
      const links = [...li.querySelectorAll('a')];
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
      const hasOwnText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1);
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
    return list.sort((a, b) => b.fontSize - a.fontSize).slice(0, 5);
  }

  // --- 컬러: 채도가 있는 색 중 많이 쓰인 색 ---
  function extractColors() {
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
    const score = new Map();
    const add = (rgb, w) => {
      if (!rgb) return;
      const { s, l } = hsl(rgb);
      if (s < 0.2 || l < 0.12 || l > 0.92) return; // 흰/검/회색 제외
      const k = hex(rgb);
      if (k === '#0000ee' || k === '#551a8b') return; // 브라우저 기본 링크색(스타일 미지정)
      score.set(k, (score.get(k) || 0) + w);
    };
    const els = [...document.querySelectorAll('body *')].slice(0, 5000);
    for (const el of els) {
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) continue;
      const cs = getComputedStyle(el);
      add(toRgb(cs.backgroundColor), Math.min(r.width * r.height, 500000) / 1000);
      if ([...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) add(toRgb(cs.color), 20);
    }
    const accents = [...score.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k);

    const bodyBg = toRgb(getComputedStyle(document.body).backgroundColor) || toRgb(getComputedStyle(document.documentElement).backgroundColor) || [255, 255, 255];
    return { accents, background: hex(bodyBg), backgroundLightness: hsl(bodyBg).l };
  }

  function extractFonts() {
    const first = (el) => {
      if (!el) return '';
      const f = getComputedStyle(el).fontFamily.split(',')[0].replace(/["']/g, '').trim();
      return /^(serif|sans-serif|monospace|system-ui|-apple-system|inherit)$/i.test(f) ? '' : f;
    };
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

// 각 페이지의 제목/본문 문구 + 페이지 구성 요소(연혁, 수치, 지도, 폼, 슬라이드 등) 추출
// 원고에서 "이 페이지에 실제로 무엇이 있는지"를 문장으로 만들기 위한 재료
function extractPageInfoInPage() {
  const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();
  const LAYOUT = 'header, nav, footer, #header, #hd, #gnb, .gnb, #footer, #ft, .allMenu';
  const skip = (el) => el.closest(LAYOUT);
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none';
  };
  const uniq = (arr) => [...new Set(arr)];
  const ownText = (el, min) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length >= min);
  const absTop = (el) => el.getBoundingClientRect().top + window.scrollY;

  const headings = uniq([...document.querySelectorAll('h1, h2, h3, h4')]
    .filter((el) => !skip(el) && visible(el))
    .map((el) => clean(el.innerText))
    .filter((t) => t.length >= 2 && t.length <= 80)).slice(0, 12);
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

  const bodyText = clean([...document.querySelectorAll('body *')]
    .filter((el) => !skip(el) && ownText(el, 1))
    .map((el) => el.innerText).join(' '));

  // 연혁: 본문에 등장하는 연도(1950~2039)
  const years = uniq((bodyText.match(/\b(19[5-9]\d|20[0-3]\d)(?=\s*[년.\-~]|\s|$)/g) || []).map(Number)).sort((a, b) => a - b);

  // 수치: "200억 원", "36억", "32.4%", "20년" 같은 표현이 들어간 짧은 문구
  const stats = uniq([...document.querySelectorAll('p, li, dd, dt, strong, span, em, h3, h4, div')]
    .filter((el) => ownText(el, 2) && !skip(el) && visible(el))
    .map((el) => clean(el.innerText))
    .filter((t) => t.length <= 60 && /\d[\d,.]*\s?(조|억|만|천)?\s?(원|달러|%|년|개국|건|명|개사|배|대)/.test(t))).slice(0, 5);

  const count = (sel) => [...document.querySelectorAll(sel)].filter((el) => !skip(el) && visible(el)).length;
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

  const inputs = [...document.querySelectorAll('input, textarea, select')]
    .filter((el) => !skip(el) && visible(el) && !/hidden|search|submit|button|checkbox|radio/i.test(el.type || '') && !/search|keyword|stx|sfl/i.test(el.name || '')).length;

  const scripts = [...document.querySelectorAll('script[src]')].map((s) => s.src.toLowerCase()).join(' ');

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
      downloads: [...document.querySelectorAll('a[href]')].filter((a) => !skip(a) && (/\.(pdf|zip|pptx?|hwp)(\?|$)/i.test(a.href) || a.hasAttribute('download') || /다운로드|download/i.test(a.textContent))).length,
      libs: ['gsap', 'scrolltrigger', 'swiper', 'slick', 'aos', 'fullpage', 'lenis', 'three']
        .filter((k) => scripts.includes(k) || (k === 'aos' && document.querySelector('[data-aos]'))),
    },
  };
}

// ---------- Node 쪽 로직 ----------

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

async function capture(page, outDir, baseName) {
  const first = `${baseName}.png`;
  await page.screenshot({ path: path.join(outDir, first) });

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

// GNB 결과를 "방문할 페이지 목록"으로 정리
function buildPageList(homeUrl, menu, maxPages) {
  const pages = [{ name: 'MAIN', url: homeUrl, subs: [], isHome: true }];
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
    const subLinks = item.subs.filter((s) => s.name !== item.name && isUsableHref(s.href, homeUrl) && sameSite(s.href, homeUrl) && withoutHash(s.href) !== key);
    pages.push({ name: item.name, url: href, subs: item.subs.map((s) => s.name).filter((n) => n !== item.name), subLinks });
  }
  return pages;
}

/**
 * @param {string} startUrl 분석할 홈페이지 주소
 * @param {string} outDir 스크린샷 저장 폴더
 * @param {{maxPages?: number, onProgress?: (msg: string) => void}} options
 */
// PC에 설치된 Google Chrome을 우선 사용한다.
// 번들 Chromium에는 H.264 등 일부 코덱이 없어 배경 동영상이 빈 화면으로 찍힐 수 있기 때문
// (Playwright 문서 browsers.md "Media codecs" 참고). Chrome이 없으면 번들 Chromium 사용.
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

async function crawlSite(startUrl, outDir, { maxPages = 8, onProgress = () => {} } = {}) {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await launchBrowser(onProgress);
  try {
    const context = await browser.newContext({
      viewport: VIEWPORT,
      locale: 'ko-KR',
      ignoreHTTPSErrors: true, // 인증서가 만료된 고객사 사이트도 열 수 있게
    });
    const page = await context.newPage();

    onProgress(`메인 페이지 여는 중: ${startUrl}`);
    await openPage(page, startUrl);
    const homeUrl = page.url(); // 리다이렉트 후 최종 주소
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
        pages.push({ ...p, ...info, subPages, screenshot: shots.first, screenshotFull: shots.full });
      } catch (err) {
        pages.push({ ...p, error: err.message.split('\n')[0] });
      }
    }

    return { url: homeUrl, ...site, pages };
  } finally {
    await browser.close();
  }
}

module.exports = { crawlSite, buildPageList, safeFileName };
