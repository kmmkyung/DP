/** @format */

gsap.registerPlugin(ScrollTrigger);

window.addEventListener("DOMContentLoaded", function () {
  const navItems = document.querySelectorAll(
    ".section3 .content-nav .nav-item"
  );
  const boxCount = 4;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".section3 .content2 .content-wrap",
      start: "top top",
      end: "+=300%",
      scrub: true,
      pin: true,
      pinSpacing: false,
      // markers: true,
      onUpdate: (self) => {
        // 진행도에 따라 하단 네비 on 토글
        let idx = Math.floor(self.progress * boxCount);
        if (idx >= boxCount) idx = boxCount - 1;

        navItems.forEach((btn, i) => {
          btn.classList.toggle("on", i === idx);
        });
      },
    },
  });

  // === step1 : box1 (이미 열려있긴 하지만 진행 구간 라벨용) ===
  // === step2 : box2 열리고 box1 닫힘 ===
  tl.addLabel("step1")
    .to(".section3 .box2", {
      clipPath: "inset(0% 0 0 0)",
      duration: 0.5,
      ease: "none",
    })
    .to(
      ".section3 .box1 .box-bg",
      {
        y: "-30%",
        duration: 0.5,
        ease: "none",
      },
      "<"
    );
  // === step3 : box3 열리고 box2 닫힘 ===
  tl.addLabel("step2")
    .to(".section3 .box3", {
      clipPath: "inset(0% 0 0 0)",
      duration: 0.5,
      ease: "none",
    })
    .to(
      ".section3 .box2 .box-bg",
      {
        y: "-30%",
        duration: 0.5,
        ease: "none",
      },
      "<"
    );
  // === step4 : box4 열리고 box3 닫힘 ===
  tl.addLabel("step3")
    .to(".section3 .box4", {
      clipPath: "inset(0% 0 0 0)",
      duration: 0.5,
      ease: "none",
    })
    .to(
      ".section3 .box3 .box-bg",
      {
        y: "-30%",
        duration: 0.5,
        ease: "none",
      },
      "<"
    );
  tl.addLabel("step4");

  // === 하단 네비 클릭 시 해당 step으로 이동 ===
  navItems.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetLabel = btn.dataset.target;
      console.log(targetLabel);
      tl.tweenTo(targetLabel);
    });
  });

  ScrollTrigger.matchMedia({
    "(min-width: 812px)": function () {
      const sec4 = document.querySelector(".section4");
      const contentWrap = sec4.querySelector(".content2 .content-wrap");
  
      let tl4 = gsap.timeline({
        scrollTrigger: {
          trigger: ".section4 .content-container",
          start: "top top",
          end: "+=100%",
          pin: true,
          pinSpacing: true,
          scrub: 1,
          markers: true,
        },
      });
  
      tl4.fromTo(
        contentWrap,
        { yPercent: 0 },
        {
          yPercent: -50, // 오른쪽 요소 전체를 위로 100% 올리기
          duration: 2,
        }
      );
    },
  });
    






  const head = document.getElementById('head');
  const pcNav = document.getElementById('pcNav');
  const subBg = document.getElementById('subBg');

  const sloganSub = head.querySelector('h1 .subMenu[data-type="slogan"]') || head.querySelector('h1 .subMenu');
  const liSubs = [...pcNav.querySelectorAll(':scope > ul > li > .subMenu')];

  const setH = (el, h) => { if (el) el.style.height = (h || 0) + 'px'; };

  function openAll() {
    head.classList.add('on');

    // 1) 로고 아래 문구 열기
    let sloganH = 0;
    if (sloganSub) {
      const wrap = sloganSub.firstElementChild;
      sloganH = wrap ? wrap.scrollHeight : 0;
      setH(sloganSub, sloganH);
    }

    // 2) 모든 li 서브메뉴 열기
    let maxSubH = 0;
    liSubs.forEach(sm => {
      const wrap = sm.firstElementChild;
      const h = wrap ? wrap.scrollHeight : 0;
      setH(sm, h);
      if (h > maxSubH) maxSubH = h;
    });

    // 3) 배경 높이 = (문구/서브 중 큰 값)
    setH(subBg, Math.max(sloganH, maxSubH));
  }

  function closeAll() {
    head.classList.remove('on');
    setH(subBg, 0);
    setH(sloganSub, 0);
    liSubs.forEach(sm => setH(sm, 0));
  }

  // ✅ 올메뉴 버튼 = 토글
  const allBtn = head.querySelector('.allMenu-btn');
  allBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    head.classList.contains('on') ? closeAll() : openAll();
  });

  // ✅ 헤더에 마우스 올리면 전체 열기 (원하면 유지)
  head.addEventListener('mouseenter', openAll);

  // ✅ 헤더에서 마우스 나가면 닫기 (원하면 유지)
  head.addEventListener('mouseleave', closeAll);

  // 리사이즈 시 열려있으면 높이 재계산
  window.addEventListener('resize', () => {
    if (head.classList.contains('on')) openAll();
  });

  // 초기 닫힘
  closeAll();

  
});


(() => {
  
})();
