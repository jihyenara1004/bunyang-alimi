# 현장별 전용 주소 — 2026-11-23

기존 AWS S3/CloudFront를 유지하며 10개 현장의 전용 하위 도메인을 연결했습니다. 현장 내용은 기존 운영 페이지를 보존했습니다. PH1603 독립 도메인 `https://서초ph1603.org` 및 기존 GD 전용 배포는 변경하지 않았습니다.

## 수정 원본

`sites.json`의 각 `id`에 해당하는 루트 `<id>/index.html`이 해당 현장의 유일한 HTML 수정 원본입니다. 예: 브라이튼은 `brighten/index.html`, 전용 주소는 `https://brighton.bunyang-alimi.com/`입니다.

- 전용 도메인 `/` 요청은 CloudFront 함수가 같은 S3 `<id>/index.html` 객체로 내부 연결합니다. 별도 사이트 사본을 만들지 않습니다.
- 기존 `/<id>/`, `/<id>/index.html`, `/properties/<id>.html`, `/outputs/portal/properties/<id>.html`은 새 주소로 301 이동합니다. 검색어·광고 매개변수를 보존하며 브라우저는 해시를 유지합니다.
- 기존 상세 경로 파일은 호환용 과거 사본입니다. 따로 편집하거나 배포하지 마세요. CloudFront에서 전용 주소로 이동하므로 방문자에게 별도 내용이 노출되지 않습니다.
- `outputs/portal/app.js`의 현장 링크와 메인 HTML의 직접 링크는 전용 주소를 사용합니다.
- 공용 CSS/JS/사진은 기존 분양알리미 자산을 사용합니다. 예약 폼 HTML과 접수 수신 설정은 보존했습니다.
- `routing.js`는 운영 함수 `bunyang-dedicated-routing`의 원본입니다. 기존 메인 사이트의 디렉터리 index 처리도 유지합니다.
- 전용 사이트의 favicon, robots, sitemap은 `sites/dedicated/<id>/`에 있습니다.

## 다음 수정 시

1. GitHub 최신 커밋, Drive 최신 백업, 실제 S3 객체를 비교합니다. 이번에도 운영본에 GitHub와 다른 최신 푸터/자산 버전이 있어 운영 내용을 보존했습니다.
2. 해당 `<id>/index.html`만 수정합니다. 이름·연락처·개인정보 동의 및 `data-lead-property` 식별자를 보존합니다.
3. 배포 전 실제 S3 객체의 내용/ETag를 백업하고, 변경 대상을 조건부 업로드합니다. 전체 버킷 동기화나 삭제는 하지 않습니다.
4. HTML 갱신 후 CloudFront E32LEWGSB3SNIZ에서 전용 URL `/`와 내부 객체 `/<id>/index.html` 캐시를 무효화하고, 최종 전용 주소의 실제 내용을 확인합니다.
5. GitHub와 Drive `분양알리미_최신`에 함께 저장합니다.

`migration-20261123/`은 이번 최초 연결 작업의 기록입니다. `prepare`를 재실행하는 일반 배포 도구가 아닙니다. 조건부 검사와 기존 상태가 달라지면 중단하도록 작성되어 있습니다. 재구축 입력과 운영 이전 스냅샷은 Drive 백업에 보관합니다.

## 검증

- 로컬 라우팅 검사 94개 통과.
- 예약 폼 원문 10/10 보존, 인라인 JavaScript 구문 검사 통과.
- AWS Function 실행 검사 통과.
- 공개 주소 50개 검사: 10개 루트, 예전 상세주소 20개, robots 10개, sitemap 10개 모두 최종 HTTP 200.
- 10개 전용 사이트의 제목, canonical, 현장별 예약 폼, 이름·연락처·필수 동의 항목을 브라우저에서 확인.
- S3 배포 파일 45개 SHA-256 일치. CloudFront Deployed, 캐시 무효화 Completed.
- 실제 고객 정보 제출은 하지 않았습니다.
