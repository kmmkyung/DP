window.addEventListener('DOMContentLoaded',function(){
  // 헤더 숨기기 / 배경색상변경
  const header = document.querySelector('.pc-header')
  window.addEventListener('wheel',function(event){
    if(event.wheelDeltaY < 0){
      header.classList.remove('active')
      header.classList.add('none')
    }
    else{
      header.classList.add('active')
      header.classList.remove('none')
    }
  })
  window.addEventListener('scroll',function(){
    if(window.scrollY <= 800){
      header.style.backgroundColor = 'transparent'
    }
    else{
      header.style.backgroundColor = 'rgba(0, 0, 0, 0.8 )'
    }
  })

  // 모바일 메뉴
  const mobileHam = document.querySelector('.ham');
  const mobileMenu = document.querySelector('.mobileMenu-wrap') 
  const mobileMenuBg = document.querySelector('.header-bg') 
  mobileHam.addEventListener('click',function(){
    mobileHam.classList.toggle('active')
    mobileMenu.classList.toggle('active')
    mobileMenuBg.classList.toggle('active')
  })
  
})