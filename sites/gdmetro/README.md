# GD메트로타워 전용 사이트

운영 주소: https://gdmetro.bunyang-alimi.com/

분양알리미의 다른 현장과 분리된 S3/CloudFront 배포본이다. 신규 도메인 구매 없이 기존 도메인의 하위 주소를 사용한다. GitHub와 Google Drive `분양알리미_최신`을 기준으로 이어서 작업하고, 집 노트북의 기존 폴더를 최신본으로 사용하지 않는다.

## 파일

- `site/`: 실제 배포한 HTML, favicon, robots.txt, sitemap.xml 4개 파일.
- `production-source.html`: 변경 전 운영 GD 페이지 원본. 당시 Drive 최신 GD index와 대조한 기준본.
- `build.mjs`: 기준본에서 전용 이름·주소·favicon을 생성한다. Node.js 기본 모듈만 사용한다.
- `build-report.json`: 기준본/배포본 SHA-256, 상담폼 보존 및 팝업 제거 검사 결과.
- `verify.mjs`, `verification.json`: 공개 HTTPS 파일 4개와 공유 자산 55개 확인, 기존 GD 페이지 불변 검증.
- `deploy.py`, `deployment-state.json`: 전용 AWS 리소스 배포 스크립트와 실제 리소스 식별자. AWS 자격증명은 포함하지 않는다.
- `deployment-record.md`: DNS, 배포 및 네이버 광고의 완료/대기 상태.

## 재생성과 확인

이 폴더에서 다음을 실행한다. 두 Node 스크립트는 다른 현재 디렉터리에서도 실행할 수 있다.

```sh
node build.mjs
node verify.mjs
```

`build.mjs`는 `site/index.html`을 덮어쓴다. 변경을 지속하려면 기준본 또는 변환 코드를 수정한 후 빌드한다. 사진·공통 CSS/JS 등은 기존 `https://bunyang-alimi.com/outputs/...`를 공유한다. 이 보관본은 전용 사이트 소스이며 분양알리미 전체 자산 백업이 아니다. 공유 자산 변경은 별도 검토가 필요하다.

## 재배포

승인된 AWS 계정 801178768218의 자격증명과 Python boto3가 있는 환경에서 `python deploy.py`를 실행한다. 기존 `deployment-state.json`을 유지해야 하며 전용 배포만 대상으로 한다. 업로드 후 전용 CloudFront 캐시를 갱신하고 `node verify.mjs`로 공개 응답을 확인한다. 스크립트는 Cloudflare DNS를 수정하지 않는다. 현재 정상 DNS를 그대로 유지한다.

## 광고 전환 상태

새 비즈채널 이름: `GD메트로타워_전용`, 광고에 노출할 사이트 이름: **GD메트로타워**.

신규 광고그룹 `gdmetro_전용주소`에 전용 주소로 광고/키워드/확장소재 등록 완료. 네이버 비즈채널과 소재 검토가 끝나지 않아 새 그룹은 OFF, 기존 `gdmetro`는 ON이다. 이 상태는 공개 광고의 전환 완료를 뜻하지 않는다. 심사 통과 확인 후 기존 GD 그룹만 OFF하고 새 그룹만 ON하여 중복 집행을 피한다. 다른 현장 그룹이나 공용 `분양알리미` 채널 이름은 변경하지 않는다.
