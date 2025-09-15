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
    navigation: true,  
    navigationPosition: 'left',
    autoScrolling:true,
    fitToSection: true,
    fitToSectionDelay: 600,
    observer: true,
    scrollingSpeed: 600,
    keyboardScrolling: true,
    responsiveWidth:768,
  })

})
