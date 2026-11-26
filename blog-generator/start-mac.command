#!/bin/bash
# ─────────────────────────────────────────────
# [이 파일의 역할] Mac 에서 더블클릭하면 서버를 켜고 브라우저를 여는 실행 파일입니다. (Windows 는 start-windows.bat)
# 처음 실행할 때는 필요한 프로그램도 자동으로 설치합니다.
# ─────────────────────────────────────────────
# 이 파일이 있는 폴더로 이동합니다. ($0 = 이 파일의 경로, dirname = 폴더 부분)
# 어느 위치에서 실행해도 같게 동작하게 하려는 것이고, 이동에 실패하면(|| exit 1) 종료합니다.
cd "$(dirname "$0")" || exit 1
# Node.js 가 설치되어 있는지 확인합니다. 없으면 안내 문구를 보여 주고, 키 입력을 기다린 뒤(read) 종료합니다.
if ! command -v node > /dev/null; then
  echo "Node.js가 설치되어 있지 않습니다. https://nodejs.org 에서 LTS 버전을 설치한 뒤 다시 실행해 주세요."
  read -r -n 1
  exit 1
fi
# node_modules 폴더가 없으면 "처음 실행"이라고 보고 필요한 프로그램을 설치합니다.
#  npm install                    : package.json 에 적힌 부품(Playwright) 설치
#  npx playwright install chromium: 캡처에 쓰는 브라우저 내려받기
# 둘 중 하나라도 실패하면 안내 문구를 보여 주고 키 입력을 기다린 뒤 종료합니다.
if [ ! -d node_modules ]; then
  echo "처음 실행이라 필요한 프로그램을 설치합니다. 몇 분 걸릴 수 있어요."
  if ! npm install || ! npx playwright install chromium; then
    echo "설치 중 오류가 발생했습니다. 위 메시지를 개발팀에 전달해 주세요."
    read -r -n 1
    exit 1
  fi
fi
# 서버를 켭니다. --open: 켜진 뒤 브라우저를 자동으로 엽니다. 종료하려면 이 창에서 Ctrl + C.
node server.js --open
