<?php
// 언어전환 — /en → ENG, /cn → CHN, 그 외 KOR
$headerLanguageItems = [
	['label' => 'KOR', 'url' => HOME_DIR],
	['label' => 'ENG', 'url' => HOME_DIR_EN],
	['label' => 'CHN', 'url' => HOME_DIR_CN],
];

// parse_url() <- url에서 경로만 추출 /en/about ...
// $_SERVER['REQUEST_URI'] <- 현재 url
// PHP_URL_PATH <- url path만 배열반환
// 추출한 경로(현재  url 있으면 써 ?? 없으면 기본 / , 를 받아서 path만 추출해) ?: 값이 false면 빈 문자열
$headerCurrentPath = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '';
$enPrefix = rtrim(HOME_DIR_EN, '/'); // /en/ 일 경우 -> /en
$cnPrefix = rtrim(HOME_DIR_CN, '/');
// str_starts_with($headerCurrentPath, $enPrefix . '/') <- $headerCurrentPath가 $enPrefix으로 시작하면 true
// if(/en || /en/)
if ($headerCurrentPath === $enPrefix || str_starts_with($headerCurrentPath, $enPrefix . '/')) {
	$headerCurrentLanguage = 'ENG';
} elseif ($headerCurrentPath === $cnPrefix || str_starts_with($headerCurrentPath, $cnPrefix . '/')) {
	$headerCurrentLanguage = 'CHN';
} else {
	$headerCurrentLanguage = 'KOR';
}
?>


<div class="header__language">
  <button type="button" class="header__language-btn">
    <?= $headerCurrentLanguage ?><i class="header__language-icon"></i>
  </button>
  <ul class="header__language-list">
  <?php foreach ($headerLanguageItems as $languageItem) : ?>
    <li class="header__language-item">
      <a href="<?= $languageItem['url'] ?>"><?= $languageItem['label'] ?></a>
    </li>
  <?php endforeach; ?>
  </ul>
</div>
