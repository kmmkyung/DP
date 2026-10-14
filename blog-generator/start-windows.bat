@echo off
chcp 65001 > nul
cd /d "%~dp0"
where node > nul 2> nul
if errorlevel 1 (
  echo Node.js가 설치되어 있지 않습니다. https://nodejs.org 에서 LTS 버전을 설치한 뒤 다시 실행해 주세요.
  pause
  exit /b 1
)
if not exist node_modules (
  echo 처음 실행이라 필요한 프로그램을 설치합니다. 몇 분 걸릴 수 있어요.
  call npm install || goto fail
  call npx playwright install chromium || goto fail
)
node server.js --open
pause
exit /b 0
:fail
echo 설치 중 오류가 발생했습니다. 위 메시지를 개발팀에 전달해 주세요.
pause
exit /b 1
