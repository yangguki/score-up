# SCORE UP 팀 공유 — S3 미리보기

| 항목 | 내용 |
| --- | --- |
| 문서명 | 개발·테스트 결과물 팀 공유 (S3 정적 웹) |
| 버전 | v0.1 |
| 작성일 | 2026-08-25 |
| 담당 | Infra |
| 상태 | S3 수동 배포 **사용 중**. `main` push 자동 반영은 **검토만. 아직 구현하지 않음** |
| 에이전트 | `.cursor/skills/infra-agent/SKILL.md` |

지금은 Phase 3 mock 프론트다. AWS에는 API·DB·서버가 없고, `pnpm export:web`으로 만든 **정적 파일만** 올린다. 목적은 팀 UX 검수이며 프로덕션이 아니다.

---

## 1. 정한 것

| 결정 | 선택 | 이유 |
| --- | --- | --- |
| 비용 | 월정액 컴퓨트 없음 | 개발·테스트 공유. EC2/ALB/NAT/Amplify Git 빌드는 바로 과금됨 |
| 호스팅 | **S3 정적 웹사이트** (서울 `ap-northeast-2`) | 파일 수 MB + 조회. 팀 몇 명이면 월 0원에 가까움 |
| HTTPS | 기본 없음. 필요할 때만 CloudFront | S3 웹사이트 엔드포인트는 HTTP. 팀 검수에는 충분 |
| 도메인 | 안 삼. Route 53 호스팅 존 안 만듦 | 존만 있어도 월 $0.50 |
| 산출물 | `apps/mobile/dist` | Expo `web.output: static` |
| Git 자동 배포 | **보류** | origin이 GitHub가 아님. 아래 6장 |

PC가 켜져 있는 동안만 보여 주면 `cloudflared tunnel --url http://localhost:포트`가 $0다. S3는 **노트북이 꺼져 있어도 URL이 필요할 때** 쓴다.

### 쓰지 말 것

| 리소스 | 대략 |
| --- | --- |
| NAT Gateway | 월 ~$32 + 데이터 |
| ALB | 월 ~$16 |
| EC2에 `pnpm web` 상시 | 시간당 |
| Route 53 호스팅 존 | 존만 있어도 월 $0.50 |
| Amplify ↔ Git 자동 빌드 | 빌드 분당 과금 |
| RDS / Cognito / API Gateway | Phase 6 전 금지 |

`amplify.yml`은 저장소에 두지 않는다.

---

## 2. 로컬에서 정적 파일 만들기

저장소 루트:

```powershell
pnpm export:web
```

성공하면 `apps/mobile/dist/index.html`이 있어야 한다. 이 **폴더 안 내용**만 S3 루트에 올린다. `dist` 폴더 자체를 올리면 흰 화면이 난다.

경로 예:

`C:\Users\<user>\ormakgil\omg-proj\score-up\workspace\score-up\apps\mobile\dist`

---

## 3. S3 버킷 (콘솔)

리전은 오른쪽 위 **아시아 태평양(서울)** 인지 확인한다. **S3만** 만든다. EC2·Amplify·CloudFront는 만들지 않는다.

### 3.1 버킷 만들기

1. S3 → **버킷 만들기**
2. **버킷 네임스페이스:** **계정 리전 네임스페이스(권장)**  
   - 비용 차이 없음. 정적 웹 호스팅 가능  
   - 글로벌은 이름이 전 세계에서 유일해야 해서 생성이 자주 실패함  
   - 계정 리전을 고르면 이름 뒤에 계정번호·리전 접미사가 붙는다. 예: `score-up-preview-123456789012-ap-northeast-2-an`  
   - 접두어는 `score-up-preview`처럼 짧게. 전체 이름은 63자 제한
3. AWS 리전: `ap-northeast-2`
4. **모든 퍼블릭 액세스 차단** 체크 **해제** + 경고 확인 (읽기만 공개. 쓰기 공개 아님)
5. **버킷 만들기**

이후 버킷 정책·CLI에는 접두어가 아니라 **목록에 보이는 전체 이름**을 쓴다.

### 3.2 정적 웹 사이트 호스팅

1. 버킷 → **속성** → **정적 웹 사이트 호스팅** → 편집 → **사용**
2. 인덱스 문서: `index.html`
3. 오류 문서: `index.html` (보드 URL 새로고침용)
4. 저장 후 **버킷 웹 사이트 엔드포인트**를 복사한다.

팀에 보낼 주소:

`http://<버킷전체이름>.s3-website.ap-northeast-2.amazonaws.com`

`s3.ap-northeast-2.amazonaws.com` 객체 URL이 아니다.

### 3.3 버킷 정책 (공개 읽기)

**권한** → **버킷 정책** → `BUCKET_NAME`을 전체 이름으로 바꿔 저장한다.

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

### 3.4 콘솔에서 `access-analyzer:ValidatePolicy` 오류

S3 콘솔이 저장 전에 Access Analyzer로 정책을 검사한다. 웹호스팅 권한 부족이 아니다.

