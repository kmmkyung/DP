'use strict';

// 템플릿 치환으로 블로그 원고를 만든다 (외부 API 사용 안 함)
// 문장 틀은 기존 홍보 글(대혜건축 제작후기)의 흐름을 따른다.
// 【 】로 표시된 부분은 기계가 알 수 없는 내용이므로 기획자가 직접 채운다.

const COMPANY = '디자인픽셀';

// 메뉴 이름으로 페이지 성격을 추정해 소제목/설명 문장을 고른다. 위에서부터 먼저 맞는 것을 사용.
const CATEGORIES = [
  {
    key: 'portfolio',
    test: /project|portfolio|works|case|gallery|실적|포트폴리오|사례|갤러리|시공/i,
    emoji: '🗂️',
    title: (c, n) => `${c}의 경쟁력을 보여주는 ${n} 페이지`,
    body: (c, subs) => `다양한 ${josa(subs || '사례', '을', '를')} 한눈에 확인할 수 있는 포트폴리오 페이지입니다.\n카테고리별로 구성하여 사용자가 원하는 사례를 쉽게 탐색할 수 있으며,\n고품질 이미지를 중심으로 ${c}의 경쟁력을 강조했습니다.`,
  },
  {
    key: 'product',
    test: /product|shop|item|제품|상품/i,
    emoji: '🛍️',
    title: (c, n) => `제품의 특징이 잘 드러나는 ${n} 페이지`,
    body: (c, subs) => `${subs ? `${subs} 등 ` : ''}${c}의 제품을 소개하는 페이지입니다.\n제품 이미지와 핵심 정보를 정돈된 레이아웃으로 배치해\n고객이 원하는 제품을 빠르게 비교하고 찾을 수 있도록 구성했습니다.`,
  },
  {
    key: 'about',
    test: /about|company|greeting|ceo|history|vision|회사|기업|소개|인사말|연혁|비전|철학/i,
    emoji: '📌',
    title: () => '아이덴티티와 기업의 방향성을 살린 콘텐츠 구성',
    body: (c, subs) => `${subs ? `${subs} 등 ` : ''}${josa(c, '을', '를')} 소개하는 페이지입니다.\n기업의 역사와 철학을 중심으로 ${c}의 정체성을 전달하며,\n브랜드 이미지를 직관적으로 이해할 수 있도록 구성했습니다.`,
  },
  {
    key: 'business',
    test: /business|service|solution|tec|technology|r&d|automation|robot|사업|서비스|솔루션|분야|기술|연구|자동화|제어|로봇/i,
    emoji: '💡',
    title: (c, n) => `${n} 중심의 콘텐츠 구성`,
    body: (c, subs) => `${subs ? `${subs} 등 ` : ''}${c}의 핵심 사업 영역을 소개하는 페이지입니다.\n설명은 간결하게 정리하고 이미지를 중심으로 배치해\n${c}의 전문성을 직관적으로 전달하도록 설계했습니다.`,
  },
  {
    key: 'recruit',
    test: /career|recruit|join|채용|인재/i,
    emoji: '🤝',
    title: () => '함께할 인재를 위한 채용 페이지',
    body: (c, subs) => `${subs ? `${subs} 등 ` : ''}채용 정보를 한 곳에 모은 페이지입니다.\n${c}의 인재상과 채용 절차를 명확하게 안내해\n지원자가 필요한 정보를 쉽게 확인할 수 있도록 구성했습니다.`,
  },
  {
    key: 'contact',
    test: /contact|inquiry|location|map|문의|오시는|견적|상담/i,
    emoji: '📞',
    title: () => '고객과의 접점을 높인 문의 페이지',
    body: (c, subs) => `${subs ? `${subs} 등 ` : ''}고객이 ${c}에 쉽게 연락할 수 있도록 만든 페이지입니다.\n문의 절차를 단순하게 구성해\n방문자가 망설임 없이 상담을 요청할 수 있도록 했습니다.`,
  },
  {
    key: 'news',
    test: /\bpr\b|\bir\b|news|notice|board|media|press|community|공지|소식|홍보|게시판|고객센터|커뮤니티|투자/i,
    emoji: '📰',
    title: (c, n) => `${c}의 소식을 전하는 ${n} 페이지`,
    body: (c, subs) => `${subs ? `${subs} 등 ` : ''}${c}의 새로운 소식을 전하는 페이지입니다.\n게시물을 깔끔한 목록 형태로 정리해\n방문자가 최신 소식을 쉽게 확인할 수 있도록 구성했습니다.`,
  },
];

