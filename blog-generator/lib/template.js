'use strict';

// 템플릿 치환으로 블로그 원고를 만든다 (외부 API 사용 안 함)
// 문장 틀은 기존 홍보 글(대혜건축 제작후기)의 흐름을 따른다.
//
// 각 페이지 문단은 아래 재료를 조합해 만든다. 감지된 것만 문장으로 들어간다.
//   1) 메뉴 성격(회사소개/사업/포트폴리오…)에 맞는 도입 문장 — 같은 성격이 반복되면 다른 표현 사용
//   2) 상단 비주얼 카피 (페이지에 실제로 적힌 문구)
//   3) 본문 핵심 문장 (페이지에 실제로 적힌 문구)
//   4) 구성 요소 문장: 연혁 연도 범위, 수치, 지도/문의 폼, 카드 목록, 슬라이드, 게시판, 다운로드, 영상
//   5) 마무리 문장
// 【 】로 표시된 부분은 기계가 알 수 없는 내용이므로 기획자가 직접 채운다.

const COMPANY = '디자인픽셀';

// ---------- 유틸 ----------

function joinKo(list) {
  return list.filter(Boolean).join(', ');
}

// 받침 유무에 따라 조사 선택: josa('대혜건축', '은', '는') → '대혜건축은'
// 마지막 글자가 한글이 아니면(영문/숫자) 판단할 수 없으므로 '은(는)'처럼 둘 다 표기
function josa(word, withBatchim, without) {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  if (code < 0 || code > 11171) return withBatchim === '으로' ? `${word}(으)로` : `${word}${withBatchim}(${without})`;
  const jong = code % 28;
  if (withBatchim === '으로') return word + (jong === 0 || jong === 8 ? '로' : '으로'); // ㄹ받침은 '로'
  return word + (jong ? withBatchim : without);
}

// 같은 자리(slot)에 쓰는 문장 후보를 돌아가며 사용 → 페이지마다 표현이 달라진다
function makePicker() {
  const used = {};
  return (slot, list) => {
    used[slot] = (used[slot] === undefined ? -1 : used[slot]) + 1;
    return list[used[slot] % list.length];
  };
}

// 문단을 문장 단위로 쪼갠다 ("~다." 기준)
function sentences(text) {
  return (text || '').split(/(?<=[다요]\.)\s+|(?<=[.!?])\s+(?=[가-힣A-Z])/).map((s) => s.trim()).filter(Boolean);
}

// ‘인용문’ 뒤에 붙는 '(이)라는' 선택: 받침이 있으면 '이라는'
function quoteRa(q) {
  const code = q.charCodeAt(q.length - 1) - 0xac00;
  const batchim = code >= 0 && code <= 11171 && code % 28 !== 0;
  return `‘${q}’${batchim ? '이라는' : '라는'}`;
}

function stripPeriod(s) {
  return s.replace(/[.。!]+$/, '');
}

// "#1a3c6e" → "네이비" 같은 대략적인 색 이름
function colorName(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = (h * 60 + 360) % 360;
  }
  if (h >= 15 && h < 45 && l < 0.4) return '브라운';
  if (h < 15 || h >= 340) return '레드';
  if (h < 45) return '오렌지';
  if (h < 70) return '옐로';
  if (h < 165) return '그린';
  if (h < 200) return '민트';
  if (h < 250) return l < 0.35 ? '네이비' : '블루';
  if (h < 290) return '퍼플';
  return '핑크';
}

// 회사명 추정: og:site_name > 로고 alt > <title>의 첫 부분
function guessClientName(site) {
  if (site.siteName) return site.siteName;
  if (site.logoAlt && !/logo|로고/i.test(site.logoAlt)) return site.logoAlt;
  const fromTitle = (site.title || '').split(/\s[|\-–:]\s|\s?\|\s?/)[0].trim();
  return fromTitle || '【고객사명】';
}

