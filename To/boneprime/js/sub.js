window.addEventListener('DOMContentLoaded',function(){
  const banner1 = document.querySelector('.section1 .banner .banner1')
  const banner2 = document.querySelector('.section1 .banner .banner2')
  // setInterval(function(){
  //   banner2.classList.toggle('fade')
  // },5000)

  let opa = 0
  setInterval(function(){
    if( opa < 1 ){
      opa++;
    }
    else{
      opa--;
    }
    banner2.style.opacity = opa
  },5000)
})