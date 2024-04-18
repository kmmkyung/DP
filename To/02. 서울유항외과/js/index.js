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
  const nav = document.querySelector('.nav');
  const menuMap = document.querySelector('.menuMap')
  window.addEventListener('scroll',function(){
    if(window.scrollY>40){
      nav.classList.add('navActive')
      menuMap.classList.add('active')
    }
    else{
      nav.classList.remove('navActive')
      menuMap.classList.remove('active')
    }
  })

  // PC - GNB 서브메뉴 보이기
  const pcMenuItem = document.querySelectorAll('.pcMenu-list>.list-item:not(:last-child)')
  const pcSubMenuList = document.querySelectorAll('.pcMenu-list .subMenu-list')
  pcMenuItem.forEach(function(menu,idx){
    menu.addEventListener('mouseenter',function(){
      pcSubMenuList[idx].classList.add('active')
    })
    menu.addEventListener('mouseleave',function(){
      pcSubMenuList[idx].classList.remove('active')
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
})