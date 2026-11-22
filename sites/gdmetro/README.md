# GD메트로타워: 한 번 수정하고 두 사이트에 함께 배포

2026-11-23부터 **`sites/gdmetro/source.html` 한 파일만 GD 내용의 수정 원본으로 사용한다.**

- 분양알리미 상세: https://bunyang-alimi.com/gdmetro/
- 전용 홈페이지: https://gdmetro.bunyang-alimi.com/
- 기존 내부 상세 URL: https://bunyang-alimi.com/outputs/portal/properties/gdmetro.html

원본을 저장하는 것만으로 운영 서버가 바뀌지는 않는다. 아래의 **한 번의 배포 명령**이 같은 원본으로 세 HTML을 만들고, 두 사이트에 함께 업로드한다. 별도 페이지를 다시 편집할 필요가 없다. 분양알리미 메인과 다른 현장은 배포 대상에서 제외되어 있다.

2026-11-23 실제 운영 배포와 공개 URL 검증 완료. 결과는 `../../docs/deployments/2026-11-23-gd-shared-source.md`와 이 폴더의 JSON 기록을 참고한다. 두 사이트의 캐시 갱신 완료 전에는 잠시 이전 화면이 남을 수 있으므로 두 주소 검증까지 끝난 뒤 완료로 판단한다.

## 앞으로 수정할 때

1. GitHub 최신 main과 Google Drive `분양알리미_최신`의 가장 최신 GD 동시반영 기록을 확인한다. 집 노트북의 기존 폴더를 최신으로 가정하지 않는다.
2. `sites/gdmetro/source.html`에서 GD 문구·사진 경로·분양 정보 등을 한 번 수정한다. 공용 CSS/JS 수정은 다른 현장에 영향을 주므로 별도 범위로 다룬다.
3. Node.js와 Python boto3가 있고 AWS 계정 801178768218에 로그인된 환경(예: AWS CloudShell)에서 저장소 루트 기준으로 실행한다.

```sh
# 쓰기 없이 대상·원본·운영 해시 검사
python3 sites/gdmetro/deploy.py
# 테스트 + 두 사이트 생성 + GD HTML 3개만 일괄 배포
python3 sites/gdmetro/deploy.py --apply
# 배포 출력의 CloudFront 캐시 갱신 완료 후 공개 URL 검사
node sites/gdmetro/verify.mjs
```

4. 검증된 원본, 생성 파일, `build-report.json`, `deployed-hashes.json`, `deployment-report.json`, `verification.json`과 변경 기록을 GitHub 및 Drive에 함께 저장한다.

## 직접 수정하지 않는 생성 파일

- `gdmetro/index.html`
- `outputs/portal/properties/gdmetro.html`
- `sites/gdmetro/site/index.html`

세 파일의 `gd-source-sha256` 값이 같으면 같은 원본으로 생성한 버전이다. `production-source.html`은 2026-11-22 이전의 이력 보존용 기준본이며 더 이상 빌드 입력이 아니다. `site/favicon.svg`, `robots.txt`, `sitemap.xml`은 전용 사이트의 고정 보조파일로 이번 내용 동기화 배포에서는 변경하지 않는다.

## 유지하는 차이

분양알리미 쪽 사이트 이름·canonical·브랜드는 분양알리미 구조를 유지한다. 전용 홈페이지의 사이트 이름은 **GD메트로타워**, 주소는 전용 주소를 유지한다. 동일한 상담폼, 현장 정보, 전화번호와 이미지를 사용한다. 전용 홈페이지의 자산 URL 변환은 빌드에서 자동 처리한다. 단순 iframe이나 다른 도메인으로의 리디렉션을 사용하지 않는다.

## 다른 현장 보호 및 복구

배포 코드는 지정된 두 버킷의 GD HTML 세 객체만 허용한다. 운영 파일이 마지막 배포 기록과 달라지면 중단하므로 최신 작업을 덮어쓰지 않는다. 업로드 전 원본/메타데이터는 `.deploy-backups/`에 보관하며 업로드 실패 시 시도한 객체를 되돌린다. 캐시 갱신 오류는 재실행해 이어갈 수 있다. 배포 전후 나머지 S3 객체의 ETag·크기·수정시각도 비교한다. 전체 사이트 `sync --delete`나 공용 CloudFront 설정 변경은 하지 않는다.

## 광고 그룹에 관한 사용자 결정

이 작업은 홈페이지 내용의 동시 반영이다. 내용 수정 때문에 기존/새 광고 그룹을 재생성하거나 두 그룹의 실적 비교를 수행하지 않는다. 현장 이름·주소·키워드·입찰가 등 광고 설정은 별도의 명시적 요청이 있을 때만 다룬다. 2026-11-22 광고 설정 기록은 당시의 이력이며 현재 승인/운영 상태는 광고 화면에서 확인한다.

## 비용과 HTTPS

기존 상세페이지도 메인 도메인의 HTTPS 인증서와 S3/CloudFront를 사용했다. GD 주소를 추가하면서 별도의 CloudFront·S3와 호스트명에 맞는 인증서가 마련되었다. 전용 주소를 쓴다는 이유만으로 서버 비용이 두 배가 되는 것은 아니다.

2026-11-23 AWS 조회: GD 인증서는 AMAZON_ISSUED, ISSUED, Export DISABLED, RenewalEligibility ELIGIBLE이며 전용 CloudFront에 연결되어 있다. 비내보내기 ACM 공개 인증서는 무료이고 사용 중인 DNS 검증 인증서는 인증용 DNS 레코드를 유지하면 자동 갱신된다. 고객이 매번 인증서를 구매하거나 수동 갱신할 필요는 없다. 도메인 전체의 기존 갱신은 계속 필요하다.

추가 과금 가능 항목은 S3 저장·요청, CloudFront 요청·전송·무료 범위 초과 캐시 갱신 등 사용량이다. 사진과 공통 자산은 메인 사이트 것을 공유하므로 전용 주소를 위해 전체 자산을 복제하지 않는다. 실제 월 요금 증감은 사용량·계정 할인/무료 범위·요금제에 따라 달라지며 이번 기록은 청구액 분석이 아니다. 이번 동시반영 변경에서는 서버·배포·인증서를 추가하지 않는다.

- https://aws.amazon.com/certificate-manager/pricing/
- https://docs.aws.amazon.com/acm/latest/userguide/domain-ownership-validation.html
- https://aws.amazon.com/cloudfront/pricing/pay-as-you-go/
