window.addEventListener('DOMContentLoaded',function(){

  // section1
  const section1 = document.querySelector('main .section1')
  let section1Typed = new Typed('.section1-title',{
    strings:['눈이 예쁘다, 그래서 아몬드'],
    typeSpeed: 200,
  })

  // section2
  const section2 = document.querySelector('.section2')
  const video = document.querySelectorAll('.section2 .video')
  const videoPc = document.querySelector('.section2 .vid-pc')
  const videoMobile = document.querySelector('.section2 .vid-mobile')



  window.addEventListener('scroll',function(){
    videoPc.pause()
    videoMobile.pause()
    if(videoPc !== undefined){
      if(window.scrollY-section2.scrollHeight >=0){
        videoPc.play()
      }
      if( window.scrollY-section2.scrollHeight < 0 || window.scrollY-section2.scrollHeight > section2.scrollHeight/2){
        videoPc.pause()
      }
    }
    if(videoMobile !== undefined ){
      if(window.scrollY-section2.scrollHeight >= 0){
        videoMobile.play()
      }
      if( window.scrollY-section2.scrollHeight < 0 || window.scrollY-section2.scrollHeight > section2.scrollHeight/2){
        videoMobile.pause()
      }
    }
  })

  // section3
  // const section3 = document.querySelector('.section3')
  let swiperVal = undefined;
  const section3Swiper = document.querySelector('.section3-swiper')

  window.addEventListener('resize',function(){
    if(window.innerWidth > 900 && swiperVal != undefined){
      swiperVal.destroy()
      swiperVal = undefined;
    }
    
    if(window.innerWidth <= 768 && swiperVal == undefined){
      swiperVal = new Swiper('.section3-swiper', {
      slidesPerView: 1,
      simulateTouch: true,
      // autoplay: {
      //   delay: 500,
      // },
        pagination: {
          el: '.swiper-pagination',
          clickable: true // 클릭 가능 여부
        },
      });
    }
  })

  // section4
  const section4 = document.querySelector('.section4')
  const section4Title = document.querySelector('.section4 .content-title')
  const section44Content = document.querySelector('.section4 .section4-content')

    // all
    let ioOptions = {
      // root:document.querySelector('main'),
      threshold: 1.0,
    }
    let io = new IntersectionObserver(function(entries){
      entries.forEach((entry)=>{
        if(entry.isIntersecting){
          section1Typed.reset()
        }
        else{
        }
      },ioOptions)
    })

  const entry = document.querySelectorAll('.entry')
  entry.forEach (ele=> io.observe(ele))  
})