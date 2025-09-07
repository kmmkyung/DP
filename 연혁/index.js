window.addEventListener('load', () => {
  const scroller = document.querySelector('.page[data-scroll-container]');
  const years = [...document.querySelectorAll('.year-list .list-item[data-year]')];
  const dts = [...document.querySelectorAll('dt[data-year]')];
  const line = document.querySelector('.year-line');

  const loco = new LocomotiveScroll({
    el: scroller,
    smooth: true,
    smartphone: { smooth: true },
    tablet: { smooth: true }
  });

  const scrollOffset = () => innerHeight * 0.4;
  let activeIndex = 0;

  const setActive = (i) => {
    // 이미 활성화된 요소라면 DOM 조작을 하지 않습니다.
    if (activeIndex === i) return;
    activeIndex = i;
    years.forEach((li, j) => li.classList.toggle('on', j === i));
    line.style.setProperty('--lineWidth', (i / Math.max(1, years.length - 1) * 100) + '%');
  };

  const updateActiveYear = () => {
    const a = scrollOffset();
    const lastIdx = dts.length - 1;
  
    for (let k = 0; k < dts.length; k++) {
      const top = dts[k].getBoundingClientRect().top;
      
      if (k === lastIdx && a >= top) {
        setActive(lastIdx);
        return;
      }
      
      if (a >= top && (k === lastIdx || a < dts[k + 1].getBoundingClientRect().top)) {
        setActive(k);
        return;
      }
    }
  };
  
  const handleScrollAndResize = () => {
    requestAnimationFrame(updateActiveYear);
  };
  
  loco.on('scroll', handleScrollAndResize);
  window.addEventListener('resize', handleScrollAndResize);
  
  handleScrollAndResize();

  years.forEach((li, i) => {
    li.addEventListener('click', () => {
      // 현재 활성화된 요소와 클릭한 요소가 같다면 스크롤을 실행하지 않습니다.
      if (activeIndex === i) {
        return;
      }

      setActive(i); // 클릭 시 바로 활성화 상태 변경
      const target = document.querySelector(`dt[data-year="${li.dataset.year}"]`);

      // `overflow`에 영향을 받지 않는 문서 내 절대 Y좌표를 계산합니다.
      const absoluteTargetY = loco.scroll.instance.scroll.y + target.getBoundingClientRect().top;
      
      const targetY = absoluteTargetY - scrollOffset();

      loco.scrollTo(targetY, { 
        duration: 250, 
        disableLerp: true 
      });
    });
  });
});