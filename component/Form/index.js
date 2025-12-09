window.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  form.setAttribute("novalidate", "novalidate");

  // ── Util ───────────────────────────────────────────────────────────────
  const NAME_RE  = /^[A-Za-z가-힣\s]+$/;
  const PHONE_RE = /^(01[016789]-\d{3,4}-\d{4})$/;
  const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  const val  = el => (el.value || "").trim();
  const lab  = el => el.closest(".form-box")?.querySelector(".input-title")?.textContent?.trim()
                  || (el.name === "interest" ? "관심 분야"
                  :  el.name === "contact"  ? "연락 방법"
                  :  el.name === "agree"    ? "개인정보 수집 및 이용"
                  :  undefined);
  const mark = (el, bad) => el.setAttribute("aria-invalid", bad ? "true" : "false");
  const reqMsg = el =>
    el.tagName === "SELECT" ? `${lab(el) ?? "항목"}을(를) 선택해주세요.` :
    (el.type === "checkbox" && el.name === "agree") ? `${lab(el) ?? "개인정보 수집 및 이용"}에 동의해주세요.` :
    `${lab(el) ?? "항목"}을(를) 입력해주세요.`;

  // ── 필드별 룰(필요한 것만 추가) ─────────────────────────────────────────
  const RULES = {
    name: (el) => {
      const v = val(el), L = el.minLength || 1, t = lab(el) ?? "이름";
      if (el.required && !v) return reqMsg(el);
      if (v.length < L)      return `${t}은(는) 최소 ${L}자 이상이어야 합니다.`;
      if (!NAME_RE.test(v))  return `${t} 형식이 올바르지 않습니다.`;
      return "";
    },
    email: (el) => {
      const v = val(el), t = lab(el) ?? "이메일";
      if (el.required && !v) return reqMsg(el);
      if (!EMAIL_RE.test(v)) return `${t} 형식이 올바르지 않습니다.`;
      return "";
    },
    phone: (el) => {
      const v = val(el), t = lab(el) ?? "전화번호";
      if (el.required && !v) return reqMsg(el);
      if (!PHONE_RE.test(v)) return `${t} 형식이 올바르지 않습니다.`;
      return "";
    }
    // textarea#message 등은 required만으로 충분하면 추가 불필요
  };

  // ── 공통 단일 검사(라디오 제외) ────────────────────────────────────────
  function validateField(el) {
    if (el.type === "radio") return "";
    if (el.type === "checkbox" && el.name === "agree")
      return (el.required && !el.checked) ? reqMsg(el) : "";
    if (el.tagName === "SELECT")
      return (el.required && !el.value) ? reqMsg(el) : "";
    if (RULES[el.id]) return RULES[el.id](el);           // 룰 있으면 사용
    if (el.required && !val(el)) return reqMsg(el);      // 기본 required
    return "";
  }

  // ── 라디오 그룹 검사 ──────────────────────────────────────────────────
  function validateRadioGroups(form) {
    const names = new Set([...form.querySelectorAll('input[type="radio"][required]')].map(r => r.name));
    const errors = [];
    let firstBad = null;

    names.forEach(name => {
      const group = [...form.querySelectorAll(`input[type="radio"][name="${name}"]`)];
      const checked = group.some(r => r.checked);
      const title = lab(group[0]) || name;
      if (!checked) {
        group.forEach(r => mark(r, true));
        errors.push(`• ${title}: ${title}을(를) 선택해주세요.`);
        if (!firstBad) firstBad = group[0];
      } else {
        group.forEach(r => mark(r, false));
      }
    });

    return { errors, firstBad };
  }

  // ── 파일명 표시(옵션) ─────────────────────────────────────────────────
  const fileInput = document.querySelector(".file-input");
  const uploadName = document.querySelector(".upload-file");
  if (fileInput && uploadName) {
    fileInput.addEventListener("change", () => {
      const files = [...(fileInput.files || [])];
      uploadName.value = files.length
        ? (files.length <= 2 ? files.map(f => f.name).join(", ")
           : `${files[0].name}, ${files[1].name} 외 ${files.length - 2}개`)
        : "선택된 파일 없음";
    });
  }

  // ── blur: 해당 필드만 즉시 마킹 ────────────────────────────────────────
  form.addEventListener("blur", (e) => {
    const el = e.target;
    if (!["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName)) return;
    if (el.type === "radio") return; // 라디오는 submit에서만
    mark(el, !!validateField(el));
  }, true);

  // ── submit: 한 번에 끝 ────────────────────────────────────────────────
  form.addEventListener("submit", (e) => {
    const errors = [];
    let firstBad = null;

    for (const el of form.querySelectorAll("input, textarea, select")) {
      if (el.type === "radio") continue;
      const msg = validateField(el);
      mark(el, !!msg);
      if (msg) {
        errors.push(lab(el) ? `• ${lab(el)}: ${msg}` : `• ${msg}`);
        if (!firstBad) firstBad = el;
      }
    }

    const { errors: rErr, firstBad: rFirst } = validateRadioGroups(form);
    errors.push(...rErr);
    if (!firstBad && rFirst) firstBad = rFirst;

    if (errors.length) {
      e.preventDefault();
      alert(errors.join("\n"));
      firstBad?.focus();
      firstBad?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });
});
