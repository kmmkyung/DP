window.addEventListener('DOMContentLoaded',function(){
  let io = new IntersectionObserver(function(entries){
    entries.forEach((ele)=>{
      if(ele.isIntersecting){
        ele.target.classList.add('active')
      }
    })
  })
const entry = document.querySelectorAll('.entry')
entry.forEach(ele=>io.observe(ele))
})