// ---------- 메뉴 성격 분류 ----------
// 위에서부터 먼저 맞는 것을 사용. intro/outro는 여러 표현 중 돌아가며 사용.
// subs: 하위 메뉴 이름 목록 문자열 (없으면 '')
const CATEGORIES = [
  {
    key: 'portfolio',
    test: /project|portfolio|works|case|gallery|실적|포트폴리오|사례|갤러리|시공/i,
    emoji: '🗂️',
    title: (c, n) => `${c}의 경쟁력을 보여주는 ${n} 페이지`,
    intro: [
      (c, n, subs) => `${subs ? `${subs} 등 ` : ''}${c}의 결과물을 모아 보여주는 포트폴리오 페이지입니다.`,
      (c, n, subs) => `${n} 페이지는 ${c}의 실제 수행 사례로 신뢰를 전달하는 공간입니다.`,
    ],
    outro: [
      (c) => `결과물을 먼저 보여주는 구성으로 ${c}의 경쟁력을 강조했습니다.`,
      () => '방문자가 원하는 사례를 쉽게 찾아볼 수 있도록 탐색 동선을 단순하게 정리했습니다.',
    ],
  },
  {
    key: 'product',
    test: /product|shop|item|제품|상품/i,
    emoji: '🛍️',
    title: (c, n) => `제품의 특징이 잘 드러나는 ${n} 페이지`,
    intro: [
      (c, n, subs) => `${subs ? `${subs} 등 ` : ''}${c}의 제품을 소개하는 페이지입니다.`,
      (c, n) => `${n} 페이지는 ${c}의 제품 라인업을 한곳에 정리한 공간입니다.`,
    ],
    outro: [
      () => '제품 정보를 정돈된 레이아웃으로 배치해 비교와 탐색이 쉽도록 구성했습니다.',
    ],
  },
  {
    key: 'about',
    test: /about|company|greeting|ceo|history|vision|회사|기업|소개|인사말|연혁|비전|철학/i,
    emoji: '📌',
    title: () => '아이덴티티와 기업의 방향성을 살린 콘텐츠 구성',
    intro: [
      (c, n, subs) => `${subs ? `${subs}까지 ` : ''}${josa(c, '을', '를')} 깊이 있게 소개하는 페이지입니다.`,
      (c, n) => `${n} 페이지는 ${c}의 정체성과 방향성을 전달하는 공간입니다.`,
    ],
    outro: [
      (c) => `방문자가 ${c}의 브랜드를 직관적으로 이해할 수 있도록 구성했습니다.`,
      () => '기업의 신뢰도를 자연스럽게 전달할 수 있도록 정보의 흐름을 설계했습니다.',
    ],
  },
  {
    key: 'business',
    test: /business|service|solution|tec|technology|r&d|automation|robot|사업|서비스|솔루션|분야|기술|연구|자동화|제어|로봇/i,
    emoji: '💡',
    title: (c, n) => `${n} 중심의 콘텐츠 구성`,
    intro: [
      (c, n, subs) => `${subs ? `${subs} 등 ` : ''}${c}의 핵심 사업을 소개하는 페이지입니다.`,
      (c, n) => `${n} 페이지는 ${c}의 기술력과 전문성을 보여주는 공간입니다.`,
      (c, n) => `${josa(n, '은', '는')} ${c}의 또 다른 핵심 사업 영역입니다.`,
    ],
    outro: [
      () => '설명은 간결하게, 이미지는 크게 배치해 전문성이 직관적으로 전달되도록 설계했습니다.',
      () => '어려운 기술 내용도 쉽게 읽히도록 정보를 단계적으로 배치했습니다.',
      () => '고객이 필요한 정보를 빠르게 찾을 수 있도록 내용을 항목별로 정리했습니다.',
    ],
  },
  {
    key: 'recruit',
    test: /career|recruit|join|채용|인재/i,
    emoji: '🤝',
    title: () => '함께할 인재를 위한 채용 페이지',
    intro: [
      (c, n, subs) => `${subs ? `${subs} 등 ` : ''}채용 정보를 한곳에 모은 페이지입니다.`,
    ],
    outro: [
      () => '지원자가 필요한 정보를 쉽게 확인할 수 있도록 구성했습니다.',
    ],
  },
  {
    key: 'contact',
    test: /contact|inquiry|location|map|문의|오시는|견적|상담/i,
    emoji: '📞',
    title: () => '고객과의 접점을 높인 문의 페이지',
    intro: [
      (c, n, subs) => `${subs ? `${subs} 등 ` : ''}고객이 ${c}에 쉽게 연락할 수 있도록 만든 페이지입니다.`,
    ],
    outro: [
      () => '방문자가 망설임 없이 상담을 요청할 수 있도록 문의 동선을 단순하게 구성했습니다.',
    ],
  },
  {
    key: 'news',
    test: /\bpr\b|\bir\b|news|notice|board|media|press|community|공지|소식|홍보|게시판|고객센터|커뮤니티|투자/i,
    emoji: '📰',
    title: (c, n) => `${c}의 소식을 전하는 ${n} 페이지`,
    intro: [
      (c, n, subs) => `${subs ? `${subs} 등 ` : ''}${c}의 새로운 소식을 전하는 페이지입니다.`,
      (c, n, subs) => `${n} 페이지에서는 ${subs ? `${subs} 등 ` : ''}${c}의 대외 소식을 확인할 수 있습니다.`,
    ],
    outro: [
      () => '꾸준히 업데이트되는 소식으로 기업의 활동성을 보여줄 수 있도록 했습니다.',
      () => '알리고 싶은 소식을 빠르게 전할 수 있는 창구가 되도록 구성했습니다.',
    ],
  },
];

