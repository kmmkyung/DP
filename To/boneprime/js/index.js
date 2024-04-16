window.addEventListener('DOMContentLoaded',function(){

  // 메인 메뉴 - 서브 메뉴 보이기
    const navItem = document.querySelectorAll('.nav-item');
    const subNavList = document.querySelectorAll('.subNav-list')
    const subNavListWrap = document.querySelectorAll('.subNav-list__wrap')

    navItem.forEach(function(ele,idx){
      let subNavListHeight = subNavList[idx].clientHeight;
      
      ele.addEventListener('mouseenter',function(){
        console.log(subNavListHeight);
        subNavListWrap[idx].style.height = subNavListHeight+'px'
      })
      ele.addEventListener('mouseleave',function(){
        subNavListWrap[idx].style.height = 0+'px'
      })
    })
})