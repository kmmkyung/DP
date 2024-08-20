window.addEventListener('DOMContentLoaded',function(){
  const bottomBtn = document.querySelector('.bottom-btn')
  const pinkBox = document.querySelector('.pink-box')
  
  
  bottomBtn.addEventListener('click',function(){
    const pinkBoxPosition = pinkBox.getBoundingClientRect().top + window.pageYOffset -100
    window.scrollTo({
      top: pinkBoxPosition,
      behavior: 'smooth'
    });
  })
})