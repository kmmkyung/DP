window.addEventListener('DOMContentLoaded',function(){
  // all
    $('#fullpage').fullpage({
      licenseKey: 'OPEN-SOURCE-GPLV3-LICENSE', 
      showActiveTooltip: false,
      scrollHorizontally: true,
      autoScrolling:true,
      fitToSection: true,
      fitToSectionDelay: 600,
      observer: true,
      scrollingSpeed: 600,
      keyboardScrolling: true,
      responsiveWidth:990,
    })

    let ioOption = {
      threshold: 1
    }
    let io = new IntersectionObserver(function(entries){
      entries.forEach((entry)=>{
        if(entry.isIntersecting){
          entry.target.classList.add('active')
        }
        else{
          entry.target.classList.remove('active')

        }
      },ioOption)
    })

    const entry = document.querySelectorAll('.entry')
    entry.forEach (ele => io.observe(ele))  
  

  // section3- twenty
  $(function(){
    $(".item-twenty").twentytwenty({
      default_offset_pct: 0.7,
      no_overlay: true, 
      move_slider_on_hover: true,
      move_with_handle_only: true,
      click_to_move: false
    });
  });

  // section5 - swiper
  const section5SwiperPagination = document.querySelectorAll('.section5-swiper .swiper-pagination li')
  let paginationValue = []
  section5SwiperPagination.forEach(function(ele){
    paginationValue.push(ele.textContent)
  })

  section5Swiper = new Swiper('.section5-swiper', {
    slidesPerView: 1,
    loop:true,
    effect:'fade',
    fadeEffect: { crossFade: true },
    spaceBetween: 10, 
    centeredSlides: true,
    simulateTouch: true,
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
        renderBullet:function(index,className){
          return `<li class=${className}>${paginationValue[index]}</li>`
        }
      },
    });

  // section6 -swiper
  section6Swiper2 = new Swiper('.mobile-swiper__2', {
      spaceBetween: 10,
      slidesPerView: 3,
      freeMode: true,
      watchSlidesProgress: true,
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
  });

  section6Swiper1 = new Swiper('.mobile-swiper__1', {
    spaceBetween: 10, 
    allowTouchMove: true,
    thumbs: {
      swiper: section7Swiper2,
    },
  });

  // section7 - swiper
  section7Swiper = new Swiper('.section7-swiper', {
    slidesPerView: 1,
    centeredSlides: true,
    simulateTouch: true,
    freeMode: true,
    watchSlidesProgress: true,
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
  });

})