const DEFAULT_CATEGORY = {
  key: 'default',
  emoji: '📄',
  title: (c, n) => `${n} 페이지 구성`,
  intro: [(c, n, subs) => `${subs ? `${subs} 등으로 구성된 ` : ''}${n} 페이지입니다.`],
  outro: [() => '【이 페이지의 특징을 1줄로 보충 입력 (선택)】'],
};

function categorize(name) {
  return CATEGORIES.find((c) => c.test.test(name)) || DEFAULT_CATEGORY;
}

// ---------- 페이지 분석 결과 → 문장 ----------

// 메뉴 페이지 + 하위 페이지(정보만 수집) 전체에서 구성 요소를 모은다.
// 어느 하위 페이지에서 발견됐는지(where)도 같이 기록해 "오시는길 페이지에는…"처럼 쓸 수 있게 한다.
function collectFeatures(page) {
  const sources = [{ ...page, name: '' }, ...(page.subPages || []).filter((s) => !s.error)];
  const found = [];
  const thisYear = new Date().getFullYear();
  for (const src of sources) {
    const f = src.features || {};
    const where = src.name;
    // 연도가 많아도 통계 자료일 수 있으므로, 연혁 페이지로 보이는 곳에서만 연혁으로 인정
    const isHistory = /연혁|history|발자취|걸어온/i.test([src.name || page.name, ...(src.headings || [])].join(' '));
    const years = (f.years || []).filter((y) => y <= thisYear);
    if (isHistory && years.length >= 3) found.push({ type: 'years', where, years });
    if (f.stats && f.stats.length) found.push({ type: 'stats', where, stats: f.stats });
    if (f.map || f.formInputs >= 3) found.push({ type: 'contact', where, map: f.map, form: f.formInputs >= 3 });
    if (f.downloads) found.push({ type: 'downloads', where });
    if (f.boardRows >= 3) found.push({ type: 'board', where, rows: f.boardRows });
    if (f.cards >= 3) found.push({ type: 'cards', where, cards: f.cards });
    if (f.videos) found.push({ type: 'video', where });
    if (f.sliders) found.push({ type: 'slider', where });
    if (f.bigImages >= 4 && !(f.cards >= 3)) found.push({ type: 'images', where, count: f.bigImages }); // 카드 목록이 있으면 중복 설명이라 생략
  }
  return found;
}

const FEATURE_PRIORITY = ['years', 'contact', 'stats', 'downloads', 'cards', 'board', 'video', 'slider', 'images'];

