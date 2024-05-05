window.addEventListener('DOMContentLoaded',function(){
  // section3- twenty
  $(function(){
    $(".item-twenty").twentytwenty({
      default_offset_pct: 0.7, // How much of the before image is visible when the page loads
      no_overlay: true, //Do not show the overlay with before and after
      move_slider_on_hover: true, // Move slider on mouse hover?
      move_with_handle_only: true, // Allow a user to swipe anywhere on the image to control slider movement. 
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
  
  // section8 - swiper
  section8Swiper = new Swiper('.section8-swiper', {
    slidesPerView: 1,
    // effect:'fade',
    // fadeEffect: { crossFade: true },
    centeredSlides: true,
    simulateTouch: true,
    });

})