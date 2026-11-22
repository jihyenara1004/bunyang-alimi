# GD메트로타워 메인 사진 3장 및 BYC 제거

사용자 승인에 따라 2026-11-23(한국시간) 운영 반영.

## 변경

- 주간 전경 → 야간 조감도 → 광역 전경 순서로 첫 화면에 세로 배치.
- 주간 원본의 다른 업체명, 로고, 1666-1691을 제거하고 `분양문의 1688-5650`으로 교체. 내장 image_gen으로 해당 부분을 편집했으며 구도와 건물을 유지하도록 요청했다.
- 사업개요 시공 항목, BYC 시공실적 이미지와 설명, BYC 부지 문구, 하단 시공사와 검색 키워드에서 BYC/비와이씨 제거.
- 원본: `sites/gdmetro/source.html` 하나. 두 도메인과 내부 상세 URL을 같은 원본으로 생성한다.
- 기존 상담폼, 전화 링크, 광고 설정, 다른 현장과 메인 페이지 유지.
- 원본 사진 출처: https://gdmetro.taeboksolution.com/main
- 이미지 원본 파일: title1794384256.jpg, section-011794384354.jpg, section-03-011794384371.jpg. BYC 소개 이미지 section-021794384363.jpg는 사용하지 않음.

## 검증

- 테스트 통과: 한 원본 동시 반영, 사진 순서, BYC 제거, 상담폼·브랜드·canonical·팝업 방지.
- 공개 HTML 3개와 새 사진 3개의 SHA256 일치, 기존 공유 자산 54개 HTTP 200.
- 전용 사이트 실제 브라우저에서 사진 3장 로딩, 1688-5650, BYC 제거와 가로 넘침 없음 확인. 상담폼 실접수는 하지 않음.
- CloudFront 두 배포 캐시 갱신 Completed.
- 배포 전후 다른 S3 객체 881개(메인 878, 전용 3) ETag·크기·수정시각 동일.
- 분양알리미 메인 HTML SHA256 전후 동일: ba8a95a91febdff32808313785b928939349f59027bc2fdbe940b4ed2f876974.
- GD 원본 SHA256: b1075babe203af07ea39c3f470cd38edc9c0707bc1b486ae60657c5a42482eb8.
- AWS release: 20261122T162426Z-617e90bb (UTC 식별자; 한국 날짜 2026-11-23).

## 운영 주소

- https://gdmetro.bunyang-alimi.com/
- https://bunyang-alimi.com/gdmetro/
- https://bunyang-alimi.com/outputs/portal/properties/gdmetro.html

## 앞으로 수정할 때

GitHub main과 Drive `분양알리미_최신` 최신 기록을 먼저 확인한다. `sites/gdmetro/README.md`에 따라 source.html을 수정하고 `python3 sites/gdmetro/deploy.py --apply`로 배포한다. 새 사진 세 개도 명시적 배포 허용 목록에 포함되며 두 사이트가 한 벌의 사진을 공유한다. 생성 HTML을 따로 편집하지 않는다. 배포 후 캐시 갱신과 `node sites/gdmetro/verify.mjs` 확인, 원본·사진·기록을 GitHub/Drive에 함께 저장한다.

첫 사진 편집 요청: 전체 구도·건물·하늘·기존 큰 제목 유지, 왼쪽 아래 태복플래닝 로고/회사명/영문표기/1666-1691을 제거하고 작은 분양문의와 큰 1688-5650으로 교체, 오른쪽 저층 건물의 작은 BYC 간판 제거. 도구: 기본 내장 image_gen.
