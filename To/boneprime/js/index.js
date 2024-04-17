window.addEventListener('DOMContentLoaded',function(){

  // 메인 메뉴 - 서브 메뉴 보이기
    const navItem = document.querySelectorAll('.nav-item');
    const subNavList = document.querySelectorAll('.subNav-list')
    const subNavListWrap = document.querySelectorAll('.subNav-list__wrap')

    navItem.forEach(function(ele,idx){
      let subNavListHeight = subNavList[idx].clientHeight;
      
      ele.addEventListener('mouseenter',function(){
        subNavListWrap[idx].style.height = subNavListHeight+'px'
      })
      ele.addEventListener('mouseleave',function(){
        subNavListWrap[idx].style.height = 0+'px'
      })
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