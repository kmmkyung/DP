window.addEventListener('DOMContentLoaded',function(){
  // header submenu 보이게하기
  const menuTitle = document.querySelectorAll('.mainMenu-list .menuTitle')
  const subMenuWrap = document.querySelectorAll('.mainMenu-list .subMenu-wrap')
  const subMenu = document.querySelectorAll('.mainMenu-list .subMenu-list')


  menuTitle.forEach(function(ele,idx){
    let vh = subMenu[idx].clientHeight;

    ele.addEventListener('mouseenter',function(){
      subMenuWrap[idx].style.height = vh + "px";
    })
    ele.addEventListener('mouseleave',function(){
      subMenuWrap[idx].style.height = 0;
    })
  })

  // header 버튼 누르면 전체메뉴 보이게 하기
  const menuButton = document.querySelector('.menu-button')
  const menuAll = document.querySelector('.menu-all')
  const menuClose = document.querySelector('.menu-close')
  menuButton.addEventListener('click',function(){
    menuAll.classList.add('active')
  })
  menuClose.addEventListener('click',function(){
    menuAll.classList.remove('active')
  })

  // 스크롤시 header 고정
  let header = document.querySelector('.header')
  window.addEventListener('scroll',function(){
    if(this.window.scrollY >= header.offsetHeight){
      header.classList.add('active')
    }
    else{
      header.classList.remove('active')
    }
  })
})