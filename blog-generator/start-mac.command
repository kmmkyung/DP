#!/bin/bash
cd "$(dirname "$0")" || exit 1
if ! command -v node > /dev/null; then
  echo "Node.js가 설치되어 있지 않습니다. https://nodejs.org 에서 LTS 버전을 설치한 뒤 다시 실행해 주세요."
  read -r -n 1
  exit 1
fi
if [ ! -d node_modules ]; then
  echo "처음 실행이라 필요한 프로그램을 설치합니다. 몇 분 걸릴 수 있어요."
  if ! npm install || ! npx playwright install chromium; then
    echo "설치 중 오류가 발생했습니다. 위 메시지를 개발팀에 전달해 주세요."
    read -r -n 1
    exit 1
  fi
fi
node server.js --open
