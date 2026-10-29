# 분양알리미 수정 내역 (Claude)

## 2026-10-29 · 서초 PH1603 상세페이지
- 브랜치: `claude/ph1603-detail`
- 루카831 상세페이지와 같은 구조로 서초 PH1603 상세페이지를 새로 구성
  - 상단 메뉴(사업안내·프리미엄·입지환경·평면안내·관심고객), 큰 투시도, 핵심 수치
  - 사업개요 / 핵심 포인트 / 외관·타입 구성
  - 프리미엄: 실내, VIP 웰컴라운지, 지하 3층 커뮤니티, 프라이빗 오뜨 갤러리, 가전·친환경(접기)
  - 입지환경, 조망
  - 평면안내 4종(59A, 59B, 59GA, 59C·127P) 버튼 전환
- 자료: `PH1603 프로젝트 엑시트플랜` 교육자료(PDF) 21쪽을 이미지로 사용
  - 내부용 문구(유출 금지 안내, Sales Talk, 추천 구매자 프로파일)는 잘라내거나 제외
- 변경 파일
  - `outputs/portal/detail-view.js` 끝에 PH1603 전용 렌더 함수 추가 (다른 현장 영향 없음)
  - `outputs/portal/property-detail.css` 끝에 PH1603 히어로 스타일 추가
  - `outputs/portal/properties.js`, `work/property-catalog.json` 의 ph1603 데이터 보강
    (시공 효성중공업㈜, 대지·연면적, 주차, 사용승인, 대표 이미지, 교육자료 페이지, 평면 4종)
  - `outputs/portal/properties/ph1603.html` 재생성 (`node work/generate-property-pages.cjs`)
  - `outputs/portal/assets/ph1603-*.jpg` 이미지 23개 추가
- 확인: PC·모바일 화면, 이미지 로딩, 평면 버튼 전환, 홈 카드·지도 목록 표시
