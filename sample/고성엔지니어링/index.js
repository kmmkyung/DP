/** @format */

gsap.registerPlugin(ScrollTrigger);

window.addEventListener("DOMContentLoaded", function () {
  const navItems = document.querySelectorAll(".section3 .box-nav .nav-item");
  const boxCount = 4;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".section3 .content2",
      start: "top top",
      end: "+=300%", // 단계 4개라 여유 있게
      scrub: true,
      pin: true,
      pinSpacing: false,
      markers: true,
      onUpdate: (self) => {
        // 진행도에 따라 네비 on 토글
        let idx = Math.floor(self.progress * boxCount);
        if (idx >= boxCount) idx = boxCount - 1;

        navItems.forEach((btn, i) => {
          btn.classList.toggle("on", i === idx);
        });
      },
    },
  });

  // ===== step1 : box1 열기 =====
  tl.addLabel("step1")
    .to(".section3 .box1 .box-content", {
      clipPath: "inset(0 0 0 0)",
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

  // ===== step2 : box2 열리고 box1 닫힘 =====
  tl.addLabel("step2")
    .to(".section3 .box2 .box-content", {
      clipPath: "inset(0 0 0 0)",
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
    )
    .to(
      ".section3 .box1 .box-content",
      {
        clipPath: "inset(0 0 100% 0)",
        duration: 0.5,
        ease: "none",
      },
      "<"
    );

  // ===== step3 : box3 열리고 box2 닫힘 =====
  tl.addLabel("step3")
    .to(".section3 .box3 .box-content", {
      clipPath: "inset(0 0 0 0)",
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
    )
    .to(
      ".section3 .box2 .box-content",
      {
        clipPath: "inset(0 0 100% 0)",
        duration: 0.5,
        ease: "none",
      },
      "<"
    );

  // ===== step4 : box4 열리고 box3 닫힘 =====
  tl.addLabel("step4")
    .to(".section3 .box4 .box-content", {
      clipPath: "inset(0 0 0 0)",
      duration: 0.5,
      ease: "none",
    })
    .to(
      ".section3 .box4 .box-bg",
      {
        y: "-30%",
        duration: 0.5,
        ease: "none",
      },
      "<"
    )
    .to(
      ".section3 .box3 .box-content",
      {
        clipPath: "inset(0 0 100% 0)",
        duration: 0.5,
        ease: "none",
      },
      "<"
    );

  // ===== 네비 클릭 시 해당 step으로 이동 =====
  navItems.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetLabel = btn.dataset.target;
      tl.tweenTo(targetLabel);
    });
  });
});