const DEFAULT_CATEGORY = {
  key: 'default',
  emoji: '📄',
  title: (c, n) => `${n} 페이지 구성`,
  body: (c, subs) => `${subs ? `${subs} 등으로 구성된 ` : ''}${c}의 정보를 담은 페이지입니다.\n【이 페이지의 특징을 1~2줄로 입력】`,
};

function categorize(name) {
  return CATEGORIES.find((c) => c.test.test(name)) || DEFAULT_CATEGORY;
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

/**
 * @param {object} site crawlSite() 결과
 * @returns {{clientName: string, blocks: Array<{type: 'text'|'image', text?: string, file?: string, caption?: string}>, text: string}}
 */
function buildManuscript(site) {
  const client = guessClientName(site);
  const slogan = site.sloganCandidates[0] ? site.sloganCandidates[0].text : '【메인 슬로건】';
  const okPages = site.pages.filter((p) => !p.error);
  const home = okPages.find((p) => p.isHome);
  const subPages = okPages.filter((p) => !p.isHome);
  const menuNames = site.pages.filter((p) => !p.isHome).map((p) => p.name);

  const blocks = [];
  const text = (t) => blocks.push({ type: 'text', text: t });
  const image = (p) => blocks.push({ type: 'image', file: p.screenshot, fullFile: p.screenshotFull, caption: p.isHome ? 'MAIN' : p.name });

  // 1. 인사 + 고객사 소개
  text(`안녕하세요!!\n기업 맞춤형 웹사이트 제작 전문 업체 ${COMPANY}입니다!`);
  text(`${client}\n${site.url}\n${slogan}`);
  text(`기업 홈페이지는 브랜드의 첫인상을 결정하는 중요한 공간입니다.\n이번 ${client} 프로젝트는 【핵심 강점: 예) 40년 이상의 역사와 전문성】을 효과적으로 전달하면서,\n【강조 포인트: 예) 프로젝트 중심의 브랜드 이미지】를 구축하는 데 중점을 두고 제작했습니다.`);

  // 2. 프로젝트 소개
  // meta description이 회사명과 같거나 너무 짧으면 쓸모가 없으므로, 메인 페이지 본문의 첫 소개 문장으로 대체
  const usefulDesc = site.description && site.description !== client && site.description.length >= 15 ? site.description : '';
  const homeIntro = home ? (home.paragraphs || []).find((t) => t.length >= 30 && t.includes(client)) : '';
  const description = usefulDesc || homeIntro;
  const intro = description
    ? `${description}\n홈페이지 역시 ${client}의 전문성과 강점을 효과적으로 보여줄 수 있도록 기획했습니다.`
    : `${josa(client, '은', '는')} 【업종/주요 사업을 1~2줄로 입력】 기업입니다.\n홈페이지 역시 ${client}의 전문성과 강점을 효과적으로 보여줄 수 있도록 기획했습니다.`;
  text(`👉 프로젝트 소개\n\n${intro}`);

  // 3. 메인 디자인 컨셉 (컬러/서체는 사이트에서 추출)
  const tone = site.colors.backgroundLightness >= 0.5 ? '화이트' : '다크';
  const accent = site.colors.accents[0];
  const colorLine = accent
    ? `${tone} 바탕에 ${colorName(accent)}(${accent}) 계열의 포인트 컬러를 사용하고,`
    : `${tone} 중심의 컬러와 절제된 레이아웃을 사용하고,`;
  const fontLine = site.fonts.length ? `${joinKo(site.fonts)} 서체로 가독성과 통일감을 높여` : '깔끔한 타이포그래피로 가독성과 통일감을 높여';
  if (home) image(home);
  text(`✨ 메인 디자인 컨셉\n\n${colorLine}\n${fontLine}\n${josa(client, '이', '가')} 추구하는 신뢰감과 전문성을 시각적으로 표현했습니다.\n【디자인 방향을 1줄로 보충 입력 (선택)】`);

  // 4. 페이지별 섹션 + 중간에 UX(메뉴 구조) 섹션
  const uxSection = () => text(`⚙️ 사용자 경험(UX)을 위한 설계\n\n메뉴는 ${josa(joinKo(menuNames), '으로', '로')} 구성해\n기업 소개부터 주요 정보까지 자연스럽게 탐색할 수 있도록 설계했습니다.\n복잡한 구조를 줄이고 필요한 정보에 빠르게 접근할 수 있도록 사용자 편의성을 높였습니다.`);
  const uxAfter = subPages.length >= 3 ? 2 : subPages.length;
  subPages.forEach((p, i) => {
    const cat = categorize(p.name);
    const subs = joinKo(p.subs.slice(0, 4));
    image(p);
    text(`${cat.emoji} ${cat.title(client, p.name)}\n\n${cat.body(client, subs)}`);
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

module.exports = { buildManuscript, categorize, colorName, guessClientName, josa, COMPANY };
