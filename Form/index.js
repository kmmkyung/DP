// index.js
window.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  // 규칙
  const NAME_RE  = /^[A-Za-z가-힣\s]+$/;
  const PHONE_RE = /^(01[016789]-\d{3,4}-\d{4})$/;

  // 라벨 텍스트 자동 추출
  function getLabel(el){
    // for 연결 라벨
    const byFor = el.id ? form.querySelector(`label[for="${el.id}"]`) : null;
    if (byFor) return byFor.textContent.trim();
    // 박스 내 .input-title
    const box = el.closest(".form-box");
    const title = box?.querySelector(".input-title");
    if (title) return title.textContent.trim();
    // 라디오그룹/체크 등
    if (el.name === "contact") return "연락 방법";
    if (el.name === "agree") return "개인정보 수집 및 이용";
    return el.name || el.id || "필드";
  }

  // 기본 문구: 타입별/상황별 자동 생성
  function msgRequired(el){
    const label = getLabel(el);
    if (el.tagName === "SELECT") return `${label}을(를) 선택해주세요.`;
    if (el.type === "checkbox" && el.name === "agree") return `${label}에 동의해주세요.`;
    return `${label}을(를) 입력해주세요.`;
  }
  function msgType(el){ return `${getLabel(el)} 형식이 올바르지 않습니다.`; }
  function msgPattern(el){ return `${getLabel(el)} 형식이 올바르지 않습니다.`; }
  function msgMinLen(el, n){ return `${getLabel(el)}은(는) 최소 ${n}자 이상이어야 합니다.`; }

  // 각 요소별 검사 — 메시지는 전부 여기서 생성
  function validateInput(el){
    const v = (el.value || "").trim();

    if (el.required && !v) return msgRequired(el);

    switch(el.id){
      case "name":
        if (v.length < Math.max(1, el.minLength || 1)) return msgMinLen(el, Math.max(1, el.minLength || 1));
        if (!NAME_RE.test(v)) return msgPattern(el);
        break;
      case "email":
        if (!el.checkValidity()) return msgType(el); // email 형식
        break;
      case "phone":
        if (!PHONE_RE.test(v)) return msgPattern(el);
        break;
      case "message":
        if (el.required && !v) return msgRequired(el);
        break;
    }
    return "";
  }
  function validateSelect(el){
    if (el.required && !el.value) return msgRequired(el);
    return "";
  }
  function validateRadioGroup(name){
    const radios = form.querySelectorAll(`input[type="radio"][name="${name}"]`);
    const required = Array.from(radios).some(r=>r.required);
    if (!required) return "";
    const checked = Array.from(radios).some(r=>r.checked);
    if (!checked) return `연락 방법을 선택해주세요.`;
    return "";
  }
  function validateAgree(el){
    if (el.required && !el.checked) return msgRequired(el);
    return "";
  }

  // 에러 렌더링(p.error만)
  function setError(el, msg){
    const box = el.closest(".form-box") || el;
    const err = box.querySelector(".error");
    if (err) err.textContent = msg || "";
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) {
      el.setAttribute("aria-invalid", msg ? "true" : "false");
    }
  }

  // 제출: 전체 검사 → 모든 에러 alert 한 번에 + 첫 에러 포커스
  form.addEventListener("submit", (e)=>{
    const errors = [];
    let firstBad = null;

    form.querySelectorAll("input, textarea, select").forEach(el=>{
      let msg = "";
      if (el.tagName === "INPUT") {
        if (el.type === "radio") return; // 라디오는 그룹에서 처리
        if (el.type === "checkbox" && el.name === "agree") msg = validateAgree(el);
        else msg = validateInput(el);
      } else if (el.tagName === "TEXTAREA") {
        msg = validateInput(el);
      } else if (el.tagName === "SELECT") {
        msg = validateSelect(el);
      }
      setError(el, msg);
      if (msg){
        errors.push(`• ${getLabel(el)}: ${msg}`);
        if (!firstBad) firstBad = el;
      }
    });

    // 라디오 그룹(contact)
    const radioMsg = validateRadioGroup("contact");
    if (radioMsg){
      const radios = form.querySelectorAll('input[name="contact"]');
      if (radios.length){
        setError(radios[0], radioMsg); // 그룹 하단 p.error에 출력
        if (!firstBad) firstBad = radios[0];
      }
      errors.push(`• 연락 방법: ${radioMsg}`);
    }

    if (errors.length){
      e.preventDefault();
      alert(errors.join("\n"));
      firstBad?.focus();
    }
  });
});
