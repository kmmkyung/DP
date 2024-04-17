window.addEventListener('DOMContentLoaded',function(){
  // const banner2 = document.querySelector('.banner2')
  // if(window.innerWidth>=768){
  //   let opa = 0
  //   setInterval(function(){
  //     if( opa < 1 ){
  //       opa++;
  //     }
  //     else{
  //       opa--;
  //     }
  //     banner2.style.opacity = opa
  //   },5000)
  // }

  const navList = document.querySelector('.nav-list')
  const navItem = document.querySelectorAll('.subNav-list')
  const navBg = this.document.querySelector('.nav-bg')
  navList.addEventListener('mouseenter',function(){
    navItem.forEach((ele)=>{
      ele.style.height= 200+'px'
      ele.style.transition = 'all 0.5s'
    })
    navBg.style.height= 210+'px'
  })
  
  navBg.addEventListener('mouseleave',function(){
    navItem.forEach((ele)=>{
      ele.style.height= '0'
      ele.style.transition = 'all 0.1s'
    })
    navBg.style.height= 0+'px'
  })


  const search = document.querySelector('.icon-search')
  const searchTap = document.querySelector('.mobile-searchBar')
  const seClose = document.querySelector('.mobile-searchBar .close-btn')
  search.addEventListener('click',function(){
    searchTap.classList.remove('-hidden')      
  })
  seClose.addEventListener('click',function(){
    searchTap.classList.add('-hidden')      
  })

  const bars = document.querySelector('.icon-bars')
  const mobileNav = document.querySelector('.mobile-navMenu')
  const navClose = document.querySelector('.mobile-navBtn')
  bars.addEventListener('click',function(){
    mobileNav.classList.remove('-hidden')      
  })
  navClose.addEventListener('click',function(){
    mobileNav.classList.add('-hidden')      
  })
})