/** @format */

window.addEventListener("DOMContentLoaded", function () {
  const canvas = document.querySelector("canvas");
  const ctx = canvas.getContext("2d");

  // 기본셋팅
  canvas.width = innerWidth;
  canvas.height = innerHeight;

  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.lineWidth = 100;

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let lastX = 0;
  let lastY = 0;
  let isDrawing = false;

  function draw(x, y) {
    if (!isDrawing) return;

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();

    [lastX, lastY] = [x, y];
  }

  // 마우스 이벤트
  canvas.addEventListener("mousedown", (e) => {
    isDrawing = true;
    ctx.globalCompositeOperation = "destination-out";
    [lastX, lastY] = [e.offsetX, e.offsetY];
  });

  canvas.addEventListener("mousemove", (e) => draw(e.offsetX, e.offsetY));

  canvas.addEventListener("mouseup", () => {
    isDrawing = false;
    ctx.globalCompositeOperation = "source-over";
  });

  canvas.addEventListener("mouseout", () => {
    isDrawing = false;
    ctx.globalCompositeOperation = "source-over";
  });

  // 터치 이벤트
  canvas.addEventListener("touchstart", (e) => {
    isDrawing = true;
    ctx.globalCompositeOperation = "destination-out";

    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    lastX = touch.clientX - rect.left;
    lastY = touch.clientY - rect.top;

    e.preventDefault(); // 스크롤 방지
  });

  canvas.addEventListener("touchmove", (e) => {
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    draw(x, y);
    e.preventDefault(); // 스크롤 방지
  });

  canvas.addEventListener("touchend", () => {
    isDrawing = false;
    ctx.globalCompositeOperation = "source-over";
  });
});
