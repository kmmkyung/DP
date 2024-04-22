window.addEventListener('DOMContentLoaded',function(){

  // 해당 메뉴 누르면 해당 게시물 보여줌
  let title = document.querySelectorAll('.pcMenu-list .list-item:nth-child(3) .subMenu-list .list-item')
  let mobileTitle = document.querySelectorAll('.mobileMenu-list .list-item:nth-child(3) .subMenu-list .list-item a')
  let subTitle = document.querySelectorAll('.container-menu .list-item')
  let tapTitle = document.querySelectorAll('.container-content .list-item')
  let historySpan = document.querySelector('.history span')
  let content = document.querySelectorAll('.container-content .content-main')
  
  title.forEach(function(ele,idx){
    ele.addEventListener('click', ()=>{clickMenu(event,idx)})
  })

  mobileTitle.forEach(function(ele,idx){
    ele.addEventListener('click', ()=>{clickMenu(event,idx)})
  })

  subTitle.forEach(function(ele,idx){
    ele.addEventListener('click', ()=>{clickMenu(event,idx)})
  })

  tapTitle.forEach(function(ele,idx){
    ele.addEventListener('click', ()=>{clickMenu(event,idx)})
  })

  function clickMenu(event,idx){
    let targetValue = event.target.innerText
    historySpan.innerText = targetValue

    let subTitleOn = document.querySelector('.container-menu .list-item.active')
    let tapTitleOn = document.querySelector('.container-content .list-item.active')
    let contentOn = document.querySelector('.container-content .content-main.active')
    
    if(idx === 0){
      if(contentOn){
        subTitleOn.classList.remove('active')
        tapTitleOn.classList.remove('active')
        contentOn.classList.remove('active')
      }
      subTitle[0].classList.add('active')
      tapTitle[0].classList.add('active')
      content[0].classList.add('active')
      }
    if(idx){
      if(contentOn){
        subTitleOn.classList.remove('active')
        tapTitleOn.classList.remove('active')
        contentOn.classList.remove('active')
      }
      subTitle[idx].classList.add('active')
      tapTitle[idx].classList.add('active')
      content[idx].classList.add('active') 
    }
  }
})




