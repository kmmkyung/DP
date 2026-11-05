'use strict';

// 외부 라이브러리 없이 ZIP 파일 만들기 (무압축 STORE 방식)
// PNG는 이미 압축된 포맷이라 다시 압축해도 거의 줄지 않으므로 무압축으로 충분하다.
// 형식 참고: PKWARE APPNOTE.TXT (Local file header / Central directory / End of central directory)

// [ZIP 파일 구조 — 이 파일이 만드는 모양]
//   [파일1 머리말][파일1 이름][파일1 내용] [파일2 머리말][이름][내용] ...   ← 파일마다 반복 (local header)
//   [파일1 목록][이름] [파일2 목록][이름] ...                               ← 맨 뒤에 모아 둔 "목차" (central directory)
//   [끝 표시]                                                              ← 목차가 어디 있는지 알려 주는 22바이트
// 숫자는 "리틀 엔디언"(낮은 자리부터 저장)으로 씁니다. writeUInt16LE / writeUInt32LE 의 LE 가 그 뜻입니다.
//
// CRC32 = "데이터가 깨지지 않았는지 확인하는 검증 번호". 계산을 빠르게 하려고 256칸짜리 계산표(CRC_TABLE)를 미리 만들어 둡니다.
// 아래 (() => { ... })() 는 "즉시 실행 함수": 한 번 실행해서 표를 만들고 결과만 CRC_TABLE 에 담습니다.
const CRC_TABLE = (() => {
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
  const FLAG_UTF8 = 0x0800; // 파일명이 UTF-8임을 표시 (한글 파일명 깨짐 방지)
  // locals: 파일 부분(머리말 + 이름 + 내용)을 모으는 곳 / centrals: 맨 뒤 목차를 모으는 곳
  // offset: 지금까지 쓴 바이트 수 (목차가 "각 파일이 몇 번째 바이트에서 시작하는지"를 기억하는 데 씁니다)
  const locals = [];
  const centrals = [];
  let offset = 0;

  for (const f of files) {
    const name = Buffer.from(f.name, 'utf8');
    const crc = crc32(f.data);

    // 파일 머리말(30바이트) 칸 배치 — 숫자는 시작 위치(바이트)
    //   0: 시그니처 PK\x03\x04 (파일 머리말이라는 표식)   4: 필요한 버전   6: 플래그(UTF-8 이름)   8: 압축 방식(0 = 무압축)
    //   10: 시간   12: 날짜   14: 검증번호(CRC32)   18: 압축 후 크기   22: 원래 크기(무압축이라 같음)   26: 이름 길이   28: 추가 정보 길이(0)
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4); // version needed
    local.writeUInt16LE(FLAG_UTF8, 6);
    local.writeUInt16LE(0, 8); // method: store
    local.writeUInt16LE(time, 10);
    local.writeUInt16LE(date, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(f.data.length, 18);
    local.writeUInt32LE(f.data.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);
    locals.push(local, name, f.data);

    // 목차 항목(46바이트): 머리말과 비슷하지만 앞부분에 "만든 버전"이 더 있고(4),
    // 42번째 칸에 "이 파일의 머리말이 ZIP 안에서 몇 번째 바이트에서 시작하는지(offset)"를 적습니다.
    // ZIP 프로그램은 이 목차를 보고 원하는 파일로 바로 이동합니다.
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4); // version made by
    central.writeUInt16LE(20, 6); // version needed
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

  // 끝 표시(22바이트): 파일이 몇 개인지(8, 10), 목차의 크기(12), 목차 시작 위치(16)를 적습니다.
  // ZIP 프로그램은 파일 맨 끝에서 이 표시를 먼저 찾고, 거기서 목차 → 각 파일 순서로 읽어 갑니다.
  const centralSize = centrals.reduce((s, b) => s + b.length, 0);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralSize, 12);
  end.writeUInt32LE(offset, 16);

  // 파일 부분들 + 목차 + 끝 표시를 순서대로 이어 붙여 ZIP 을 완성합니다.
  return Buffer.concat([...locals, ...centrals, end]);
}

module.exports = { createZip };
