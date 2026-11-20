# ACROPOLIS BGM

## 생성 완료 / 다운로드 대기

- 곡: ACROPOLIS - Dormant Terminal
- Suno v6, 약 3분 35초, 보컬 없는 산업 앰비언트, 72 BPM
- 선택한 곡: https://suno.com/song/6a661677-826b-45d0-854d-93bc61063af4
- 함께 생성된 버전: https://suno.com/song/4d9bb5be-c762-4630-9b99-f4603f300edf
- 2026-11-21 화면에서 Pro Plan 다운로드 잔여 0, 갱신일 2026-11-24 확인.
- 사용자는 추가 결제 대신 갱신 후 적용을 선택했다. 다운로드 제한을 우회하지 않는다.

## 현재 구현

`BGM start`와 `BGM stop`은 대소문자와 관계없이 인식한다. 검색 오른쪽 스피커 버튼은 전체 음소거이며 마우스 hover 또는 키보드 focus 시 볼륨 패널이 열린다. 터치에서는 버튼을 눌러 패널에 접근할 수 있다. 볼륨은 BGM과 효과음에 함께 적용되고 음소거/볼륨 설정은 로컬 저장된다. 기존 하단 소리 스위치는 효과음 전용이다.

페이지 전환 때 오디오 객체를 다시 만들지 않는다. 재생 중 화면을 바꿔도 이어진다. 브라우저 자동 재생 정책에 맞춰 최초 클릭 후 재생하며, 명시적으로 정지한 BGM은 메뉴 클릭으로 재시작하지 않는다. `BGM start`는 음소거를 풀고 재생한다. 다운로드 전에는 `audio-config.mjs`의 `available:false`로 음원을 요청하지 않고 등록 대기 상태를 표시한다.

## 갱신 후 적용 절차

1. 열린 Suno 계정에서 선택한 곡을 정상 Download 기능으로 받는다. 갱신이 아직 안 됐다면 결제하지 말고 상태를 알린다.
2. MP3를 `outputs/acropolis-public/assets/acropolis-dormant-terminal.mp3`와 `outputs/acropolis/public/assets/acropolis-dormant-terminal.mp3`에 복사한다.
3. 양쪽 `src/audio-config.mjs`의 `available`을 true로 바꾼다. config와 audio 모듈 import, app/index의 버전 쿼리를 갱신한다.
4. 실제 브라우저에서 재생 시간 진행, BGM stop 후 정지, BGM start 재개, 음소거, 볼륨, 페이지 전환과 모바일을 확인한다.
5. 기존 CoinBT/acropolis-public 저장소와 Render 정적 서비스(srv-dbmi88utlv9c73as39ig, workspace tea-db6fdrks728c738b148g)에 배포하고 두 ZIP을 갱신한다. 원본 기록 데이터는 수정하지 않는다.
