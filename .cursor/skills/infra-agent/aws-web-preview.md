# 팀 공유 웹 미리보기 (최소 비용)

개발·테스트 중 팀원에게 화면을 보여 주는 용도다. API·서버·도메인은 없다.

## 비용 한눈에

| 방법 | 언제 | 비용 |
| --- | --- | --- |
| `cloudflared tunnel` | PC가 켜져 있는 동안만 공유 | **$0** |
| **S3 정적 웹사이트 (기본)** | PC가 꺼져 있어도 URL이 필요할 때 | 파일 수 MB + 조회. 팀 몇 명이면 **월 0원에 가까움** |
| S3 + CloudFront | HTTPS가 꼭 필요할 때만 | 배포 월정액 없음. 트래픽만 |
| Amplify Git 빌드 / EC2 / ALB / NAT / Route 53 존 | — | **쓰지 않음.** 월정액·빌드 분이 붙음 |

## 0. 전제

- AWS 계정 + 콘솔 (리전 **서울**)
- 루트에서 `pnpm install` 가능

버킷 이름은 추측하기 어렵게 한다. 예: `score-up-preview-<랜덤>`.

## 1. 정적 파일

```powershell
pnpm export:web
```

`apps/mobile/dist/index.html`이 있어야 한다.

## 2. 기본 — S3 정적 웹사이트

1. S3 → 버킷 만들기 → 리전 `ap-northeast-2`
2. **모든 퍼블릭 액세스 차단**을 해제하고 경고를 확인한다. (팀 미리보기라 읽기 공개가 필요하다. 쓰기 공개는 하지 않는다.)
3. 속성 → **정적 웹 사이트 호스팅** 사용
   - 인덱스: `index.html`
   - 오류 문서: `index.html` (SPA 새로고침용)
4. 권한 → 버킷 정책 (이름만 교체):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::BUCKET_NAME/*"
    }
  ]
}
```

5. `dist` **안**을 버킷 루트에 올린다. 콘솔 업로드 또는:

```powershell
aws s3 sync apps/mobile/dist s3://BUCKET_NAME --delete
```

6. 속성 → 정적 웹 사이트 호스팅에 나온 엔드포인트를 팀에 공유한다.

`http://BUCKET_NAME.s3-website.ap-northeast-2.amazonaws.com`

HTTP다. 팀 검수에는 이것으로 충분하다. 월정액이 없다.

## 3. HTTPS가 필요할 때만 CloudFront

폰에서 HTTPS만 허용하거나 보안 경고를 없앨 때만 추가한다.

1. CloudFront 배포 1개. origin은 위 S3 **웹사이트 엔드포인트**(REST 엔드포인트가 아님).
2. 기본 객체 `index.html`
3. 커스텀 오류: 403·404 → `/index.html`, 응답 코드 200
4. 팀에 `*.cloudfront.net`만 공유한다.

배포 자체 요금은 없다. 전송량만 붙고, 팀 몇 명이 클릭하는 수준이면 무시해도 된다.

OAC + 비공개 버킷은 설정이 길고, 지금은 비용 이점이 거의 없다. 미리보기 단계에서는 공개 읽기 S3를 유지한다.

## 4. 만들지 말 것 (바로 돈 나감)

| 리소스 | 대략 |
| --- | --- |
| NAT Gateway | 월 ~$32 + 데이터 |
| ALB | 월 ~$16 |
| EC2 상시 | 프리 티어가 아니면 시간당 |
| Route 53 호스팅 존 | 존만 있어도 월 $0.50 |
| Elastic IP 미연결 | 월 ~$3.6 |
| Amplify ↔ Git 자동 빌드 | 빌드 분당 과금. push마다 증가 |
| RDS / Cognito / API Gateway | Phase 6 전 금지 |

`amplify.yml`은 이 저장소에 두지 않는다. Git 연결 Amplify를 유도하기 때문이다.

## 5. 운영

- 새 화면을 공유할 때만 `pnpm export:web` 후 `aws s3 sync ... --delete`
- URL을 아는 사람은 mock UI를 볼 수 있다. 팀에만 링크를 보낸다
- 검수 기간이 끝나면 버킷 객체를 비우거나 버킷을 삭제한다. 빈 버킷도 이름은 남지만 요금은 사실상 0이다

## 6. 실패 시

| 증상 | 원인 |
| --- | --- |
| `access-analyzer:ValidatePolicy` 권한 없음 | S3 콘솔이 정책을 저장하기 전에 검사함. 웹호스팅 권한이 부족한 게 아님. 관리자에게 해당 액션을 받거나 CLI로 `put-bucket-policy` |
| AccessDenied (페이지) | 퍼블릭 차단이 켜져 있거나 버킷 정책 ARN이 다름 |
| 홈만 되고 보드 새로고침 실패 | 오류 문서가 `index.html`이 아님 |
| 흰 화면 | `dist` 상위 폴더를 올림. 키 `index.html`이 루트에 있어야 함 |
| 두 사람의 점수가 다름 | mock은 브라우저 메모리. 정상 |

## 7. 나중에 (Phase 6+, 지금은 문서만)

API가 생겨도 웹은 `expo export` 정적 파일이다. 그때도 EC2에 Metro를 올리지 않는다.
