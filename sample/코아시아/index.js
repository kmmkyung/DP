/** @format */

window.addEventListener("DOMContentLoaded", function () {
  gsap.registerPlugin(ScrollToPlugin);

  /* =========================
      CONFIG
  ========================= */
  const TOTAL_SECTIONS = 4;

  const PIN_IDX = 1; // sec2
  const PIN_IDX2 = 2; // sec3

  const DUR_SECTION = 0.85;
  const EASE_S = "power2.inOut";
  const COOLDOWN_MS = 1200;

  /* =========================
      STATE
  ========================= */
  let current = 0;
  let busy = false;
  let lastWheel = 0;

  let sec3Index = 0;

  /* =========================
      ELEMENTS
  ========================= */
  const track = document.getElementById("track");
  const navItems = document.querySelectorAll(".sectionNavItem");

  /* sec2 */
  const content1 = document.querySelector(".sec2 .content1");
  const textBox1 = document.querySelector(".sec2 .textBox1");
  const textBox2 = document.querySelector(".sec2 .textBox2");
  const secBg = document.querySelector(".sec2 .secBg");

  /* sec3 */
  const sec3Container = document.querySelector(".sec3 .container1");
  const sec3Items = document.querySelectorAll(".sec3 .content");
  const sec3NavList = document.querySelector(
    ".sec3 .sec3ContentNav .contentNavList",
  );
  const sec3NavItems = document.querySelectorAll(
    ".sec3 .sec3ContentNav .contentNavItem",
  );

  const SEC3_MAX = sec3Items.length - 1;

  if (!track || !sec3Container) {
    console.error("필수 요소 누락");
    return;
  }

  /* =========================
      INIT
  ========================= */
  gsap.set(track, {y: 0});

  function resetSec2() {
    gsap.set(secBg, {scale: 1});
    gsap.set(content1, {y: 0});

    gsap.set(textBox1, {
      opacity: 0,
      y: 0,
    });

    gsap.set(textBox2, {
      opacity: 0,
      y: 30,
    });
  }

  function resetSec3() {
    gsap.set(sec3Container, {
      x: "0vw",
    });
  }

  resetSec2();
  resetSec3();
  /* =========================
      SEC2 TIMELINE
  ========================= */
  const pinTl = gsap.timeline({
    paused: true,
  });

  pinTl
    .to(
      secBg,
      {
        scale: 1.8,
        duration: 1,
        ease: "power2.out",
      },
      0,
    )

    .to(
      content1,
      {
        y: "-200%",
        duration: 1,
        ease: "power2.out",
      },
      0,
    )

    .to(
      textBox1,
      {
        opacity: 1,
        duration: 1,
      },
      0.4,
    )

    .to(
      content1,
      {
        y: "-250%",
        duration: 1,
        ease: "power2.out",
      },
      1.3,
    )

    .to(
      textBox1,
      {
        opacity: 0,
        duration: 0.7,
      },
      1.3,
    )

    .to(
      textBox2,
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
      },
      1.3,
    );

  /* =========================
      NAV (top nav)
  ========================= */
  function updateNav(index) {
    navItems.forEach((item, i) => {
      item.classList.toggle("active", i === index);
    });
  }

  navItems.forEach((item, idx) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      if (busy || current === idx) return;
      goToSection(idx);
    });
  });

  /* =========================
      TRACK MOVE (VERTICAL)
  ========================= */
  function moveTrack(index) {
    gsap.to(track, {
      y: -(index * 100) + "vh",
      duration: DUR_SECTION,
      ease: EASE_S,
      onComplete: () => {
        busy = false;
      },
    });
  }

  /* =========================
      SECTION CHANGE
  ========================= */
  function goToSection(index) {
    if (index < 0 || index >= TOTAL_SECTIONS) {
      busy = false;
      return;
    }

    busy = true;
    current = index;

    updateNav(index);
    moveTrack(index);
  }

  /* =========================
      SEC2 CONTROL
  ========================= */
  function playSec2Forward() {
    busy = true;

    pinTl.eventCallback("onComplete", () => {
      busy = false;
    });

    pinTl.play();
  }

  function playSec2Reverse() {
    busy = true;

    pinTl.eventCallback("onReverseComplete", () => {
      busy = false;
    });

    pinTl.reverse();
  }

  /* =========================
      SEC3 (HORIZONTAL SLIDER)
  ========================= */
  function updateSec3Nav(index) {
    sec3NavItems.forEach((item, i) => {
      item.classList.toggle("active", i === index);
    });
  }

  function moveSec3(index) {
    if (index < 0 || index > SEC3_MAX) return;

    sec3Index = index;

    gsap.to(sec3Container, {
      x: -index * 100 + "vw",
      duration: 0.9,
      ease: "power2.inOut",
    });
    gsap.to(sec3NavList, {
      x: -(index - 1) * 33.3 + "%",
      duration: 0.9,
      ease: "power2.inOut",
    });

    updateSec3Nav(index);
  }

  /* sec3 nav click */
  sec3NavItems.forEach((item, idx) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      moveSec3(idx);
    });
  });

  /* =========================
      WHEEL CONTROL
  ========================= */
  window.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();

      const now = Date.now();
      if (busy) return;
      if (now - lastWheel < COOLDOWN_MS) return;

      lastWheel = now;

      /* =========================
          SEC2 (PIN ANIMATION)
      ========================= */
      if (current === PIN_IDX) {
        if (e.deltaY > 0) {
          if (pinTl.progress() < 1) {
            playSec2Forward();
          } else {
            goToSection(current + 1);
          }
        } else {
          if (pinTl.progress() > 0) {
            playSec2Reverse();
          } else {
            goToSection(current - 1);
          }
        }
        return;
      }

      /* =========================
          SEC3 (HORIZONTAL SLIDE)
      ========================= */
      if (current === PIN_IDX2) {
        if (e.deltaY > 0) {
          if (sec3Index < SEC3_MAX) {
            moveSec3(sec3Index + 1);
          } else {
            goToSection(current + 1);
          }
        } else {
          if (sec3Index > 0) {
            moveSec3(sec3Index - 1);
          } else {
            goToSection(current - 1);
          }
        }
        return;
      }

      /* =========================
          NORMAL SECTIONS
      ========================= */
      if (e.deltaY > 0) {
        goToSection(current + 1);
      } else {
        goToSection(current - 1);
      }
    },
    {passive: false},
  );

  /* =========================
      INIT NAV
  ========================= */
  updateNav(0);
});
