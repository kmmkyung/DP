window.addEventListener('DOMContentLoaded',function(){
  // 타블렛 모드 메뉴 보이기
  const menuBtn = document.querySelector('.menu-wrap')
  const closeBtn = document.querySelector('.close-btn')
  const menu = document.querySelector('header')
  const menuBg = document.querySelector('.menu-bg')
  menuBtn.addEventListener('click',function(){
    menu.classList.add('active')
    menuBg.classList.add('active')
  })
  closeBtn.addEventListener('click',function(){
    menu.classList.remove('active')
    menuBg.classList.remove('active')
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

  // input day 클릭시 선택기 보여지기
  const browserInput = document.querySelectorAll("input[type='date']");
  browserInput.forEach(ele=>{
    ele.addEventListener('click',function(){
      ele.showPicker()
    })
  })
})