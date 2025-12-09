// index.js
window.addEventListener("DOMContentLoaded", () => {
  const tabList = document.querySelector('.tab-list');
  const tabItem = document.querySelectorAll('.tab-list .list-item:not(.list-item__bg)');
  const tabItemBg = tabList.querySelector('.list-item__bg');
  const contents = document.querySelectorAll('.tab-content .tab-cont');

  // 이동함수 (immediate가 true면 애니메이션 없이 즉시 이동)
  function moveTabBgTo(tabItem, immediate = false) {
    if (!tabItem) return;
    if (window.innerWidth <= 768) return;

    const itemRect = tabItem.getBoundingClientRect();
    const ListRect = tabList.getBoundingClientRect();
    const left = itemRect.left - ListRect.left;
    const width = itemRect.width;
    tabItemBg.style.transition = immediate ? 'none' : '';
    tabItemBg.style.left = left + 'px';
    tabItemBg.style.width = width + 'px';
  }
  
  // 현재 활성화 탭으로 이동
  function moveTabBgToActive(immediate = false) {
    const active = tabList.querySelector('li.on');
    if (active) moveTabBgTo(active, immediate);
  }
  
  // 초기 위치
  moveTabBgToActive(true);
  
  // 이벤트 설정
  tabItem.forEach((item, idx) => {
    const aTag = item.querySelector('a');

    // on이 아닌 li에 hover 진입
    item.addEventListener('mouseenter', function(){
      if (window.innerWidth <= 768) return;
      const currentActive = tabList.querySelector('li.on');

      if (!item.classList.contains('on')) {
        if (currentActive) currentActive.classList.add('leave');
        moveTabBgTo(item);
      }
    });

    // hover 이탈 → on으로 복귀
    item.addEventListener('mouseleave', () => {
      if (window.innerWidth <= 768) return;
      const currentActive = tabList.querySelector('li.on');
      if (currentActive) currentActive.classList.remove('leave');
      moveTabBgToActive();
    });

    // 클릭 → on으로 갱신 + 컨텐츠 노출
    aTag.addEventListener('click', event => {
      event.preventDefault();
      tabItem.forEach(li => li.classList.remove('on'));
      item.classList.add('on');
      moveTabBgTo(item);

      if (contents.length) {
        contents.forEach(function(item){
          item.classList.remove('on')
        });
        contents[idx].classList.add('on')
      }
    });
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth <= 768) {
      tabItemBg.style.display = 'none';
    } else {
      tabItemBg.style.display = 'block';
      moveTabBgToActive(true);
    }
  });

});


