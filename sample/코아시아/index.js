/** @format */

window.addEventListener("DOMContentLoaded", function () {
  // Observer는 필요 시 사용, 현재는 wheel 이벤트 위주
  gsap.registerPlugin(ScrollToPlugin);

  /* =========================
      CONFIG
  ========================= */
  const TOTAL_SECTIONS = 4;
  const PIN_IDX = 1; // sec2
  const DUR_SECTION = 0.85;
  const EASE_S = "power2.inOut";
  const COOLDOWN_MS = 1000;

  // 스크롤 감도 설정 (값이 클수록 많이 돌려야 넘어감)
  const SCRUB_TOTAL = 1500;
  const SCRUB_DUR = 0.5;

  /* =========================
      STATE
  ========================= */
  let current = 0;
  let busy = false;
  let lastWheel = 0;
  let pinAcc = 0;
  let pinExiting = false;

  /* =========================
      ELEMENTS
  ========================= */
  const track = document.getElementById("track");
  const navItems = document.querySelectorAll(".sectionNavItem");

  // SEC2 요소들
  const textBox1 = document.querySelector(".textBox1");
  const textBox2 = document.querySelector(".textBox2");
  const secBg = document.querySelector(".secBg");

  /* =========================
      NAV
  ========================= */
  function updateNav(index) {
    navItems.forEach((item, i) => {
      item.classList.toggle("active", i === index);
    });
  }

  navItems.forEach((item, idx) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      if (current === idx || busy) return;
      goToSection(idx);
    });
  });

  /* =========================
      SECTION MOVE
  ========================= */
  function goToSection(index) {
    if (index < 0 || index >= TOTAL_SECTIONS) {
      busy = false;
      return;
    }

    busy = true;
    current = index;
    updateNav(index);

    gsap.to(track, {
      y: -(index * 100) + "vh",
      duration: DUR_SECTION,
      ease: EASE_S,
      onComplete: () => {
        // 섹션 이동 완료 후 쿨다운
        setTimeout(() => {
          busy = false;
          pinExiting = false;
        }, 100);

        // SEC2에 진입했을 때 초기화
        if (index === PIN_IDX) {
          pinAcc = 0;
          resetSec2();
        }
      },
    });
  }

  function resetSec2() {
    gsap.set(textBox1, {opacity: 1, y: 0});
    gsap.set(textBox2, {opacity: 0, y: 30});
  }

  /* =========================
      PIN SCRUB (SEC2)
  ========================= */
  function scrubPin(deltaY) {
    if (pinExiting || busy) return;

    pinAcc += deltaY;

    // 1. 위로 나가기 (이전 섹션)
    if (pinAcc <= 0) {
      pinAcc = 0;
      pinExiting = true;
      goToSection(current - 1);
      return;
    }

    // 2. 아래로 나가기 (다음 섹션)
    if (pinAcc >= SCRUB_TOTAL) {
      pinAcc = SCRUB_TOTAL;
      pinExiting = true;
      goToSection(current + 1);
      return;
    }

    // 3. 내부 스크러빙 애니메이션 로직
    const p = pinAcc / SCRUB_TOTAL; // 0 ~ 1

    // 텍스트 교체 (0.5 지점에서 교차)
    // textBox1: 사라짐
    gsap.to(textBox1, {
      opacity: p < 0.4 ? 1 - p * 2.5 : 0,
      y: -50 * p,
      duration: SCRUB_DUR,
      overwrite: true,
    });

    // textBox2: 나타남
    gsap.to(textBox2, {
      opacity: p > 0.6 ? (p - 0.6) * 2.5 : 0,
      y: 30 * (1 - p),
      duration: SCRUB_DUR,
      overwrite: true,
    });

    // 배경 효과 (선택 사항)
    if (secBg) {
      gsap.to(secBg, {scale: 1 + p * 0.1, duration: 2, overwrite: true});
    }
  }

  /* =========================
      WHEEL CONTROL
  ========================= */
  window.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      const now = Date.now();

      // SEC2 핀 섹션 로직
      if (current === PIN_IDX && !busy) {
        scrubPin(e.deltaY);
        return;
      }

      // 일반 섹션 이동
      if (busy) return;
      if (now - lastWheel < COOLDOWN_MS) return;

      lastWheel = now;
      if (e.deltaY > 0) {
        goToSection(current + 1);
      } else {
        goToSection(current - 1);
      }
    },
    {passive: false},
  );

  /* =========================
      INIT
  ========================= */
  gsap.set(track, {y: 0});
  resetSec2();
  updateNav(0);
});
