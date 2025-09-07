window.addEventListener('DOMContentLoaded', () => {
  const scroller = document.querySelector('.page[data-scroll-container]');
  const wrap  = document.querySelector('.history-wrap');
  const bar   = document.querySelector('.history-year');
  const line  = document.querySelector('.year-line');
  const years = [...document.querySelectorAll('.year-list .list-item[data-year]')];
  const dts   = [...document.querySelectorAll('dt[data-year]')];
  const last  = years.length - 1;

  const loco = new LocomotiveScroll({ el: scroller, smooth: true, smartphone:{smooth:true}, tablet:{smooth:true} });

  document.querySelector('.history-content').style.paddingTop = bar.offsetHeight + 'px';

  const idxByYear = Object.fromEntries(years.map((li,i)=>[li.dataset.year,i]));

  let dtY = dts.map(dt => loco.scroll.instance.scroll.y + dt.getBoundingClientRect().top);
  const r = wrap.getBoundingClientRect();
  const secTop = loco.scroll.instance.scroll.y + r.top;
  const secBot = secTop + r.height;
  const bounds = dts.slice(0,-1).map((_,i)=> (dtY[i] + dtY[i+1]) / 2);

  let active = 0;
  const setActive = i => {
    years[active].classList.remove('on');
    years[i].classList.add('on');
    line.style.setProperty('--lineWidth', (i / last * 100) + '%');
    active = i;
  };

  const findIndex = y => {
    if (y < bounds[0]) return 0;
    if (y >= bounds[bounds.length-1]) return dts.length - 1;
    for (let i=0;i<bounds.length;i++) if (y < bounds[i]) return i;
    return dts.length - 1;
  };

  const update = () => {
    const cur = loco.scroll.instance.scroll.y + 250;
    if (cur <= secTop) { setActive(0); return; }
    if (cur >= secBot) { setActive(last); return; }
    setActive(findIndex(cur));
  };

  loco.on('scroll', update);

  years.forEach(li => {
    li.addEventListener('click', () => {
      const i = idxByYear[li.dataset.year];
      setActive(i);
      const y = dtY[i] - 250;
      loco.scrollTo(y, { duration: 800, disableLerp: true });
    });
  });

  setActive(0);
  update();
});
