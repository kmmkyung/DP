/** @format */

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
function accordionFn(items, otherState = 0) {
  const targetItems =
    items instanceof NodeList || Array.isArray(items) ? items : [items];

  if (!targetItems || targetItems.length === 0 || !targetItems[0]) return;

  targetItems.forEach(function (item) {
    const head = item.querySelector(".accordionHead");
    const body = item.querySelector(".accordionBody");
    // HTML 구조에 있는 클래스명으로 선택 (둘 중 하나라도 맞으면 작동)
    const wrap =
      item.querySelector(".accordionBodyWrap") ||
      item.querySelector(".accordionContent");

    if (!head || !body || !wrap) return;

    const getHeight = () => wrap.scrollHeight;

    const open = () => {
      // 2. 여러 개 중 하나만 열리는 모드일 때
      if (otherState === 0 && targetItems.length > 1) {
        targetItems.forEach((other) => {
          if (other === item) return;
          const otherBody = other.querySelector(".accordionBody");
          other.classList.remove("active");
          if (otherBody) otherBody.style.height = "0px";
        });
      }
      item.classList.add("active");
      body.style.height = getHeight() + "px";
    };

    const close = () => {
      item.classList.remove("active");
      body.style.height = "0px";
    };

    // 초기 상태 설정
    body.style.overflow = "hidden";
    body.style.transition = "height 0.3s ease";

    if (item.classList.contains("active") || item.classList.contains("on")) {
      item.classList.add("active");
      body.style.height = getHeight() + "px";
    } else {
      body.style.height = "0px";
    }

    // 클릭 이벤트
    head.onclick = function () {
      if (item.classList.contains("active")) {
        close();
      } else {
        open();
      }
    };

    // 리사이즈 대응
    window.addEventListener("resize", () => {
      if (item.classList.contains("active")) {
        body.style.height = getHeight() + "px";
      }
    });
  });
}
