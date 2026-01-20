/** @format */
// sub.js - 20260120 kmk

document.addEventListener("DOMContentLoaded", function () {
  // DOMContentLoaded
  // function declaration ------
  // checkIfInViewFn
  window.addEventListener("scroll", checkIfInViewFn);
  window.addEventListener("resize", checkIfInViewFn);
  checkIfInViewFn();
  // acodianFn

  // function code ------
  // class add ani inView
  const aniElements = document.querySelectorAll(".ani");
  if (aniElements.length > 0) {
    function checkIfInViewFn() {
      const windowHeight = window.innerHeight;
      const windowTopPosition = window.scrollY;
      const windowBottomPosition = windowTopPosition + windowHeight;

      aniElements.forEach((element) => {
        const elementHeight = element.offsetHeight;
        const elementTopPosition =
          element.getBoundingClientRect().top + window.scrollY;
        const elementBottomPosition = elementTopPosition + elementHeight;

        if (
          elementBottomPosition >= windowTopPosition &&
          elementTopPosition <= windowBottomPosition
        ) {
          element.classList.add("inView");
        }
      });
    }
  }

  // acodian
  // 매개변수: acodianHead(클릭할 부분) / acodianBody(숨길 내용) / otherState(오픈시 상태) 0:하나 열리면 나머지 닫힘 1:여러 개 열림
  // 초기 열린상태: .acodian.on / 초기 닫힌상태: .acodian
  // 필수:
  /*
  .acodian //필수
  ㄴ .acodianHead //필수
    ㄴ .acodianHeadWrap
      ㄴ .acodianTitle
      ㄴ .acodianButton
  ㄴ .acodianBody //필수
    ㄴ .acodianContentWrap //필수
      ㄴ .acodianContent
  */
  // acodian
  // acodianItems : document.querySelectorAll('.acodian') 결과
  // otherState : 0 = 하나만 열림 / 1 = 여러 개 열림
  function acodianFn(acodianItems, otherState = 0) {
    if (!acodianItems) return;

    acodianItems.forEach(function (item) {
      const head = item.querySelector(".acodianHead");
      const body = item.querySelector(".acodianBody");
      const wrap = item.querySelector(".acodianContentWrap");

      function getHeight() {
        return wrap.scrollHeight;
      }

      function open() {
        // single open
        if (otherState === 0) {
          acodianItems.forEach(function (other) {
            if (other === item) return;

            const otherBody = other.querySelector(".acodianBody");
            other.classList.remove("on");
            otherBody.style.height = "0px";
          });
        }

        item.classList.add("on");
        body.style.height = getHeight() + "px";
      }

      function close() {
        item.classList.remove("on");
        body.style.height = "0px";
      }

      // 초기 상태 (.on 있으면 열린 상태)
      body.style.height = item.classList.contains("on")
        ? getHeight() + "px"
        : "0px";

      // 클릭 토글
      head.addEventListener("click", function () {
        if (item.classList.contains("on")) {
          close();
        } else {
          open();
        }
      });

      // resize / load 시 열린 항목만 재계산
      function recalc() {
        if (!item.classList.contains("on")) return;
        body.style.height = getHeight() + "px";
      }

      window.addEventListener("resize", recalc);
      window.addEventListener("load", recalc);
    });
  }
}); // DOMContentLoaded
