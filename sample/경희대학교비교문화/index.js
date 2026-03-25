/** @format */

<script>
window.addEventListener('DOMContentLoaded', function() {
  gsap.registerPlugin(ScrollTrigger);
  // m11
  const sec2 = document.querySelector(".sec2");
  if (!sec2) return;

  const sec2Content1 = sec2.querySelector(".content1"); // left (pin)
  const sec2Content2 = sec2.querySelector(".content2"); // right (triggers)
  const visionListItems = sec2.querySelectorAll(".visionList .listItem"); // left
  // HTML class has a typo: listItme
  const visionContentItems = sec2.querySelectorAll(".visionContentList .listItme, .visionContentList .listItem"); // right

  const setActiveVision = (index) => {
    visionListItems.forEach((el, i) => {
      el.classList.toggle("active", i === index);
    });
  };

  const updateActiveFromCenter = () => {
    if (!visionContentItems.length || !visionListItems.length) return;

    const centerY = window.innerHeight / 2;
    const threshold = window.innerHeight * 0.25; // "중간에 보일 때" 범위

    let closestIndex = -1;
    let closestDistance = Infinity;

    visionContentItems.forEach((item, idx) => {
      if (idx >= visionListItems.length) return;

      const rect = item.getBoundingClientRect();
      const itemCenterY = rect.top + rect.height / 2;
      const distance = Math.abs(itemCenterY - centerY);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = idx;
      }
    });

    if (closestIndex >= 0 && closestDistance <= threshold) {
      setActiveVision(closestIndex);
    } else {
      setActiveVision(-1); // 중간에서 벗어나면 모두 제거
    }
  };

  // left 고정 + scroll 구간 길이 확보
  ScrollTrigger.create({
    trigger: ".sec2 .container1",
    start: "top +=100px",
    // end: () => "+=" + sec2.offsetHeight,
		end: "bottom +=1000px",
    pin: ".sec2 .container1 .content1 .visionList",
    pinSpacing: false,
    invalidateOnRefresh: true,
    markers: true,
		scrub: 1,
    onUpdate: updateActiveFromCenter,
    onRefresh: updateActiveFromCenter,
  });

  // 초기 1회 동기화
  updateActiveFromCenter();

  // 이미지 로딩 후 위치 재계산 (트리거 오차 방지)
  window.addEventListener('load', () => {
    ScrollTrigger.refresh();
  });

}); // DOMContentLoaded
</script>