# GD메트로타워 단일 원본·동시 배포 완료 — 2026-11-23

## 결과와 수정 위치

GD 원본 한 파일 `sites/gdmetro/source.html`을 수정한 후 `python3 sites/gdmetro/deploy.py --apply` 한 번으로 분양알리미 상세와 GD 전용 홈페이지에 함께 배포하도록 변경했다. 원본 저장이나 GitHub 커밋만으로 AWS가 자동 갱신되지는 않는다. 실행 절차는 [GD 수정 안내](../../sites/gdmetro/README.md)에 있다.

생성 및 실제 배포 대상:

- `gdmetro/index.html` → https://bunyang-alimi.com/gdmetro/
- `outputs/portal/properties/gdmetro.html` → https://bunyang-alimi.com/outputs/portal/properties/gdmetro.html
- `sites/gdmetro/site/index.html` → https://gdmetro.bunyang-alimi.com/

분양알리미 메인 및 다른 현장, 공용 CSS/JS/이미지, DNS, 인증서, 광고그룹은 변경하지 않았다. 기존 GD 내부 상세 경로는 최신 GD 원본과 동일한 내용으로 생성하며 자산 경로는 루트 기준 경로를 사용한다. 광고그룹을 다시 만들거나 기존/새 그룹 실적 비교를 하는 절차는 이번 수정 흐름에 없다.

## 최신본 근거

- GitHub 시작 커밋 `87f4e4ae011d07030923e424dbaa7b057fa1559a`와 Drive `분양알리미_최신` 최신 보관본을 확인.
- 운영 GD 원본은 Drive GD index 및 GitHub `sites/gdmetro/production-source.html`의 기준본과 동일한 SHA-256 `af7046080e199a43d4d8686462f4daa62eded819eac520ab2f473704b178a358`.
- 기존 집 노트북 폴더를 최신본으로 사용하지 않음. 최신 운영 기준으로 GD 생성 경로만 맞췄다.

## 검증

- 메모리 안에서 GD 원본에 시험 문구를 한 번 넣어 두 출력에 함께 나타나는지 확인. 시험 문구는 실제 원본/운영 페이지에 저장하지 않았다.
- 자동 팝업 방지, 생성 파일을 원본으로 잘못 쓰는 경우 차단, 두 사이트 상담폼 보존 및 각 사이트 이름/canonical 유지 검사 통과.
- 대표 상세페이지와 전용 홈페이지는 배포 전 HTML과 비교해 공통 원본 버전 표시용 meta 외 동일.
- AWS 사전검사에서 기존 GD 3개 객체 해시 일치 확인, 배포 후 S3 내용 읽기 검증 성공.
- GD 외 S3 객체 **881개**(메인 878개, GD 보조파일 3개)의 ETag·크기·수정시각 불변 확인.
- 공개 HTTPS URL 3개 모두 생성 파일 SHA-256 일치 및 동일 `gd-source-sha256` 확인.
- 공유 자산 55개 정상 응답. 브라우저 양쪽 페이지에서 깨진 이미지 0개, 상담폼 필수 입력 유지, 사이트 이름 각각 분양알리미/GD메트로타워 확인.
- 실제 상담/개인정보는 제출하지 않음.

## 배포 기록

- 배포 식별자(UTC): `20261122T153224Z-0da2ccce` (한국 날짜 2026-11-23).
- 메인 CloudFront `E32LEWGSB3SNIZ`: `I7GV7UOURARDIICDFK8YRDZ4WS` Completed, GD 경로만 캐시 갱신.
- GD CloudFront `E3M5DDZ45DY2F9`: `I45IYFVX19ZNIPW2Y133QLBO8H` Completed.
- 배포된 메인 GD HTML SHA-256: `0475ad0326aa045b6ca1f1acf731455bfe8d1b81fc20b9f90274c4235b8307bc`.
- 배포된 전용 GD HTML SHA-256: `962e81a5d1de15acb6b5bc0e3d00627e5135473f7da4941f679e5f457d7464d4`.
- AWS 배포 전 복구본/메타데이터는 CloudShell의 `gdmetro-sync-20261123/repo/sites/gdmetro/.deploy-backups/20261122T153224Z-0da2ccce/`에 보관. Drive 패키지에도 배포 전 HTML 3개와 원래 메타데이터를 함께 보관한다.

## 운영비·보안인증서 설명 정정

기존 상세페이지에도 S3/CloudFront 사용료와 메인 도메인용 HTTPS 인증서가 있었다. 새 주소를 만들 때는 그 주소에 맞는 인증서와 별도 배포 경로가 추가되었으며, 주소가 두 개라는 이유만으로 전체 운영비가 두 배가 되지는 않는다.

2026-11-23 AWS 조회에서 GD 인증서는 `AMAZON_ISSUED`, `ISSUED`, `Export: DISABLED`, `RenewalEligibility: ELIGIBLE`이고 전용 CloudFront에서 사용 중이었다. **비내보내기 공개 인증서 비용은 무료**다. 사용 중인 DNS 검증 인증서는 검증 레코드를 유지하면 자동 갱신되므로 수동 갱신을 매번 요구하는 구성이 아니다. 현재 도메인 자체의 갱신은 계속 필요하다.

추가될 수 있는 비용은 저장·요청·전송량 등이며 실제 청구 증가는 계정 무료 범위/요금제/사용량에 따라 결정된다. 이번 동시 반영 작업은 새 서버·도메인·인증서를 추가하지 않았다. 비용 청구 분석은 수행하지 않았다.

근거: [AWS ACM 요금](https://aws.amazon.com/certificate-manager/pricing/), [DNS 검증 및 자동 갱신](https://docs.aws.amazon.com/acm/latest/userguide/domain-ownership-validation.html), [CloudFront 사용량 요금](https://aws.amazon.com/cloudfront/pricing/pay-as-you-go/).
