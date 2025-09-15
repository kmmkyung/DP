window.addEventListener('DOMContentLoaded',function(){
  let io = new IntersectionObserver(function(entry){
    if(entry[0].isIntersecting){
      itemTime(entryItem)
    }
  })
  const entryItem = document.querySelectorAll('.entry')
  const entryPage = document.querySelector('.entryPage')
  io.observe(entryPage)

  function setTimeoutItem(item,itemNum){
    return new Promise(function(resolve){
      setTimeout(()=>{
        item[itemNum].classList.add('active')
        resolve()
      },500)
    })
  }

  async function itemTime(item){
    item[0].classList.add('active')
    await setTimeoutItem(item,1)
    await setTimeoutItem(item,2)
    await setTimeoutItem(item,3)
    await setTimeoutItem(item,4)
    await setTimeoutItem(item,5)
  }

  $('#fullpage').fullpage({
    licenseKey: 'OPEN-SOURCE-GPLV3-LICENSE', 
    showActiveTooltip: false,
    scrollHorizontally: true,
    autoScrolling:true,
    fitToSection: true,
    fitToSectionDelay: 600,
    observer: true,
    scrollingSpeed: 600,
    keyboardScrolling: true,
    responsiveWidth:990,
  })

  let timer;
  let sec2Content = document.querySelectorAll('.section2 .content')
  window.addEventListener("load", section2Fn);
  window.addEventListener("resize", function(){
    clearTimeout(timer)
    timer = setTimeout(section2Fn,200)
  });
  
  function section2Fn(){
    if(window.innerWidth>990){
      sec2Content.forEach(function(ele){
        ele.addEventListener('mouseenter',section2FnEnter)
        ele.addEventListener('mouseleave',section2FnLeave)
      })
    }
    else{
      sec2Content.forEach(function(ele){
        ele.classList.remove('active')
        ele.classList.remove('noActive')
        ele.removeEventListener('mouseenter',section2FnEnter)
        ele.removeEventListener('mouseleave',section2FnLeave)
      })
    }
  }

  function section2FnEnter(event){
    event.target.classList.add('active')
    let noActive = document.querySelectorAll('.content[class]:not(.active)')
    noActive.forEach(ele => ele.classList.add('noActive'))
  }
  function section2FnLeave(event){
    event.target.classList.remove('active')
    let noActive = document.querySelectorAll('.content[class]:not(.active)')
    noActive.forEach(ele => ele.classList.remove('noActive'))
  }


})
