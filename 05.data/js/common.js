window.addEventListener('DOMContentLoaded',function(){
  // 타블렛 모드 메뉴 보이기
  const menuBtn = document.querySelector('.menu-more')
  const menu = document.querySelector('header')
  const menuBg = document.querySelector('.menu-bg')
  menuBtn.addEventListener('click',function(){
    menu.classList.toggle('active')
    menuBg.classList.toggle('active')
  })

  // dark / light mode
  const body = document.querySelector('body')
  const darkBtn = document.querySelector('.mode-wrap img')
  darkBtn.addEventListener('click',function(){
    body.classList.toggle('dark')
    if(body.classList.contains('dark')){
      darkBtn.setAttribute('src','../images/light-mode.png')
    }
    else{
      darkBtn.setAttribute('src','../images/dark-mode.png')
    }
  })
})