function featureSentence(ft, client, pick) {
  const at = ft.where ? `${ft.where} 페이지에서는 ` : '';
  const atIn = ft.where ? `${ft.where} 페이지에는 ` : '';
  switch (ft.type) {
    case 'years': {
      const from = ft.years[0];
      const to = ft.years[ft.years.length - 1];
      return pick('years', [
        `${at}${from}년부터 ${to}년까지의 발자취를 연도별로 정리해 성장 과정을 한눈에 볼 수 있도록 했습니다.`,
        `${atIn}${from}년 이후의 주요 연혁을 타임라인으로 담아 ${client}의 역사를 보여줍니다.`,
      ]);
    }
    case 'stats': {
      const quotes = ft.stats.filter((s) => s.length <= 30).slice(0, 2).map((s) => `‘${s}’`);
      if (!quotes.length) return '';
      return pick('stats', [
        // 숫자가 회사 실적인지 시장 통계인지는 알 수 없으므로 '성과'라고 단정하지 않는다
        `${at}${quotes.join(', ')}처럼 핵심 수치를 눈에 띄게 강조해 내용의 설득력을 높였습니다.`,
        `${quotes.join(', ')} 같은 구체적인 숫자를 강조해 정보가 한눈에 들어오도록 했습니다.`,
      ]);
    }
    case 'contact': {
      const what = ft.map && ft.form ? '지도와 문의 폼을 함께' : ft.map ? '지도를' : '온라인 문의 폼을';
      const why = ft.map && ft.form ? '방문 안내와 상담 요청이 한 번에 이어지도록 했습니다.' : ft.map ? '찾아오는 길을 쉽게 확인할 수 있도록 했습니다.' : '방문자가 바로 상담을 남길 수 있도록 했습니다.';
      return `${atIn}${what} 배치해 ${why}`;
    }
    case 'downloads':
      return `${atIn}자료를 바로 내려받을 수 있는 다운로드 기능을 넣어 고객이 필요한 자료를 쉽게 받아볼 수 있도록 했습니다.`;
    case 'board':
      return pick('board', [
        `${atIn}게시물이 날짜순 목록으로 정리되어 최신 소식을 빠르게 확인할 수 있습니다.`,
        `${at}게시판으로 글을 관리할 수 있어 소식을 꾸준히 업데이트할 수 있습니다.`,
      ]);
    case 'cards':
      return pick('cards', [
        `${at}${ft.cards}개의 항목을 카드형 레이아웃으로 정리해 한눈에 비교할 수 있도록 했습니다.`,
        `${ft.cards}개의 콘텐츠를 이미지 카드로 나열해 시각적으로 탐색하기 쉽게 구성했습니다.`,
      ]);
    case 'video':
      return `${atIn}영상을 활용해 정적인 이미지보다 생생하게 내용을 전달합니다.`;
    case 'slider':
      return pick('slider', [
        `${at}슬라이드 구성으로 여러 콘텐츠를 한 화면에서 넘겨 볼 수 있도록 했습니다.`,
        '슬라이드를 활용해 많은 정보를 한정된 공간에 효율적으로 담았습니다.',
      ]);
    case 'images':
      return '현장 이미지를 큼직하게 배치해 결과물의 완성도가 그대로 느껴지도록 했습니다.';
    default:
      return '';
  }
}

// 페이지 본문에서 원고에 인용할 핵심 문장 1개 고르기
// 숫자나 회사명이 들어간 25~90자 문장을 우선. 상단 카피/이미 쓴 문장은 제외.
function pickKeySentence(page, client, exclude) {
  const pool = [page, ...(page.subPages || [])]
    .flatMap((p) => p.paragraphs || [])
    .flatMap(sentences)
    .map(stripPeriod)
    .filter((s) => s.length >= 25 && s.length <= 90 && !exclude.has(s));
  const score = (s) => (s.includes(client) ? 3 : 0) + (/\d/.test(s) ? 1 : 0) + (/[가-힣]/.test(s) ? 1 : -5) - (/보고서|조사|따르면|전망/.test(s) ? 2 : 0);
  return pool.sort((a, b) => score(b) - score(a))[0] || '';
}

function heroSentence(page, pick) {
  const h = page.hero;
  if (!h) return '';
  const copy = h.sub && h.sub.length >= 8 && h.sub.length <= 60 ? stripPeriod(h.sub) : '';
  if (!copy) return '';
  return pick('hero', [
    `상단 비주얼에는 ${quoteRa(copy)} 카피를 넣어 페이지의 메시지를 먼저 전달합니다.`,
    `페이지 첫 화면에 ${quoteRa(copy)} 문구를 배치해 핵심 메시지를 분명하게 보여줍니다.`,
  ]);
}

// ---------- 원고 조립 ----------

/**
 * @param {object} site crawlSite() 결과
 * @returns {{clientName: string, blocks: Array<{type: 'text'|'image', text?: string, file?: string, caption?: string}>, text: string}}
 */
