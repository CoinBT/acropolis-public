# ACROPOLIS 시민 정보 단말 UI

2026-11-21: 기존 기록 데이터는 유지하고 조작부와 화면 구성을 전면 개편했다.

- `src/console.mjs`: 부팅 연출, 명령 파서, 세션 로그, 효과/소리 설정, 전체 화면.
- `src/console.css`: 기기 프레임, 계기 패널, CRT 질감, 반응형 조작부 및 문서 화면.
- `src/app.mjs`: 홈 패널과 기존 조회 기능을 연결한다.

명령 예: `OPEN 05`, `SEARCH 앵커`, `COMPANY arirang`, `HOME`, `ARCHIVE`, `FLOORS`, `STREET`, `HELP`, `LOCK`, `UNLOCK`, `REBOOT`, `CLEAR`.

`UNLOCK`은 기존 두 단계 열람 확인을 호출한다. `REBOOT`는 제한 기록을 다시 잠그고 초기화 연출을 재생한다. 연출은 실제 시스템 접속이나 보안 침투가 아니다. 정적 파일의 기밀 분류는 스포일러 방지용으로 실제 인증이 아니다.

부팅 연출은 탭 세션당 한 번 보이며 즉시 건너뛸 수 있다. 효과 설정은 로컬에 보관한다. 운영체제의 동작 줄이기 설정에서는 애니메이션이 자동으로 비활성화된다. 조작음은 기본 OFF이고 사용자가 켰을 때만 브라우저 Web Audio로 짧게 재생한다. 외부 오디오 파일이나 통신은 사용하지 않는다. 세션 로그와 명령 이력은 메모리에만 유지한다.

## 실행 및 배포

Node.js 20 이상에서 프로젝트 폴더의 `npm run dev`로 실행한다. `npm test`로 원본 보존과 공개/기밀 필터를 검사하고 `npm run build`로 `dist`를 만든다. `dist` 내용 전체를 정적 호스팅의 게시 루트로 배포한다. 해시 경로를 사용하므로 상세 기록 URL에 별도 서버 라우팅이 필요 없다.

운영 저장소: https://github.com/CoinBT/acropolis-public

운영 주소: https://acropolis-civic-archive.onrender.com/

정적 배포 폴더는 `index.html`, `build-config.json`, `src`, `content`, `assets`가 같은 루트에 있어야 한다. `index.html`만 파일로 직접 열지 말고 HTTP 서버로 실행한다. 변경된 JS/CSS는 index의 버전 쿼리도 갱신한다.

## 검증

- 기존 콘텐츠 검사 8개 통과: 40개 ID, 원본 DOCX 추적, 기밀 검색/재잠금, 층별 안정화 수치.
- 40개 기록의 공개/해제 모드와 48개 예시 삽화 연결 확인.
- 명령 파서의 40개 번호 조회, 잘못된 입력 거부, 검색 문자열, 접근 요청 분리 확인.
- Chrome 실제 UI: 부팅, 기록 호출, 검색, 경고와 해제/재잠금, 도판 전환, 모바일 메뉴/기업 페이지, 효과 설정 확인.
