window.addEventListener('DOMContentLoaded',function(){
  const menuBtn = document.querySelector('.menu-more')
  const menuWrap = document.querySelector('.header-wrap')
  const menuBg = document.querySelector('.menu-bg')
  menuBtn.addEventListener('click',function(){
    menuWrap.classList.toggle('active')
    menuBg.classList.toggle('active')
  })
})