function buildManuscript(site) {
  const client = guessClientName(site);
  const pick = makePicker();
  const slogan = site.sloganCandidates[0] ? site.sloganCandidates[0].text : '【메인 슬로건】';
  const okPages = site.pages.filter((p) => !p.error);
  const home = okPages.find((p) => p.isHome);
  const subPages = okPages.filter((p) => !p.isHome);
  const menuNames = site.pages.filter((p) => !p.isHome).map((p) => p.name);
  const usedSentences = new Set(site.sloganCandidates.map((s) => stripPeriod(s.text)));
  const allParagraphs = okPages.flatMap((p) => [p, ...(p.subPages || [])]).flatMap((p) => p.paragraphs || []);

  const blocks = [];
  const text = (t) => blocks.push({ type: 'text', text: t });
  const image = (p) => blocks.push({ type: 'image', file: p.screenshot, fullFile: p.screenshotFull, caption: p.isHome ? 'MAIN' : p.name });

  // 1. 인사 + 고객사 소개
  text(`안녕하세요!!\n기업 맞춤형 웹사이트 제작 전문 업체 ${COMPANY}입니다!`);
  text(`${client}\n${site.url}\n${slogan}`);

  // 제작 의도: 사이트에서 설립연도를 찾으면 예시로 보여 준다 (기획자가 최종 확정)
  const founded = allParagraphs.join(' ').match(/((?:19|20)\d{2})년\s*(?:에\s*)?(?:설립|창립|창업)/);
  const strengthHint = founded ? `${founded[1]}년 설립 이후 쌓아온 기술력과 신뢰` : '40년 이상의 역사와 전문성';
  text(`기업 홈페이지는 브랜드의 첫인상을 결정하는 중요한 공간입니다.\n이번 ${client} 프로젝트는 【핵심 강점: 예) ${strengthHint}】을 효과적으로 전달하면서,\n【강조 포인트: 예) 프로젝트 중심의 브랜드 이미지】를 구축하는 데 중점을 두고 제작했습니다.`);

  // 2. 프로젝트 소개 — meta description이 회사명과 같거나 너무 짧으면 메인 본문의 소개 문장 사용
  const usefulDesc = site.description && site.description !== client && site.description.length >= 15 ? site.description : '';
  const homeIntro = home ? (home.paragraphs || []).find((t) => t.length >= 30 && t.includes(client)) : '';
  const description = usefulDesc || homeIntro;
  if (description) usedSentences.add(stripPeriod(description));
  const intro = description
    ? `${description}\n홈페이지 역시 ${client}의 전문성과 강점을 효과적으로 보여줄 수 있도록 기획했습니다.`
    : `${josa(client, '은', '는')} 【업종/주요 사업을 1~2줄로 입력】 기업입니다.\n홈페이지 역시 ${client}의 전문성과 강점을 효과적으로 보여줄 수 있도록 기획했습니다.`;
  text(`👉 프로젝트 소개\n\n${intro}`);

  // 3. 메인 디자인 컨셉 — 컬러/서체 + 메인 섹션 구성 + 인터랙션
  const tone = site.colors.backgroundLightness >= 0.5 ? '화이트' : '다크';
  const accent = site.colors.accents[0];
  const conceptLines = [
    accent ? `${tone} 바탕에 ${colorName(accent)}(${accent}) 계열의 포인트 컬러를 사용하고,` : `${tone} 중심의 컬러와 절제된 레이아웃을 사용하고,`,
    `${site.fonts.length ? `${joinKo(site.fonts)} 서체로` : '깔끔한 타이포그래피로'} 가독성과 통일감을 높였습니다.`,
  ];
  if (home) {
    const heroTexts = new Set([...site.sloganCandidates.map((s) => s.text), home.hero && home.hero.title].filter(Boolean));
    const sections = (home.headings || []).filter((h) => !heroTexts.has(h) && h.length <= 30).slice(0, 5);
    if (sections.length >= 2) conceptLines.push(`메인 페이지는 ‘${sections.join(' → ')}’ 순서의 섹션으로 구성해, 스크롤 한 번에 기업의 핵심 정보를 훑어볼 수 있습니다.`);
    const f = home.features || {};
    const libs = f.libs || [];
    if (f.videos) conceptLines.push('메인 비주얼에는 영상을 사용해 역동적인 첫인상을 주었습니다.');
    if (libs.includes('fullpage')) conceptLines.push('한 화면씩 넘어가는 풀페이지 스크롤로 각 섹션에 집중할 수 있도록 했습니다.');
    else if (libs.some((l) => ['gsap', 'scrolltrigger', 'aos', 'lenis'].includes(l))) conceptLines.push('스크롤에 맞춰 콘텐츠가 자연스럽게 나타나는 인터랙션을 적용해 몰입감을 높였습니다.');
    image(home);
  }
  text(`✨ 메인 디자인 컨셉\n\n${conceptLines.join('\n')}`);

  // 4. 페이지별 섹션 + 중간에 UX(메뉴 구조) 섹션
  const uxSection = () => text(`⚙️ 사용자 경험(UX)을 위한 설계\n\n메뉴는 ${josa(joinKo(menuNames), '으로', '로')} 구성해\n기업 소개부터 주요 정보까지 자연스럽게 탐색할 수 있도록 설계했습니다.\n복잡한 구조를 줄이고 필요한 정보에 빠르게 접근할 수 있도록 사용자 편의성을 높였습니다.`);
  const uxAfter = subPages.length >= 3 ? 2 : subPages.length;
  const featureUse = {}; // 같은 구성 요소 문장이 원고 전체에서 너무 반복되지 않도록 (유형별 최대 2회)
  subPages.forEach((p, i) => {
    const cat = categorize(p.name);
    const subs = joinKo(p.subs.slice(0, 4));
    const lines = [pick(`${cat.key}-intro`, cat.intro)(client, p.name, subs)];

    const hero = heroSentence(p, pick);
    if (hero) lines.push(hero);
    if (p.hero && p.hero.sub) usedSentences.add(stripPeriod(p.hero.sub)); // 상단 카피와 같은 문장을 본문 인용으로 또 쓰지 않도록

    const key = pickKeySentence(p, client, usedSentences);
    if (key) {
      usedSentences.add(key);
      lines.push(pick('key', [`본문에서는 ${quoteRa(key)} 내용을 중심으로 소개합니다.`, `${quoteRa(key)} 메시지를 핵심 내용으로 담았습니다.`]));
    }

    const features = collectFeatures(p)
      .sort((a, b) => FEATURE_PRIORITY.indexOf(a.type) - FEATURE_PRIORITY.indexOf(b.type))
      .filter((ft, idx, arr) => arr.findIndex((x) => x.type === ft.type) === idx) // 유형당 1개
      .filter((ft) => (featureUse[ft.type] || 0) < 2);
    let added = 0;
    for (const ft of features) {
      if (added >= 2) break;
      const s = featureSentence(ft, client, pick);
      if (!s) continue;
      lines.push(s);
      featureUse[ft.type] = (featureUse[ft.type] || 0) + 1;
      added++;
    }

    lines.push(pick(`${cat.key}-outro`, cat.outro)(client));
    image(p);
    text(`${cat.emoji} ${cat.title(client, p.name)}\n\n${lines.join('\n')}`);
    if (i + 1 === uxAfter && menuNames.length) uxSection();
  });
  if (!subPages.length && menuNames.length) uxSection();

  // 5. 마무리
  text(`👉 프로젝트를 마무리하며\n\n이번 프로젝트는 화려한 기능보다 브랜드의 가치를 효과적으로 전달하는 데 집중했습니다.\n앞으로도 기업의 특성을 반영한 맞춤형 홈페이지를 제작하여\n기업과 브랜드의 경쟁력을 높일 수 있는 웹사이트를 만들어가겠습니다.`);
  text(`앞으로도 ${josa(COMPANY, '은', '는')} 고객사의 니즈를 정확히 파악하고, 이를 충족시킬 수 있는 결과물을 만들어내기 위해 최선을 다하겠습니다!!`);
  text(`기업의 가치와 비전을 효과적으로 전달할 수 있는 홈페이지 제작과 관련하여\n궁금한 사항이나 도움이 필요하신 경우 언제든지 문의해주시기 바랍니다.\n\n감사합니다!`);

  // 복사용 평문: 이미지 자리에는 [이미지 n] 표시
  let n = 0;
  const plain = blocks.map((b) => (b.type === 'image' ? `[이미지 ${++n}] ${b.file}  (캡션: ${b.caption})` : b.text)).join('\n\n\n');

  return { clientName: client, blocks, text: plain };
}

module.exports = { buildManuscript, categorize, colorName, guessClientName, josa, sentences, COMPANY };
