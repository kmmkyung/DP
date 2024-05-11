window.addEventListener('DOMContentLoaded',function(){
  let ioOption = {
    threshold: 1
  }
  let io = new IntersectionObserver(function(entries){
    entries.forEach((entry)=>{
      if(entry.isIntersecting){
        entry.target.classList.add('active')
      }
    },ioOption)
  })

  const entry = document.querySelectorAll('.entry')
  entry.forEach (ele => io.observe(ele))  

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
    onLeave: function(origin,destination){
      if(destination == 2){
        let sec2Map = document.querySelector('.section2-right .map-wrap')
        let sec2content = document.querySelectorAll('.left-content')
        itemTime(sec2content)
        sec2Map.classList.add('active')
      }
    }
  })

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
  }
})

