/** @format */

const playHeaderIntro = function () {
  const header = document.querySelector(".header");
  const logo = document.querySelector(".header__logo");
  const btnMenu = document.querySelector(".header__btn-menu");
  const pcNav = document.querySelector(".header__pc-nav");
  const language = document.querySelector(".header__language");
  const revealTargets = [pcNav, language].filter(Boolean);

  // 메인만 재생 — 서브(_sub_top)는 is-intro 없음
  if (
    !document.body.classList.contains("is-intro") ||
    !header ||
    !logo ||
    !btnMenu
  ) {
    return;
  }

  // 인트로 중 스크롤만 차단 — lenis.stop()은 overflow hidden으로 스크롤바가 사라졌다가 다시 생겨 화면이 밀림
  const preventIntroScroll = (e) => {
    e.preventDefault();
  };
  const unlockIntroScroll = () => {
    window.removeEventListener("wheel", preventIntroScroll, {capture: true});
    window.removeEventListener("touchmove", preventIntroScroll, {
      capture: true,
    });
  };

  // 종료 — is-intro-reveal로 nav·언어 CSS 숨김 해제, GSAP 인라인 스타일 제거
  const finishIntro = function () {
    document.body.classList.remove("is-intro");
    document.body.classList.add("is-intro-reveal");
    header.style.pointerEvents = "";
    gsap.set([logo, btnMenu].concat(revealTargets), {
      clearProps: "transform,opacity,visibility",
    });
    unlockIntroScroll();
  };

  // 모션 축소 설정 — 이동 없이 최종 헤더만 노출
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    finishIntro();
    return;
  }

  header.style.pointerEvents = "none";
  window.addEventListener("wheel", preventIntroScroll, {
    passive: false,
    capture: true,
  });
  window.addEventListener("touchmove", preventIntroScroll, {
    passive: false,
    capture: true,
  });

  // FLIP — 가운데(is-intro) 좌표를 잰 뒤 클래스 제거해 좌우 자리로 되돌리고, 그 차이를 x/y로 보정
  const firstLogo = logo.getBoundingClientRect();
  const firstBtn = btnMenu.getBoundingClientRect();

  document.body.classList.remove("is-intro");

  const lastLogo = logo.getBoundingClientRect();
  const lastBtn = btnMenu.getBoundingClientRect();

  gsap.set(logo, {
    x: firstLogo.left - lastLogo.left,
    y: firstLogo.top - lastLogo.top,
  });
  gsap.set(btnMenu, {
    x: firstBtn.left - lastBtn.left,
    y: firstBtn.top - lastBtn.top,
  });

  // 0.45s 정지 후 좌우 이동, 끝나기 직전 PC nav·언어 페이드 (common.css is-intro-reveal)
  const tl = gsap.timeline({
    delay: 0.45,
    onComplete: finishIntro,
  });

  tl.to(logo, {x: 0, y: 0, duration: 1.1, ease: "power3.inOut"}, 0)
    .to(btnMenu, {x: 0, y: 0, duration: 1.1, ease: "power3.inOut"}, 0)
    .add(function () {
      gsap.set(revealTargets, {autoAlpha: 0});
      document.body.classList.add("is-intro-reveal");
    }, "-=0.2")
    .to(revealTargets, {autoAlpha: 1, duration: 0.5, ease: "power2.out"});
};

playHeaderIntro();
