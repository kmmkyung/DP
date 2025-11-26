$(function(){

  // 제품 Swiper | 클릭시 썸네일 변경
  const productSwiper = document.querySelector('.m20 .swiper')
  
  if(!productSwiper) return
    const swiper = new Swiper( productSwiper, {
      slidesPerView: 4,
      spaceBetween: 8,
      slideToClickedSlide: true,
      speed: 500,
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev'
      },		
    });
    
    const productItems = document.querySelectorAll('.m20 .product-swiper .swiper-slide');
    const productMainImg = document.querySelector('.m20 .product-img .img-box img');
    const productItemImg = document.querySelectorAll('.m20 .product-swiper .swiper-slide img');
  
    productItems[0].classList.add('active');
    productItemImg.forEach((ele, idx)=> {
      ele.addEventListener('click', function (event){
        const clickedSrc = event.currentTarget.getAttribute('src');
        const currentMainSrc = productMainImg.getAttribute('src');
  
        if (clickedSrc === currentMainSrc) return
        const currentActive = document.querySelector('.m20 .product-swiper .swiper-slide.active');
        if (currentActive) currentActive.classList.remove('active');
        productItems[idx].classList.add('active');
  
        productMainImg.setAttribute('src', clickedSrc);
      });
    })
  });