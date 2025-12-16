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
  const sloganSubMenu = head.querySelector('h1 .subMenu[data-type="slogan"]');
  const allPCNavSubMenus = head.querySelectorAll('.pcNav .subMenu');
  
  const targetHeight = '332px';

  function handleMouseEnter() {
      head.classList.add('on'); 

      if (sloganSubMenu) {
          sloganSubMenu.style.height = targetHeight;
      }

      allPCNavSubMenus.forEach(subMenu => {
          subMenu.style.height = targetHeight;
      });
  }

  function handleMouseLeave() {
      head.classList.remove('on');

      if (sloganSubMenu) {
          sloganSubMenu.style.height = '0';
      }
      
      allPCNavSubMenus.forEach(subMenu => {
          subMenu.style.height = '0';
      });
  }
pcNav.addEventListener('mouseenter', handleMouseEnter);
head.addEventListener('mouseleave', handleMouseLeave);
});
