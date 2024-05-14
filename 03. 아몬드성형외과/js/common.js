window.addEventListener('DOMContentLoaded',function(){
  // 메뉴 버튼 누르면 메뉴 보임
  const menuBtnOpen = document.querySelector('.header .menu')
  const menu = document.querySelector('.menuAll')
  const menuBtnClose = document.querySelector('.menuAll .menuAll-close')
  menuBtnOpen.addEventListener('click',function(){
    menu.classList.add('active')
    menu.style.transition ="transform 0.4s ease-in, opacity 1s 0.2s"
  })
  menuBtnClose.addEventListener('click',function(){
    menu.style.transition ="transform 1s ease-in, opacity 0.4s"
    menu.classList.remove('active')
  })

  // 메뉴버튼 누르면 서브메뉴 보여짐
  const menuItem = document.querySelectorAll('.menuAll-menu .menu-list>.list-item') // 메뉴리스트 
  const menuList = document.querySelectorAll('.menuAll-menu .menu-list .list-item h6') // 타이틀
  const subMenuList = document.querySelectorAll('.menuAll-menu .subMenu-wrap .subMenu-list') // 서브메뉴 리스트 WRAP
  const subMenuListWrap = document.querySelectorAll('.menuAll-menu .subMenu-wrap') // 서브메뉴 리스트 WRAP
  const menuText = document.querySelectorAll('.menuAll-menu .text-list .list-item')// 문구
  
  menuList.forEach(function(ele,idx){
    ele.addEventListener('click',function(event){
      const menuListActive = document.querySelector('.menuAll-menu .menu-list .list-item h6.active');
      const menuTextActive = document.querySelector('.menuAll-menu .menu-list>.list-item.active');
      const menuItemActive = document.querySelector('.menuAll-menu .text-list .list-item.active');
      const subMenuListWrapActive = document.querySelector('.menuAll-menu .subMenu-wrap.active');
      let subMenuHeight =  subMenuList[idx].clientHeight;
      
      if(event.target == ele && menuListActive == event.target || menuListActive == null || event.target !==  menuList[7]){
        menuList[idx].classList.add('active')
        menuItem[idx].classList.add('active')
        subMenuListWrap[idx].classList.add('active')
        subMenuListWrap[idx].style.height = subMenuHeight +'px'
        menuText[idx].classList.add('active')
        if(menuListActive == event.target){ // 두번누르면
          menuList[idx].classList.remove('active')
          menuItem[idx].classList.remove('active')
          subMenuListWrap[idx].classList.remove('active')
          subMenuListWrap[idx].style.height = 0 +'px'
          menuText[idx].classList.remove('active')          
        }
      }

      // 켜져있는데 다른걸 누르면 다시 없어짐
      if(menuListActive != event.target && menuListActive){
        menuListActive.classList.remove('active')
        menuTextActive.classList.remove('active')
        menuItemActive.classList.remove('active')
        subMenuListWrapActive.classList.remove('active')
        subMenuListWrapActive.style.height = 0 +'px'
      }
    })
  })

  // 하단 arrow 버튼 클릭
  const arrow = document.querySelector('.aside-arrow')
  const asideBottom = document.querySelector('.aside-bottom')
  const asideBottomClose = document.querySelector('.aside-bottom .aside-close')
  arrow.addEventListener('click',function(){
    asideBottom.classList.toggle('active')
  })
  asideBottomClose.addEventListener('click',function(){
    asideBottom.classList.remove('active')
  })


})

