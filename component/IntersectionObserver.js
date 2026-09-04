/** @format */

const aniEl = document.querySelectorAll("ani");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
      }
    });
  },
  {threshold: 0.2},
); // 20% 이상 보일 때
aniEl.forEach((item) => observer(item));
