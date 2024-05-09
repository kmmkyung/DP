window.addEventListener('DOMContentLoaded',function(){
  let ioOption = {
    threshold: 1
  }
  let io = new IntersectionObserver(function(entries){
    entries.forEach((entry)=>{
      if(entry.isIntersecting){
        entry.target.classList.add('active')
      }
      else{
        entry.target.classList.remove('active')
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
      destination == 1?sub01Typed.start():sub01Typed.stop()
      destination == 3?sub03Typed.start():sub03Typed.stop()
      if(destination == 2){
        let sec2TextItem = document.querySelectorAll('.section2-text .list-item')
        sec2TextItem[0].classList.add('active')
        setTimeout(()=>{
          sec2TextItem[1].classList.add('active')
          setTimeout(()=>{
            sec2TextItem[2].classList.add('active')
          },500)
        },500)
      }
      if(destination == 4){
        let sec4TextItem = document.querySelectorAll('.section4-text .list-item')
        sec4TextItem[0].classList.add('active')
        setTimeout(()=>{
          sec4TextItem[1].classList.add('active')
          setTimeout(()=>{
            sec4TextItem[2].classList.add('active')
          },500)
        },500)
      }
    }
  })

  // section1
  let sub01Typed = new Typed('.section1-text .text-2',{
    strings:[`아몬드에는 <span class="text2-null"></span><span class="text2-right">없습니다</span>`],
    typeSpeed: 50,
    showCursor: false,
    onComplete:()=>{
      const mark = document.querySelectorAll('.section1-text .mark')
      mark.forEach(ele=>{
        ele.classList.add('active')
      })
    }
  })

  // section3
  let sub03Typed = new Typed('.section3-text .text-2',{
    strings:[`아몬드에는 <span class="text2-null"></span><span class="text2-right">있습니다</span>`],
    typeSpeed: 50,
    showCursor: false,
    onBegin: (self) => {
      self.stop()
    },
    onComplete:()=>{
      const mark = document.querySelectorAll('.section3-text .mark')
      mark.forEach(ele=>{
        ele.classList.add('active')
      })
    }
  })
})
