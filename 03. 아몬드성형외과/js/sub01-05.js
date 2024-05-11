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
  })

  const sec2Content = document.querySelectorAll('.section2 .content') //3개의 요소
  sec2Content.forEach(function(ele,idx){
    ele.addEventListener('mouseenter',function(event){
      event.target.classList.add('active') // 타겟인 요소는 class active부착
      if(event.target !== ele){ // 타겟이 아닌 요소는 noActive 부착
        ele.classList.add('noActive')
      }
    })
  })

  classList.contain
    // function mouseEvent(ele,num){
    //   ele.addEventListener('mouseenter',function(event){
    //     event.target.classList.add('active')

    //   })
    //   ele.addEventListener('mouseleave',function(event){
    //     event.target.classList.remove('active')
    //   })
    // }

})
