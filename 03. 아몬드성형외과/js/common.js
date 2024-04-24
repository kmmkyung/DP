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
  const subMenuListWrap = document.querySelectorAll('.menuAll-menu .subMenu-wrap')
  const subMenuList = document.querySelectorAll('.menuAll-menu .subMenu-list')
  menuList.forEach(function(ele,idx){
    let subMenuHeight =  subMenuList[idx].clientHeight;
    ele.addEventListener('click',function(){
      

    })
  })
})