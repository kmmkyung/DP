window.addEventListener('DOMContentLoaded',function(){

  // 메인 메뉴 - 서브 메뉴 보이기
  function menuShow(){
    const navItem = document.querySelectorAll('.nav-item');
    const subNavList = document.querySelectorAll('.subNav-list')
    navItem.forEach(function(ele,idx){
      let subNavListHeight = subNavList[idx].clientHeight;
      ele.addEventListener('mouseenter',function(){
        // subNavList[idx].classList.add('active')
        subNavList[idx].style.height = subNavListHeight+'px'
      })
      ele.addEventListener('mouseleave',function(){
        subNavList[idx].style.height = 0+'px'
      })
    })
  }
  menuShow() // 최초 호출

  // 하단 상단으로 버튼 클릭시 페이지 상단 이동
  function moveTop(){
    const btn = document.querySelector('.footer-top');
    const section1 = document.querySelector('.section1')
    btn.addEventListener('click',function(){
      window.scrollTo(0,0)
      // section1.scrollIntoView({behavior:'smooth',black:'start'})
    })
  }
  moveTop() // 최초 호출
})