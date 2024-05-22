window.addEventListener('DOMContentLoaded',function(){
  let io = new IntersectionObserver(function(entries){
    entries.forEach((ele)=>{
      if(ele.isIntersecting){
        ele.target.classList.add('active')
      }
    })
  })
const entry = document.querySelectorAll('.entry')
entry.forEach(ele=>io.observe(ele))

const sec1con2Wrap = document.querySelector('.content2-wrap')
const sec1con2Img = document.querySelectorAll('.content2-img-left')
sec1con2Img.forEach(function(ele){
  gsap.set(ele,{x:30});
  gsap.to(ele,{
    x:10,
    stagger:0.1,
  duration: 1,
    scrollTrigger:{
      scrub: true,
      trigger:sec1con2Wrap,
      start:'top bottom-=200px',
      end:'+=500',
      toggleActions: "play reverse play reverse"
    }
  })
})

const sec1con2Img2 = document.querySelectorAll('.content2-img-right')
sec1con2Img2.forEach(function(ele){
  gsap.set(ele,{x:-30});
  gsap.to(ele,{
    x:10,
    stagger:0.1,
    duration: 1,
    scrollTrigger:{
      scrub: true,
      trigger:sec1con2Wrap,
      start:'top bottom-=200px',
      end:'+=500',
      toggleActions: "play reverse play reverse"
    }
  })
})

  // section4 slider
  const swiper = new Swiper('.space-swiper', {
    autoplay: true,
    delay: 20000,
    speed : 1000,
    rewind: true,
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
  });
})