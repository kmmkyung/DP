window.addEventListener('DOMContentLoaded',function(){
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