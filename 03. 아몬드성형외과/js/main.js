window.addEventListener('DOMContentLoaded',function(){


  // section1
  const section1 = document.querySelector('.section1')
  let section1Typed = new Typed('.section1-title',{
    strings:['눈이 예쁘다, 그래서 아몬드'],
    typeSpeed: 200,
  })
  
  // section2
    const section2 = document.querySelector('.section2')
    const video = document.querySelector('.section2 .video')
    
  // window.addEventListener('resize',function(){
  //   const section5Swiper = document.querySelector('.section5 .swiper')
  //   if(window.innerWidth >900){
  //     section5Swiper.destroy(true, true)
  //   }
  //   else{
  //     const swiper = new Swiper('.swiper', {
  //       // If we need pagination // 페이지 순서 원형 이미지
  //       pagination: {
  //         el: '.swiper-pagination', // 요소 정의
  //         clickable: true // 클릭 가능 여부
  //       },
  //     });
  //   }
    
  // })

    // all
    let io = new IntersectionObserver(function(entries){
      entries.forEach( ele => {
        if(ele.target == section1){
          if(entries[0].isIntersecting){
            console.log('관찰1');
            section1Typed.reset()          
          }
          else{
            console.log('종료1');
          }
        }
        if(ele.target == section2){
          if(entries[1].isIntersecting){
            console.log('관찰2');
            video.play()
          }
          else{
            console.log('종료2');
            video.pause()
          }
        }

          // if(entries[1].isIntersecting){
            //   console.log('section2');
          //     // video.forEach(function(ele){
            //     //   ele.play()
            //     // })
            //   }
            // if(entries[2].isIntersecting){
              //   console.log('section3');
              //   }
      })
    })
    const entry = document.querySelectorAll('.entry')
    entry.forEach(function(ele){
      io.observe(ele)
    })
  
  
})