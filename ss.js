/** @format */

$(function () {
  // 제품 Swiper | 클릭시 썸네일 변경
  const productSwiper = document.querySelector(".m20 .swiper");

  if (!productSwiper) return;
  const swiper = new Swiper(productSwiper, {
    slidesPerView: 4,
    spaceBetween: 8,
    slideToClickedSlide: true,
    speed: 500,
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
  });

  const productItems = document.querySelectorAll(
    ".m20 .product-swiper .swiper-slide",
  );
  const productMainImg = document.querySelector(
    ".m20 .product-img .img-box img",
  );
  const productItemImg = document.querySelectorAll(
    ".m20 .product-swiper .swiper-slide img",
  );

  productItems[0].classList.add("active");
  productItemImg.forEach((ele, idx) => {
    ele.addEventListener("click", function (event) {
      const clickedSrc = event.currentTarget.getAttribute("src");
      const currentMainSrc = productMainImg.getAttribute("src");

      if (clickedSrc === currentMainSrc) return;
      const currentActive = document.querySelector(
        ".m20 .product-swiper .swiper-slide.active",
      );
      if (currentActive) currentActive.classList.remove("active");
      productItems[idx].classList.add("active");

      productMainImg.setAttribute("src", clickedSrc);
    });
  });
});

const mainVideo = document.querySelector(".contentNew video");
const playButton = document.querySelector(".contentNew .playButton");
const videoList = document.querySelectorAll(".contentList video");

videoList.forEach((item) => {
  item.addEventListener("click", () => {
    const clickedSrc = item.getAttribute("src");
    const currentMainSrc = mainVideo.getAttribute("src");

    if (clickedSrc === currentMainSrc) return;

    videoList.forEach((v) => v.classList.remove("on"));
    item.classList.add("on");
    mainVideo.setAttribute("src", clickedSrc);
  });
});
mainVideo.addEventListener("click", () => {
  if (mainVideo.paused) {
    mainVideo.play();
    playButton.classList.add("hide");
  } else {
    mainVideo.pause();
    playButton.classList.remove("hide");
  }
});

const popupButton = document.querySelectorAll(".section2 .business .btn");
const popup = document.querySelector(".popup");
const popupCloseBtn = document.querySelector(".popup .closeBtn");
popupButton.forEach((ele) => {
  ele.addEventListener("click", function () {
    popup.classList.add("on");
  });
});
popupCloseBtn.addEventListener("click", function () {
  popup.classList.remove("on");
});
