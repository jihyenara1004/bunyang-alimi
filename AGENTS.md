# 작업 기준과 저장 위치

사용자 확인: 2026-11-22

- 최신 소스는 GitHub `jihyenara1004/bunyang-alimi`의 최신 브랜치/커밋과 Google Drive `분양알리미_최신` 폴더에서 확인한다.
- Drive: https://drive.google.com/drive/folders/1xLmpDHF7CzomAdjtFQ3DcRrnWzqsZx-I
- 집 노트북의 기존 로컬 폴더는 최신본이 아니다. 회사 컴퓨터 폴더의 최신 작업을 집 컴퓨터에 있다고 가정하지 않는다.
- 새 작업 전 GitHub와 Drive의 최신 상태를 확인한다. 클라우드 자료 간 차이가 있으면 커밋/수정일과 실제 내용을 비교하고 오래된 파일로 덮어쓰지 않는다.
- 완료한 변경과 작업 기록은 GitHub와 위 Drive 폴더에 저장한다. 로컬 임시 파일을 최종본으로 취급하지 않는다.
- bunyang-alimi.com 운영은 AWS S3/CloudFront다. GitHub 병합만으로 실제 운영 배포 완료라고 판단하지 않는다. 배포 시 운영 현황과 대상 파일을 확인하고 배포 후 공개 URL을 검증한다.
- GitHub와 운영 서버에는 팝업과 관계없는 차이가 있을 수 있다. 요청 범위의 변경만 적용하고 전체 사이트를 오래된 사본으로 덮어쓰지 않는다.

## GD메트로타워 동시 반영 — 2026-11-23

- GD 내용의 유일한 수정 원본은 `sites/gdmetro/source.html`이다. 먼저 `sites/gdmetro/README.md`를 읽는다.
- `gdmetro/index.html`, `outputs/portal/properties/gdmetro.html`, `sites/gdmetro/site/index.html`은 생성 파일이다. 직접 따로 수정하지 않는다. `production-source.html`은 과거 보관본이며 빌드 입력이 아니다.
- `python3 sites/gdmetro/deploy.py --apply`로 테스트·생성 후 GD HTML 세 개를 두 사이트에 일괄 배포한다. 캐시 갱신 완료 후 `node sites/gdmetro/verify.mjs`로 공개 URL의 같은 원본 해시와 실제 내용을 확인한다.
- 다른 현장 및 메인 페이지·공용 자산은 변경하지 않는다. 전체 사이트를 동기화하거나 삭제하지 않는다.
- 앞으로 GD 내용 수정 때문에 광고 그룹을 다시 만들거나 기존/새 그룹 실적을 비교하는 작업을 추가하지 않는다. 광고 변경은 사용자가 별도로 요청한 범위에서만 한다.
- 수정 후 원본·생성 파일·배포 해시와 검증 기록을 GitHub와 Google Drive `분양알리미_최신`에 같이 저장한다.
