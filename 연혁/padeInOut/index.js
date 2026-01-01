window.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

	const header = document.querySelector("#header");
  const section = document.querySelector(".m13 .section1");
  const yearsWrap = section.querySelector(".year-content");
  const years = gsap.utils.toArray(section.querySelectorAll(".year-list .list-item"));
  const boxes = gsap.utils.toArray(section.querySelectorAll(".month-box"));
  const items = gsap.utils.toArray(section.querySelectorAll(".month-item"));

  if (!yearsWrap || !items.length) return;

  function setYear(idx) {
    years.forEach((el, i) => el.classList.toggle("active", i === idx));
  }

  const mm = gsap.matchMedia();

  mm.add("(min-width: 813px)", () => {
    setYear(0);

    ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      pin: yearsWrap,
      scrub: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onEnter: function(){ header.style.transform = "translateY(-110px)";},
			onEnterBack: function(){ header.style.transform = "translateY(-110px)";},
			onLeave: function(){ header.style.transform = "translateY(0px)";},
			onLeaveBack: function(){ header.style.transform = "translateY(0px)";}
    });

    items.forEach((item) => {
      ScrollTrigger.create({
        trigger: item,
        start: "top 90%",
        end: "bottom 16%",
        toggleClass: "active",
        invalidateOnRefresh: true,
       // markers: true,
      });
    });

    boxes.forEach((box, idx) => {
      ScrollTrigger.create({
        trigger: box,
        start: "top center",
        end: "bottom center",
        onEnter: () => setYear(idx),
        onEnterBack: () => setYear(idx),
        invalidateOnRefresh: true,
      });
    });


    return () => {
      items.forEach((el) => el.classList.remove("active"));
      years.forEach((el) => el.classList.remove("active"));
    };
  });

  function hardRefresh() {
    requestAnimationFrame(() => {
      ScrollTrigger.refresh(true);
      requestAnimationFrame(() => ScrollTrigger.refresh(true));
    });
  }

  window.addEventListener("resize", hardRefresh);
  window.addEventListener("load", hardRefresh);
});
