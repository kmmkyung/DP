$(function(){
  const itemTopContent = document.querySelectorAll(".m71 .filter-box .input-content:not(:first-of-type) .input-title");
	const itemsBottomContent = document.querySelectorAll(".m71 .filter-box .input-content .input-box");

  itemTopContent.forEach((item, idx) => {
    const box = itemsBottomContent[idx];
    if (item.classList.contains("on")) {
      box.style.height = box.scrollHeight + "px";
    } else {
      box.style.height = "0px";
    }

    // 클릭 이벤트
    item.addEventListener("click", function () {
      if (!item.classList.contains("on")) {
        item.classList.add("on");
        box.style.height = box.scrollHeight + "px";
      } else {
        item.classList.remove("on");
        box.style.height = "0px";
      }
    });
  });

  // 윈도우 리사이즈시 열린 아이템 높이 다시 계산
  window.addEventListener("resize", () => {
    itemTopContent.forEach((item, idx) => {
      if (item.classList.contains("on")) {
        const box = itemsBottomContent[idx];
        box.style.height = box.scrollHeight + "px";
      }
    });
  });

  const $areas = $("#koreaMap .area");

 
  $areas.on("click", function () {
    const code = $(this).data("region");
    const $radio = $("#region_" + code);

    // 현재 선택 상태 확인
    const isSelected = $radio.is(":checked");

    if (isSelected) {
      // 🔹 이미 선택되어 있던 걸 다시 클릭 → 해제
      $radio.prop("checked", false);
      $(this).removeClass("active");

      // 전체로 리셋하려면 hidden all 라디오 선택(있을 경우)
      $("#region_all").prop("checked", true);
    } else {
      // 🔹 새 선택
      $('input[name="region"]').prop("checked", false); // 전체 라디오 해제
      $radio.prop("checked", true);

      $areas.removeClass("active");
      $(this).addClass("active");
    }

  })


  // 리스트 아이템마다 개별 스와이퍼 세트 생성
  $(".m71 .content-list .list-item").each(function () {
    const $item = $(this);

    const $thumbMainSwiperEl = $item.find(".swiper-container.thumb-main");
    const $thumbListSwiperEl = $item.find(".swiper-container.thumb-list");

    // 둘 중 하나라도 없으면 스킵
    if (!$thumbMainSwiperEl.length || !$thumbListSwiperEl.length) return;

    const slideCount = $thumbListSwiperEl.find(".swiper-slide").length;

    // 1) 썸네일 Swiper
    const swiperThumb = new Swiper($thumbListSwiperEl[0], {
      slidesPerView: 3,
      spaceBetween: 10,
      speed: 500,
      slideToClickedSlide: true,
      touchRatio: 0.2,
      watchSlidesProgress: true,
    });

    // 2) 메인 Swiper (이 카드 전용)
    const swiperMain = new Swiper($thumbMainSwiperEl[0], {
      slidesPerView: 1,
      spaceBetween: 10,
      centeredSlides: true,
      speed: 500,
      thumbs: { swiper: swiperThumb },
    });

    // 필요하면 인스턴스를 DOM에 저장해도 됨
    // $item.data("swiperMain", swiperMain);
    // $item.data("swiperThumb", swiperThumb);
  });

});





