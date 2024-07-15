window.addEventListener('DOMContentLoaded',function(){

    const triangle = document.querySelectorAll('.triangle')
    const keyframes = [
			{ opacity: 0 },
			{ opacity: 1 }
		];

		const options = {
			duration: 1500,
			iterations: Infinity,
		};

    triangle.forEach(function(ele,idx){
      ele.animate(keyframes,{...options,delay:idx*100})
    })
})