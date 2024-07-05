window.addEventListener('DOMContentLoaded',function(){
  const tapBtn = document.querySelectorAll('.right-4_content1 .tap')
  const tapCon = document.querySelectorAll('.right-4_content1 .tapCon')
  console.log(tapCon);
  
  tapBtn.forEach(function(ele,idx){
    ele.addEventListener('click',function(){
      for(let i =0; i<tapCon.length; i++){
        tapBtn[i].classList.remove('on')
        tapCon[i].classList.add('displayNone')
      }
      ele.classList.add('on')
      tapCon[idx].classList.remove('displayNone')
    })
  })
})