window.addEventListener('DOMContentLoaded',function(){

  const logoPcB = $('.logo-pc__b')
  const logoPcW = $('.logo-pc__w')
  const logoMobileB = $('.logo-mobile__b')
  const logoMobileW = $('.logo-mobile__w')


    // all
  $(document).ready(function() {
    $('#fullpage').fullpage({
      licenseKey: 'OPEN-SOURCE-GPLV3-LICENSE', 
      showActiveTooltip: false,
      navigation: true,  
      navigationPosition: 'left',
      navigationTooltips: ['아몬드', '병원전경','의료진소개','특화수술','리얼모델후기','리얼셀피','약도'],
      scrollHorizontally: true,
      autoScrolling:true,
      fitToSection: true,
      fitToSectionDelay: 600,
      observer: true,
      scrollingSpeed: 1500,
      keyboardScrolling: true,
      onLeave: function(anchorLink,index){
        if(index == 2){
          if(window.innerWidth > 768){
            videoPc.play()
          }
          if(window.innerWidth <= 768){
            videoMobile.play()
          }
        }
        if(index == 5){
          const navigationText = $('#fp-nav .fp-tooltip')          
          logoPcW.removeClass('-hidden')
          logoPcB.addClass('-hidden')
          logoMobileW.removeClass('-hidden')
          logoMobileB.addClass('-hidden')
          navigationText.css({"color":"#fff"})
        }
        if(index != 5){
          logoPcB.removeClass('-hidden')
          logoPcW.addClass('-hidden')
          logoMobileB.removeClass('-hidden')
          logoMobileW.addClass('-hidden')
        }
        if(index == 6){
          section6Page1.classList.add('active')
        }
        else if(index != 6){
          section6Page1.classList.remove('active')
        }
      }
    });
  });

  let ioOption = {
    threshold: 1
  }
  let io = new IntersectionObserver(function(entries){
    entries.forEach((entry)=>{
      if(entry.isIntersecting){
        section1Typed.reset()
        entry.target.classList.add('active')
      }
      else{
        entry.target.classList.remove('active')
      }
    },ioOption)
  })

  const entry = document.querySelectorAll('.entry')
  entry.forEach (ele => io.observe(ele))  

  // section1
  let section1Typed = new Typed('.section1-title',{
    strings:['눈이 예쁘다, 그래서 아몬드'],
    typeSpeed: 200,
  })

  // section2
  const videoPc = document.querySelector('.section2 .vid-pc')
  const videoMobile = document.querySelector('.section2 .vid-mobile')

  // section3
  let swiperVal = undefined;
  function section3Swiper(){
    if(window.innerWidth > 768 && swiperVal != undefined){
      swiperVal.destroy()
      swiperVal = undefined;
    }
    if(window.innerWidth <= 768 && swiperVal == undefined){
      swiperVal = new Swiper('.section3-swiper', {
      slidesPerView: 1,
      simulateTouch: true,
        pagination: {
          el: '.swiper-pagination',
          clickable: true
        },
      });
    }
  }

  window.addEventListener('resize',section3Swiper)
  window.addEventListener('load',section3Swiper)

  // section5
  let swipe5rVal = undefined;
  function section5Swiper(){
    if(window.innerWidth > 768 && swipe5rVal != undefined){
      swipe5rVal.destroy()
      swipe5rVal = undefined;
    }
    
    if(window.innerWidth <= 768 && swipe5rVal == undefined){
      swipe5rVal = new Swiper('.section5-swiper', {
      slidesPerView: 2,
      loop:true,
      spaceBetween: 10, 
      centeredSlides: true,
      simulateTouch: true,
        pagination: {
          el: '.swiper-pagination',
          clickable: true
        },
      });
    }
  }
  window.addEventListener('resize',section5Swiper)
  window.addEventListener('load',section5Swiper)
  
  
  // section6
  const section6Page1 = document.querySelector('.section6 .section6-page1');


})


