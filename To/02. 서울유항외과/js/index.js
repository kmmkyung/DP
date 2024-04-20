import tapData from "../assets/data/tabdata.js"

window.addEventListener('DOMContentLoaded',function(){
  // top-nav hover시 아이콘 바꾸기
  let icon = document.querySelectorAll('.icon')
  icon.forEach(function(ele,idx){
    ele.addEventListener('mouseenter',function(){
      ele.classList.add('active')
      ele.setAttribute('src',`../assets/images/sns-icon-on-${idx}.png`)
    })
    ele.addEventListener('mouseleave',function(){
      ele.setAttribute('src',`../assets/images/sns-icon-${idx}.png`)
      ele.classList.remove('active')
    })
  })

  // scroll이 내려가면 GND 고정
  const header = document.querySelector('.header');
  const nav = document.querySelector('.nav');
  const menuMap = document.querySelector('.menuMap')
  window.addEventListener('scroll',function(){
    if(window.scrollY>=40){
      nav.classList.add('navActive')
      header.classList.add('active')
      menuMap.classList.add('active')
      header.style.transition = 'none'
    }
    else{
      nav.classList.remove('navActive')
      header.classList.remove('active')
      menuMap.classList.remove('active')
      header.style.transition = 'all 1s'
    }
  })

  // PC - GNB 서브메뉴 보이기
  const pcMenuItem = document.querySelectorAll('.pcMenu-list>.list-item:not(:last-child)')
  const pcSubMenuListWrap = document.querySelectorAll('.pcMenu-list .subMenu-list__wrap')
  const pcSubMenuList = document.querySelectorAll('.pcMenu-list .subMenu-list')
  pcMenuItem.forEach(function(menu,idx){    
    let vh = pcSubMenuList[idx].clientHeight;
    
    menu.addEventListener('mouseenter',function(){
      pcSubMenuListWrap[idx].style.height = vh+'px'
    })
    menu.addEventListener('mouseleave',function(){
      pcSubMenuListWrap[idx].style.height = 0
    })
  })

  // mobile - GNB 서브메뉴 보이기
  const mobileBtn = document.querySelector('.mobileMenu-icon')
  const mobileMenu = document.querySelector('.mobileMenu')
  const mobileMenuItem = document.querySelectorAll('.mobileMenu-list>.list-item')
  const mobileSubMenuListWrap = document.querySelectorAll('.mobileMenu-list .subMenu-list__wrap')
  const mobileSubMenuList = document.querySelectorAll('.mobileMenu-list .subMenu-list')
  mobileBtn.addEventListener('click',function(){
    mobileMenu.classList.toggle('active')
    mobileMenu.style.height = 375+'px'
    mobileBtn.classList.toggle('active')
    
    if(mobileMenu.classList.contains('active')){
      mobileMenuItem.forEach(function(menu,idx){
        let vh = mobileSubMenuList[idx].clientHeight;
        menu.addEventListener('mouseenter',function(){
          mobileMenu.style.height = 'auto'
          mobileSubMenuListWrap[idx].style.height = vh+'px'
        })
        menu.addEventListener('mouseleave',function(){
          mobileMenu.style.height = 375+'px'
          mobileSubMenuListWrap[idx].style.height = 0+'px'
        })
      })
    }
    else{
      mobileMenu.style.height = 0
    }
  })

// swiper
  const swiper = new Swiper('.section1-swiper', {
    direction: 'horizontal',
    loop: true,
    // autoplay: true,
    pagination: {
      el: '.swiper-pagination',
      clickable: true 
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    }
  });

// tapMenu data
const table = document.querySelector('.tap-content table')
const tabTitle = document.querySelectorAll('.tap-menu__list .list-item')

tabTitle.forEach(function(ele,idx){
  ele.addEventListener('click',function(event){
    let tableCode = ''
    let tabTitleOn = document.querySelector('.tap-menu__list .list-item.active')
    for(let i = 0; i <5; i++){
      tableCode += `
      <tr>
        <td class="tap-content__title">${tapData[idx][`title-${i}`]}</td>
        <td class="tap-content__write">${tapData[idx][`write-${i}`]}</td>
      </tr>
      `
    }
    event.target.classList.add('active')
    if(event.target == tabTitleOn ){
      event.target.classList.add('active')
    }
    else{
      tabTitleOn.classList.remove('active')
    }
    table.innerHTML = tableCode
    
  })
})



})