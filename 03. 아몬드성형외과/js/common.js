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
  const menuList = document.querySelectorAll('.menuAll-menu .menu-list .list-item h6')
  const menuListLine = document.querySelectorAll('.menuAll-menu .menu-list .list-item .menu-line')
  const subMenuListWrap = document.querySelectorAll('.menuAll-menu .subMenu-wrap')
  const subMenuList = document.querySelectorAll('.menuAll-menu .subMenu-list')
  const textList = document.querySelectorAll('.menuAll-menu .text-list .list-item')
  menuList.forEach(function(ele,idx){
    let subMenuHeight =  subMenuList[idx].clientHeight;
    ele.addEventListener('click',function(){
      const menuListActive = document.querySelector('.menuAll-menu .menu-list .list-item h6.active')
      const subMenuListWrapActive = document.querySelector('.menuAll-menu .subMenu-wrap.active')
      const textListActive = document.querySelector('.menuAll-menu .text-list .list-item.active')
      if(menuListActive){
        menuListActive.classList.remove('active')
        subMenuListWrapActive.classList.remove('active')
        subMenuListWrapActive.style.height = 0 + 'px'
        textListActive.classList.remove('active')
      }

      subMenuListWrap[idx].style.height = subMenuHeight + 'px'
      menuList[idx].classList.add('active')
      subMenuListWrap[idx].classList.add('active')
      textList[idx].classList.add('active')
    })
  })
})

