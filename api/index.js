/** @format */

// /** @format */

// const links = document.querySelectorAll(".apiLink");
// const resultList = document.getElementById("resultList");

// links.forEach((link) => {
//   link.addEventListener("click", (e) => {
//     e.preventDefault(); // 링크 이동 막기

//     const codeValue = link.dataset.code;
//     const url = `https://example.com/do?code=${encodeURIComponent(codeValue)}`;

//     fetch(url)
//       .then((response) => {
//         if (!response.ok)
//           throw new Error("네트워크 응답 에러: " + response.status);
//         return response.json();
//       })
//       .then((data) => {
//         // 화면 초기화
//         resultList.innerHTML = "";

//         // JSON 구조 예: { "a": { "main": [...] } }
//         const key = codeValue; // a, b, c
//         if (data[key] && Array.isArray(data[key].main)) {
//           data[key].main.forEach((item) => {
//             const li = document.createElement("li");
//             li.textContent = item; // item이 객체이면 li.textContent = JSON.stringify(item)
//             resultList.appendChild(li);
//           });
//         } else {
//           const li = document.createElement("li");
//           li.textContent = "main 배열이 없습니다.";
//           resultList.appendChild(li);
//         }
//       })
//       .catch((error) => {
//         console.error("API 호출 실패:", error);
//         resultList.innerHTML = `<li>API 호출 실패: ${error}</li>`;
//       });
//   });
// });
