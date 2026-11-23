# 2026-11-24 광고 사이트링크 위치 보정

GD와 PH 독립사이트에서 최초 해시 이동 이후 이미지·폰트 로딩으로 목적지가 밀리던 문제를 수정했다. 사용자 스크롤·터치·클릭·키 입력이 시작되면 자동 보정을 중단한다. GD는 누락된 이미지 크기 5개도 지정했다.

GD: source.html 원본에서 생성한 HTML 3개만 배포. 운영 source SHA256 78e183039b0d67786e10ed85a2aad87d43c40d25a591f6b9cc191d00b781188e. 배포 스크립트 테스트 통과, 공개 URL 6개와 공용 자산 54개 검증 통과, 다른 S3 객체 변경 없음. 기존 신청폼과 전환 코드는 유지. 기존 광고 URL 변경 없음.

PC 실제 브라우저: gd-inline-interest, types-gdmetro, location-gdmetro, premium-gdmetro가 고정 메뉴 아래 약116px에 정렬됨.

PH 독립사이트 원본: SanGhoon0819/ph1603-landing, site/index.html. GitHub main 변경 시 Actions에서 AWS 계정908694008366 S3 ph1603-landing-908694008366 / CloudFront E3QI569UV8RJ3V에 자동 배포. 독립사이트는 분양알리미 저장소에 복제해 관리하지 않는다.

PH 수정 커밋: 89ab0e100c97016b14e3ccd61b5a232182b54fe7. 기존 운영과 GitHub 원본 내용 일치 확인 후 수정. leadForm, unit, contact, premium이 고정 메뉴 아래 약92px에 정렬됨. 사용자 추가 요청에 따라 #bora-message-check 표시를 top:45vh로 이동해 로고 가림 해결. 모바일 CSS에서는 left:12px. 보라웨어 감시 스크립트와 신청폼은 변경하지 않음.

보라웨어 스크립트 삽입상태는 광고 성과가 아닌 최근 확인 상태다. 계정 내부의 '7일 이상' 상세 진단은 본 작업 브라우저에서 로그인되지 않아 조회하지 못했다. 웹사이트 표시 이동과 감시 스크립트 유지 확인은 완료.
