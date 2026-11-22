# 팝업 제거 배포 확인 — 2026-11-22

## 결과
- 분양알리미 https://bunyang-alimi.com/ 운영 배포 완료.
- 26개 현장의 단독 URL/포털 상세 URL 총 52개 HTML에서 자동 안내 팝업 제거, 공통 JavaScript 팝업 렌더링 비활성화. 운영 변경 총 53개 파일.
- 배포 전 53개 운영 원본 해시 일치 확인, 배포 후 S3 읽기 검증 완료.
- CloudFront 전체 경로 캐시 갱신 완료. 무효화 ID: I6H7ASUBE73FWGVAZN0L3GZ0JW.
- 공개 URL 73개를 다시 받아 SHA-256 비교: 73개 통과, 실패 0개. 변경하지 않은 20개 파일도 일치.
- 상담신청 form은 변경 전후 동일. 실제 개인정보나 상담신청은 제출하지 않음.
- 브라이튼 여의도 실제 브라우저 화면에서 자동 팝업 없음 및 관심고객 접수 양식 표시 확인.
- 서초 PH1603 https://xn--ph1603-v05zv11e.org/ 는 이미 자동 팝업이 제거된 상태여서 추가 배포하지 않음.

## GitHub
- 저장소: https://github.com/jihyenara1004/bunyang-alimi
- 기존 팝업 제거 PR #14 검증 후 main에 병합: https://github.com/jihyenara1004/bunyang-alimi/pull/14
- 병합 커밋: b09e24e0f6430a3df03418331b1125809443a2fe
- 52개 HTML의 변경은 팝업 div 제거에 한정됨을 비교 검증. 공통 JS는 자동 팝업 렌더링/관련 클릭 처리 제거.
- AGENTS.md에 GitHub/Drive 최신본 기준과 집 노트북의 기존 폴더 사용 금지 지침 기록.

## 보관 구성
Google Drive 분양알리미_최신: https://drive.google.com/drive/folders/1xLmpDHF7CzomAdjtFQ3DcRrnWzqsZx-I
- github-popup-changes-20261122.zip: GitHub 병합 커밋의 변경 파일 53개와 커밋/저장 기준 기록. 전체 사이트 백업이 아님.
- production-popup-deployed-20261122.zip: 실제 운영에 배포한 변경 파일 53개, 배포 전 원본, 파일별 SHA-256 manifest, 배포 및 검증 기록. 전체 사이트 백업이 아님.
- popup-deployment-record-20261122.md: 본 확인 기록.

GitHub와 운영 서버에는 팝업 이외 내용 차이가 있어 각각의 최신본에 팝업 제거 변경만 적용했다. GitHub 파일 전체를 운영에 덮어쓰지 않았다. 향후 작업은 GitHub/Drive의 최신 상태를 확인하며 집 노트북의 기존 폴더를 최신으로 가정하지 않는다.

## 운영 메모
- AWS S3 bucket: bunyang-alimi-site-801178768218
- CloudFront distribution: E32LEWGSB3SNIZ
- 여러 wildcard 경로로 시도한 최초 캐시 갱신은 AWS 동시 처리 제한으로 거절됨. 파일 배포는 이미 성공한 상태였으며 단일 /* 무효화 요청으로 완료 처리함.
- 운영 배포본은 GitHub 소스 ZIP과 구분하여 보관한다.

## 저장 완료 링크
- GitHub 변경 파일 ZIP: https://drive.google.com/file/d/1ZP-wr8gPXyi3zFch2NyPy8Ll__6qVw1A/view?usp=drivesdk
- 운영 배포본 ZIP: https://drive.google.com/file/d/1bFlPrVgCLnT1CP5b-RfN7CUWcfjgcJDr/view?usp=drivesdk
- Drive 확인 기록: https://docs.google.com/document/d/1fGkiMvzE09eyAkSv0bJgO56EXeYJ1m7L/edit?usp=drivesdk&ouid=104034962746942645248&rtpof=true&sd=true