관리자에게 아래를 IAM 사용자에 붙인다.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowS3PolicyValidateInConsole",
      "Effect": "Allow",
      "Action": "access-analyzer:ValidatePolicy",
      "Resource": "*"
    }
  ]
}
```

그래도 안 되면 `s3:PutBucketPolicy`도 없는 것이다. Access Analyzer만 없고 `PutBucketPolicy`는 있으면 CLI로 넣을 수 있다.

```powershell
$bucket = "버킷-전체-이름"
$policy = @"
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$bucket/*"
    }
  ]
}
"@
aws s3api put-bucket-policy --bucket $bucket --policy $policy
```

### 3.5 파일 올리기

버킷 → **객체** → **업로드**. `dist` **안**의 `index.html`, `_expo` 등을 루트에 올린다. 객체 목록 맨 위에 `index.html`이 보여야 한다.

또는:

```powershell
aws s3 sync apps/mobile/dist s3://버킷-전체-이름 --delete
```

### 3.6 검수

- [ ] 웹사이트 엔드포인트로 홈이 열린다
- [ ] 진행 중 경기 → 농구 보드가 열린다
- [ ] 보드 URL에서 새로고침이 된다
- [ ] AWS에 EC2/ALB/NAT/Amplify 앱이 없다

mock은 브라우저 메모리다. 새로고침하면 시드로 돌아가고, 두 사람의 스코어는 공유되지 않는다. URL을 아는 사람은 화면을 볼 수 있으니 팀 안에서만 공유한다.

화면을 고친 뒤: `pnpm export:web` → 같은 버킷에 `dist`를 다시 올린다.

---

## 4. `main` push → S3 자동 반영 (검토)

하고 싶은 것: `main`에 push하면 S3 미리보기가 갱신된다.

### 4.1 왜 GitHub Actions가 아닌가

이 저장소 origin은 GitHub가 아니라 시놀로지 Git이다.

`http://woorii.synology.me:30000/ormak/score-up.git`

포트 30000은 시놀로지의 **GitLab 또는 Gitea**일 가능성이 크다. 여기로 push하면 GitHub Actions는 실행되지 않는다.

### 4.2 권장 구조 (아직 구현하지 않음)

빌드는 Git 서버(또는 그 Runner)에서 하고, AWS에는 결과물만 올린다.

```text
main push
  → GitLab/Gitea Runner가 pnpm export:web
  → aws s3 sync apps/mobile/dist s3://버킷 --delete
```

AWS에 **만들지 말 것:** Amplify, CodePipeline, CodeBuild, EC2. 빌드 분·월정액이 붙는다.

IAM은 콘솔 계정 키를 CI에 넣지 않는다. **해당 버킷 객체 올리기/삭제/목록만** 있는 배포용 사용자를 따로 둔다.

| 어디서 빌드하나 | AWS 비용 |
| --- | --- |
| 시놀로지 또는 팀 PC에 Runner | S3 업로드만. 사실상 0원 |
| CodeBuild / Amplify에 빌드 | push마다 분당 과금. 지금 원칙과 안 맞음 |

Expo 웹 export는 메모리·시간이 있다. NAS Runner가 너무 느리면 팀 PC를 Runner로 쓴다.

파이프라인 조건:

- `main`만 배포
- `pnpm install --frozen-lockfile` → `pnpm export:web` → `dist`만 sync
- CI 변수: 버킷 전체 이름, 배포용 AWS 키, 리전 `ap-northeast-2`
- 문서만 고쳐도 전체 빌드됨. 미리보기 단계에서는 허용

### 4.3 구현 전에 확인할 것

1. `woorii.synology.me:30000`이 GitLab인지 Gitea인지
2. Runner가 이미 있는지
3. S3 버킷 전체 이름
4. 배포용 IAM을 만들 권한이 있는지 (`test01` 콘솔 계정이 못 만들 수 있음)

확인되면 GitLab은 `.gitlab-ci.yml`, Gitea는 Actions 워크플로를 추가한다. YAML만 넣고 Runner가 없으면 배포는 안 된다.

---

## 5. 실패 시

| 증상 | 원인 |
| --- | --- |
| 버킷 이름 이미 사용 중 | 글로벌 네임스페이스를 고름. 계정 리전 네임스페이스로 다시 |
| `access-analyzer:ValidatePolicy` | 콘솔 검사 권한. 3.4절 |
| AccessDenied (브라우저) | 퍼블릭 차단이 켜져 있거나 정책 ARN이 접두어만 넣음 |
| 홈만 되고 보드 새로고침 실패 | 오류 문서가 `index.html`이 아님 |
| 흰 화면 | `dist` 폴더를 한 단계 더 올림 |
| 두 사람의 점수가 다름 | mock은 브라우저 메모리. 정상 |

---

## 6. 나중에 (Phase 6+, 지금은 문서만)

계정·이벤트 API가 생겨도 웹은 `expo export --platform web` 정적 파일이다. Metro/`pnpm web`을 EC2에 올리지 않는다.
