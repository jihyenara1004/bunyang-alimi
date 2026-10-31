# 분양알리미 AI 작업 인수인계 (GPT ↔ Claude 공용)

이 문서는 ChatGPT(Codex)와 Claude가 번갈아 작업해도 서로의 작업을 덮어쓰지 않도록 남기는 안내입니다.
마지막 갱신: 2026-10-29 (Claude)

## 1. 기준 원본
- **GitHub `jihyenara1004/bunyang-alimi`의 `main` 브랜치가 유일한 기준 원본**입니다.
- 실제 사이트 bunyang-alimi.com = `main` (GitHub Pages, 앞단 DNS는 Cloudflare).
- 사용자 컴퓨터 사본: `C:\Users\User\Documents\Codex\분양알리미_최신\` (Claude가 `main`과 같게 맞춰 둠).
  - 작업 전에 반드시 GitHub `main`을 먼저 받아서(또는 이 폴더를 복사해서) 시작하세요.
  - 예전 날짜 폴더(`Codex\2026-10-28\...\outputs\portal`)는 오래된 버전이라 그 파일로 덮어쓰면 최근 수정이 사라집니다.
- 작업은 별도 브랜치(`claude/...`, `gpt/...`)에서 하고, 확인 후 `main`에 반영합니다.

## 2. 폴더 구조
- `index.html` (루트): 실제 첫 화면. `<base href="/outputs/portal/">`로 아래 파일을 불러옴
- `outputs/portal/properties.js`: 현장 데이터 (화면이 읽는 파일)
- `work/property-catalog.json`: 같은 현장 데이터 (상세페이지 생성용) → **두 파일을 항상 같이 수정**
- `outputs/portal/detail-view.js`: 상세페이지 그리는 코드. 현장별 함수가 아래로 덧붙는 구조(뒤에 붙은 함수가 우선)
- `outputs/portal/property-detail.css`: 상세페이지 스타일 (맨 아래일수록 우선)
- `outputs/portal/app.js`: 홈·지도·카드·상세창
- `outputs/portal/properties/*.html`: 현장별 단독 상세페이지 → `node work/generate-property-pages.cjs`로 자동 생성 (직접 수정 금지)
- `sitemap.xml`: 홈 + 현장 상세 12개

## 3. 데이터를 바꾼 뒤 할 일
1. `properties.js`와 `work/property-catalog.json` 둘 다 수정
2. `node work/generate-property-pages.cjs` 실행 (상세페이지 12개 재생성)
3. 바꾼 js/css가 있으면 `index.html`, `outputs/portal/index.html`의 `?v=` 캐시 번호 올리기
4. 수정 내역을 `CHANGELOG-claude.md`(또는 각자 변경기록)에 남기기

## 4. Claude가 만든 것 (지우지 마세요)
- 상세페이지 신규·재구성: 서초 PH1603, 한강 푸르지오 리버프론트, 과천청사역 한양수자인(상담북 기반)
- `window.renderSeoSummary`: 상세 상단 "한눈에 보기" (검색엔진용 텍스트). 데이터 `p.seo = {summary, points, types, typesHead}`
  - 문구 스타일: "~입니다" 문장 대신 짧은 정보 줄(· 구분)
- `window.renderDetailPopup`: 상세를 열 때 뜨는 안내 팝업. 데이터 `p.popup = {cards:[{title:[...], items:[[굵은글씨, 설명]]}]}`
- 추천 카드 배지: `p.promotion`이 있으면 빨간 배지, 문구는 `p.promotionLabel`(없으면 "프로모션 진행 중")
- 상세창: 제목줄 고정, "−" 버튼 = 아래로 내리기(최소화)
- 사진 아래 캡션·안내문(`figcaption`, `.gd-material-note`, `.gd-cg`, `.source-note`)은 CSS로 전부 숨김 (사용자 요청)
- 평면도는 왼쪽 설명 글을 잘라내고 도면만 크게
- 내부용 교육자료의 "외부유출 금지"·Sales Talk·추천 구매자 프로파일 부분은 사이트에 쓰지 않음

## 5. 사용자 요청 사항 (공통 규칙)
- 답변·문구는 한국어, 홈페이지 문구는 짧게
- 대표번호 1688-5650 (현장 공식 번호 대신)
- 비용이 안 드는 방법 우선
- 비밀번호·API Secret·고객 개인정보는 GitHub에 올리지 않기 (네이버 지도 Client ID, Make 웹훅 주소는 공개값)

## 6. 진행 중
- 2026-10-30: 뉴스 삭제, 추천현장(매주 4곳 자동, `pinned` 고정), 헤더 고정, 지도 묶음·지역버튼 (CHANGELOG-claude 참고)
- 힐스테이트 송파더그리드: 상세·팝업 완료 (이미지 로컬 저장 완료)
- 남은 기본형 상세: DK밸리뷰 용산
- 브라이튼 여의도: 전용 렌더러 완료(2026-10-29, `br-detail`, 데이터 `p.site`/`p.plans`)
- 고촌센트럴자이: 전용 렌더러 완료(2026-10-29, `gc-detail`)
- 마곡 롯데캐슬 르웨스트: 범용 렌더러(`p.page`)로 완료. 새 현장은 `p.page` 데이터만 추가하면 됨 (예시: lewest)
- 하남시청역 성원상떼빌: 완료(`hanam`, PDF 기반)
- 운정 아이파크 포레스트: 완료(`unjeong`)
- 오남역 서희스타힐스 여의재: 완료(`onam`)
- 원종역 중앙하이츠: 완료(`wonjong`)
- 씨엘스톤 더 써밋 구로구청: 완료(`clestone`)
- 푸르지오 스타셀라49: 완료(`starsella`)
- 계양신도시 카이브 유보라: 완료(`kaive`)
- 화서역 호수공원 아너스빌: 완료(`hwaseo`)
- 사우역 지엔하임: 완료(`zienheim`)
- 대기: 왕숙진접 메르디앙 (사이트 접속 안 됨 · 벽산블루밍·라온·디에트르Ⅱ 완료)
- 대기: 왕숙진접 메르디앙 (벽산블루밍·라온프라이빗 센트로 완료)
