window.addEventListener('DOMContentLoaded',function(){
  const section1 = document.querySelector('.section1')
  const section2 = document.querySelector('.section2')
  const video = document.querySelector('.video')
  const videoClose = document.querySelector('.video-close')
  section2.classList.contains('active')?video.play():video.pause()
  videoClose.addEventListener('click',function(){
    section2.classList.remove('active')
    section1.classList.add('active')
  })
  // video.addEventListener('ended',function(){
  //   section2.classList.remove('active')
  //   section1.classList.add('active')
  // })
})
