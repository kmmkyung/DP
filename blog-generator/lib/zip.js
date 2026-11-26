'use strict';

// 외부 라이브러리 없이 ZIP 파일 만들기 (무압축 STORE 방식)
// PNG는 이미 압축된 포맷이라 다시 압축해도 거의 줄지 않으므로 무압축으로 충분하다.
// 형식 참고: PKWARE APPNOTE.TXT (Local file header / Central directory / End of central directory)

// ─────────────────────────────────────────────
// [이 파일에서 쓰는 메소드(기본 제공 기능) 설명]
// 메소드 = 값 뒤에 점(.)을 찍어 부르는 기능입니다.   예) "abc".trim()   (값.기능이름())
// 설명은 MDN(JavaScript / Web API), Node.js, Playwright 공식 문서로 대조한 내용입니다.
//
// ■ 배열 (Array) — 목록 값 뒤에 점을 찍어 쓰는 기능
//   push()  — 배열 맨 끝에 항목을 추가합니다. 원본 배열이 바뀝니다.
//       예) list.push("a")
//   reduce()  — 항목들을 차례로 돌며 앞의 결과와 합쳐서 최종 하나의 값을 만듭니다.
//       예) [1, 2, 3].reduce(function (sum, x) { return sum + x; }, 0) → 6
//
// ■ 숫자·날짜 (Math, Date)
//   Math.floor()  — 소수를 내림해 정수로 만듭니다.
//       예) Math.floor(2.9) → 2
//   getFullYear()  — 날짜에서 연도를 꺼냅니다.
//   getMonth()  — 날짜에서 월을 꺼냅니다. 1월이 0, 12월이 11 이라서, 화면에 보여 줄 때는 +1 을 해야 합니다.
//       예) new Date(2026, 0, 5).getMonth() → 0
//   getDate()  — 날짜에서 "일"(1~31)을 꺼냅니다.
//   getHours()  — 날짜에서 시(0~23)를 꺼냅니다.
//   getMinutes()  — 날짜에서 분(0~59)을 꺼냅니다.
//   getSeconds()  — 날짜에서 초(0~59)를 꺼냅니다.
//
// ■ 바이트 덩어리 (Node: Buffer)
//   Buffer.alloc()  — 정해진 크기의 바이트(0~255 숫자) 덩어리를 0 으로 채워 만듭니다.
//       예) Buffer.alloc(30)
//   Buffer.from()  — 글자를 지정한 방식(utf8 등)으로 바이트 덩어리로 바꿉니다.
//       예) Buffer.from("가", "utf8")
//   Buffer.concat()  — 여러 바이트 덩어리를 순서대로 이어 붙여 하나로 만듭니다.
//   writeUInt16LE()  — 정해진 위치에 0~65535 숫자를 2바이트로 기록합니다. LE = 낮은 자리부터 저장(리틀 엔디언).
//   writeUInt32LE()  — 정해진 위치에 큰 숫자를 4바이트로 기록합니다. LE = 낮은 자리부터 저장.
//
// ■ 새로 만들기 (new)
//   new Date  — 지금 시각(또는 지정한 날짜)을 다루는 값을 만듭니다.
//   new Uint32Array  — 크기가 고정된 32비트 숫자 배열을 만듭니다. 계산표를 만들 때 씁니다.
// ─────────────────────────────────────────────

// [ZIP 파일 구조 — 이 파일이 만드는 모양]
//   [파일1 머리말][파일1 이름][파일1 내용] [파일2 머리말][이름][내용] ...   ← 파일마다 반복 (local header)
//   [파일1 목록][이름] [파일2 목록][이름] ...                               ← 맨 뒤에 모아 둔 "목차" (central directory)
//   [끝 표시]                                                              ← 목차가 어디 있는지 알려 주는 22바이트
// 숫자는 "리틀 엔디언"(낮은 자리부터 저장)으로 씁니다. writeUInt16LE / writeUInt32LE 의 LE 가 그 뜻입니다.
//
// CRC32 = "데이터가 깨지지 않았는지 확인하는 검증 번호". 계산을 빠르게 하려고 256칸짜리 계산표(CRC_TABLE)를 미리 만들어 둡니다.
// 아래 (function () { ... })() 는 "즉시 실행 함수": 한 번 실행해서 표를 만들고 결과만 CRC_TABLE 에 담습니다.
const CRC_TABLE = (function () {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

// 파일 내용(buf)의 검증 번호를 계산합니다. ZIP 을 여는 프로그램이 이 번호로 파일이 온전한지 확인합니다.
// (>>> 0 은 부호 없는 32비트 숫자로 맞추는 표현입니다)
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

// 현재 시각을 ZIP 이 쓰는 "DOS 형식" 16비트 숫자 두 개로 바꿉니다.
//   시간 = 시(5비트) 분(6비트) 초÷2(5비트) / 날짜 = (연도-1980)(7비트) 월(4비트) 일(5비트) 를 비트 단위로 이어 붙인 것
//   (<< 는 왼쪽으로 밀기, | 는 합치기)
function dosDateTime(d) {
  const time = (d.getHours() << 11) | (d.getMinutes() << 5) | Math.floor(d.getSeconds() / 2);
  const date = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
  return { time, date };
}

// files 를 받아 ZIP 파일 전체(Buffer = 바이트 덩어리)를 만들어 돌려줍니다.
// 압축은 하지 않고 그냥 담습니다(STORE). PNG 는 이미 압축된 형식이라 다시 압축해도 거의 줄지 않기 때문입니다.
/**
 * @param {Array<{name: string, data: Buffer}>} files
 * @returns {Buffer}
 */
function createZip(files) {
  const { time, date } = dosDateTime(new Date());
  const FLAG_UTF8 = 0x0800;
  const locals = [];
  const centrals = [];
  let offset = 0;

  for (const f of files) {
    const name = Buffer.from(f.name, 'utf8');
    const crc = crc32(f.data);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(FLAG_UTF8, 6);
    local.writeUInt16LE(0, 8);
    local.writeUInt16LE(time, 10);
    local.writeUInt16LE(date, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(f.data.length, 18);
    local.writeUInt32LE(f.data.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);
    locals.push(local, name, f.data);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(FLAG_UTF8, 8);
    central.writeUInt16LE(0, 10);
    central.writeUInt16LE(time, 12);
    central.writeUInt16LE(date, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(f.data.length, 20);
    central.writeUInt32LE(f.data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt32LE(offset, 42);
    centrals.push(central, name);

    offset += local.length + name.length + f.data.length;
  }

  const centralSize = centrals.reduce(function (s, b) { return s + b.length; }, 0);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralSize, 12);
  end.writeUInt32LE(offset, 16);

  return Buffer.concat([...locals, ...centrals, end]);
}

module.exports = { createZip };
