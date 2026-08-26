# SCORE UP 팀 공유 — S3 미리보기

| 항목 | 내용 |
| --- | --- |
| 문서명 | 개발·테스트 결과물 팀 공유 (S3 정적 웹) |
| 버전 | v0.1 |
| 작성일 | 2026-08-25 |
| 담당 | Infra |
| 상태 | **적용됨.** S3 미리보기 + GitHub Actions `Deploy S3 preview` 초록. remote `origin-hub` |
| 에이전트 | `.cursor/skills/infra-agent/SKILL.md` |

지금은 구현 Phase 6 mock 프론트다. AWS에는 API·DB·서버가 없고, `pnpm export:web`으로 만든 **정적 파일만** 올린다. 목적은 팀 UX 검수이며 프로덕션이 아니다.

---

## 1. 정한 것

| 결정 | 선택 | 이유 |
| --- | --- | --- |
| 비용 | 월정액 컴퓨트 없음 | 개발·테스트 공유. EC2/ALB/NAT/Amplify Git 빌드는 바로 과금됨 |
| 호스팅 | **S3 정적 웹사이트** (서울 `ap-northeast-2`) | 파일 수 MB + 조회. 팀 몇 명이면 월 0원에 가까움 |
| HTTPS | 기본 없음. 필요할 때만 CloudFront | S3 웹사이트 엔드포인트는 HTTP. 팀 검수에는 충분 |
| 도메인 | 안 삼. Route 53 호스팅 존 안 만듦 | 존만 있어도 월 $0.50 |
| 산출물 | `apps/mobile/dist` | Expo `web.output: static` |
| Git 자동 배포 | GitHub Actions (`ubuntu-latest`). AWS에서 빌드하지 않음 | GitLab에 Runner가 없음. 아래 4장 |

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

mock은 이 브라우저에 persist된다. 새로고침해도 기록이 남고, 설정에서 시드로 되돌리기 전까지 유지된다. 두 사람의 스코어는 공유되지 않는다. URL을 아는 사람은 화면을 볼 수 있으니 팀 안에서만 공유한다.

화면을 고친 뒤: `pnpm export:web` → 같은 버킷에 `dist`를 다시 올린다. 워크플로가 있으면 `origin-hub`의 `main` push로도 갱신된다.

---

## 4. `main` push → S3 (GitHub Actions)

S3 배포는 **GitHub Actions**다. 시놀로지 GitLab Runner는 쓰지 않는다. Amplify·CodeBuild·EC2는 만들지 않는다.

| remote | URL | 역할 |
| --- | --- | --- |
| `origin` | `http://woorii.synology.me:30000/ormak/score-up.git` | 기존 GitLab. 코드 백업용으로 남겨도 됨 |
| `origin-hub` | `https://github.com/yangguki/score-up.git` | **배포가 도는 곳.** `main` push 시 Actions |

로컬에 `origin-hub`가 없으면:

```powershell
git remote add origin-hub https://github.com/yangguki/score-up.git
git remote -v
```

### 4.1 버킷 이름과 웹 주소는 다르다

팀에 보내는 주소:

[http://score-up-preview-211125640658-ap-northeast-2-an.s3-website.ap-northeast-2.amazonaws.com/](http://score-up-preview-211125640658-ap-northeast-2-an.s3-website.ap-northeast-2.amazonaws.com/)

**버킷 전체 이름:** `score-up-preview-211125640658-ap-northeast-2-an`

정책 ARN: `arn:aws:s3:::score-up-preview-211125640658-ap-northeast-2-an/*`

URL 전체를 버킷 이름으로 넣지 않는다.

### 4.2 워크플로

파일: `.github/workflows/deploy-s3.yml`

GitHub의 `main`에 push하면 GitHub-hosted runner(`ubuntu-latest`)가 `pnpm export:web` 후

`aws s3 sync apps/mobile/dist s3://score-up-preview-211125640658-ap-northeast-2-an --delete`

공개 저장소면 Actions 분은 보통 무료 범위다. AWS는 S3 업로드만.

### 4.3 GitHub Secrets (한 번)

키는 저장소에 넣지 않는다. [github.com/yangguki/score-up](https://github.com/yangguki/score-up) → **Settings → Secrets and variables → Actions → New repository secret**

| Name | Value |
| --- | --- |
| `AWS_ACCESS_KEY_ID` | 배포용 IAM 액세스 키 |
| `AWS_SECRET_ACCESS_KEY` | 비밀 액세스 키 |

콘솔용 `test01` 키보다 이 버킷 쓰기만 있는 사용자를 권장한다.

- `s3:ListBucket` → `arn:aws:s3:::score-up-preview-211125640658-ap-northeast-2-an`
- `s3:GetObject`, `s3:PutObject`, `s3:DeleteObject` → `arn:aws:s3:::score-up-preview-211125640658-ap-northeast-2-an/*`

Settings가 안 보이면 저장소 Owner 권한이 없다.

### 4.4 연결·운영 (적용됨)

2026-08-26 `origin-hub`에 `.github/workflows/deploy-s3.yml`을 push한 뒤 Actions `Deploy S3 preview`가 **초록**으로 확인됐다. Secrets는 GitHub Actions에 등록된 상태다.

일상 배포:

```powershell
git push origin main
git push origin-hub main
```

GitLab만 push하면 S3는 안 바뀐다. 워크플로가 Actions 탭에 안 보이면 파일이 GitHub `main`에 없는 것이다.

시크릿 창으로 웹사이트 엔드포인트를 연다.

| 증상 | 원인 |
| --- | --- |
| Actions가 안 뜸 | GitHub에 워크플로 파일이 없음. `origin-hub`에 push 안 함 |
| `Credentials could not be loaded` | Secrets 이름 오타 또는 미등록 |
| AccessDenied (sync) | IAM에 버킷 쓰기 없음 |
| 성공인데 예전 화면 | 브라우저 캐시 |
| GitLab 파이프라인이 stuck | 배포는 Actions로 옮김. GitLab CI는 잡을 만들지 않음 |

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
