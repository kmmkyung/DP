window.addEventListener('DOMContentLoaded',function(){

  // section1
  const section1 = document.querySelector('main .section1')
  let section1Typed = new Typed('.section1-title',{
    strings:['눈이 예쁘다, 그래서 아몬드'],
    typeSpeed: 200,
  })

  // section2
    const section2 = document.querySelector('.section2')
    const video = document.querySelector('.section2 .video')
    video.pause()
    

  // section3
  const section3 = document.querySelector('.section3')

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
    let ioOptions = {
      // root:document.querySelector('main'),
      rootMargin:'30%',
      threshold: [1.0],
    }
    let io = new IntersectionObserver(function(entries){
      entries.forEach((entry,idx)=>{
          if(entry.target == section1){
            console.log('시작1');
            section1Typed.reset()      
          }
          if(entry.target == section2){
            console.log('시작2');
            video.play()
          }
          if(entry.target == section3){
            console.log('시작3');
          }
      },ioOptions)
      
        // if(entries[1].isIntersecting){
        //   if(!entries[1].isIntersecting){
        //     console.log('종료2');
        //     video.pause()
        //   }
        //   else{
        //     console.log('관찰2');
        //     video.play()
        //   }
        // }
    })

  const entry = document.querySelectorAll('.entry')
  entry.forEach (ele=> io.observe(ele))  
})