import svgArrow from '../js/svgArrow.js';

window.addEventListener('DOMContentLoaded',function(){
  //AOS
  AOS.init(); 

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
  const mobileMenuWrap = document.querySelector('.mobileMenu-wrap') 
  const mobileMenuBg = document.querySelector('.header-bg') 
  mobileHam.addEventListener('click',function(){
    mobileHam.classList.toggle('active')
    mobileMenuWrap.classList.toggle('active')
    mobileMenuBg.classList.toggle('active')
  })

  // 메뉴 클릭시 이동
  const pcMenu = document.querySelectorAll('.pcMenu');
  const mobileMenu = document.querySelectorAll('.mobileMenu');
  const contentPage = document.querySelectorAll('.contentPage');
  
  function movePage(ele,idx){
    ele.addEventListener('click',function(event){
      event.preventDefault()
      let pageVh = contentPage[idx].offsetTop;
      window.scroll({top: pageVh, behavior: "smooth"})
    })
  }

  pcMenu.forEach(function(ele,idx){
    movePage(ele,idx)
  })
  mobileMenu.forEach(function(ele,idx){
    movePage(ele,idx)
  })

  // // arrow
  const arrowBox = document.querySelector('.content-1_arrow');
  arrowBox.innerHTML = svgArrow;
  



  // section6-swiper
  const section6Swiper = new Swiper('.section6-swiper', {
    spaceBetween: 40,
    slidesPerView: 1,
    loop:true,
    autoplay: true,
    watchSlidesProgress: true,
    breakpoints: {
      425: {
        slidesPerView: 2,
      },
      1024: {
        slidesPerView: 3,
      },
    },
    pagination: {
      el: '.swiper-pagination',
    },
  });

  // section7-swiper
  const section7Swiper = new Swiper('.section7-swiper', {
    spaceBetween: 40,
    slidesPerView: 1,
    loop:true,
    autoplay: true,
    watchSlidesProgress: true,
    breakpoints: {
      425: {
        slidesPerView: 2,
      },
      1024: {
        slidesPerView: 3,
      },
    },
    pagination: {
      el: '.swiper-pagination',
    },
  });

  // company
  const companyMenu = document.querySelectorAll('.section7 .sub-menu li')
  const companyContent = document.querySelectorAll('.companyContent')
  companyMenu.forEach(function(ele,idx){
    ele.addEventListener('click',function(){
      for(let i=0; i<companyContent.length; i++){
        companyMenu[i].classList.remove('active')
        companyContent[i].classList.add('displayNone')
      }
      ele.classList.add('active')
      companyContent[idx].classList.remove('displayNone')
    })
  })
})

