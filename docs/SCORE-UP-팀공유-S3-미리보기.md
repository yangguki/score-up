# SCORE UP 팀 공유 — S3 미리보기

| 항목 | 내용 |
| --- | --- |
| 문서명 | 개발·테스트 결과물 팀 공유 (S3 정적 웹) |
| 버전 | v0.1 |
| 작성일 | 2026-08-25 |
| 담당 | Infra |
| 상태 | S3 수동 배포 **사용 중**. GitLab `main` → S3는 `.gitlab-ci.yml` 추가. **CI 변수·첫 파이프라인으로 Runner 검증 필요** |
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
| Git 자동 배포 | GitLab CI (시놀로지). AWS에서 빌드하지 않음 | origin이 GitHub가 아님. 아래 4장 |

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

## 4. `main` push → S3 (GitLab CI)

origin: `http://woorii.synology.me:30000/ormak/score-up.git` (**GitLab**). GitHub Actions는 쓰지 않는다.

빌드는 GitLab Runner에서 하고, AWS에는 `dist`만 올린다. Amplify·CodeBuild·EC2는 만들지 않는다.

### 4.1 버킷 이름과 웹 주소는 다르다

팀에 보내는 주소(웹사이트 엔드포인트):

[http://score-up-preview-211125640658-ap-northeast-2-an.s3-website.ap-northeast-2.amazonaws.com/](http://score-up-preview-211125640658-ap-northeast-2-an.s3-website.ap-northeast-2.amazonaws.com/)

**버킷 전체 이름**은 호스트에서 `.s3-website.ap-northeast-2.amazonaws.com`을 뺀 부분이다.

`score-up-preview-211125640658-ap-northeast-2-an`

정책 ARN:

`arn:aws:s3:::score-up-preview-211125640658-ap-northeast-2-an/*`

CI·`aws s3 sync`에도 이 이름을 쓴다. URL 전체를 버킷 이름으로 넣으면 실패한다.

### 4.2 파이프라인

파일: `.gitlab-ci.yml`. `main`에 push하면 `pnpm export:web` 후

`aws s3 sync apps/mobile/dist s3://score-up-preview-211125640658-ap-northeast-2-an --delete`

문서만 고쳐도 전체 빌드된다. 미리보기 단계에서는 허용.

### 4.3 GitLab에 넣을 변수 (한 번)

프로젝트 → **Settings → CI/CD → Variables**. 키는 저장소에 넣지 않는다.

| 키 | Protected | Masked | 값 |
| --- | --- | --- | --- |
| `AWS_ACCESS_KEY_ID` | 가능하면 켜기 | 켜기 | 배포용 IAM 액세스 키 |
| `AWS_SECRET_ACCESS_KEY` | 가능하면 켜기 | 켜기 | 비밀 액세스 키 |

콘솔용 `test01` 키를 넣지 말고, 이 버킷 쓰기만 있는 사용자를 권장한다. 당장 새 사용자를 못 만들면 기존 키로 첫 파이프라인만 검증해도 된다.

배포 사용자 최소 권한:

- `s3:ListBucket` → `arn:aws:s3:::score-up-preview-211125640658-ap-northeast-2-an`
- `s3:GetObject`, `s3:PutObject`, `s3:DeleteObject` → `arn:aws:s3:::score-up-preview-211125640658-ap-northeast-2-an/*`

`main`이 Protected 브랜치인데 변수도 Protected면, Protected Runner가 있어야 변수가 주입된다. 파이프라인 로그에 키가 비어 있으면 Protected 설정을 맞춘다.

### 4.4 Runner 검증

Runner는 있다고 했으나 동작은 **첫 파이프라인**으로 확인한다.

1. GitLab에 위 두 변수를 저장한다
2. `.gitlab-ci.yml`이 들어 있는 커밋을 `main`에 push한다
3. GitLab → **CI/CD → Pipelines**에서 `deploy_s3` 성공 여부

| 증상 | 원인 |
| --- | --- |
| pending / stuck | Runner가 꺼졌거나 태그가 안 맞음. 이 잡은 태그 없음(아무 Runner) |
| `image` pull 실패 | Docker Hub를 NAS가 못 받음. Runner가 Shell이면 호스트에 Node 20·pnpm·aws CLI 설치 |
| `test -n "$AWS_ACCESS_KEY_ID"` 실패 | 변수 없음 또는 Protected 불일치 |
| AccessDenied (sync) | IAM에 버킷 쓰기 없음. 정책 ARN에 URL을 넣은 경우 |
| Expo/Node OOM, killed | NAS 메모리 부족. 팀 PC를 GitLab Runner로 등록 |
| 성공했는데 예전 화면 | 브라우저 캐시. 시크릿 창으로 웹사이트 엔드포인트 확인 |

IAM은 콘솔 계정 키를 CI에 넣지 않는 것이 맞다. 해당 버킷 객체 올리기/삭제/목록만 있는 배포용 사용자를 따로 둔다.

| 어디서 빌드하나 | AWS 비용 |
| --- | --- |
| 시놀로지 GitLab Runner | S3 업로드만. 사실상 0원 |
| CodeBuild / Amplify에 빌드 | push마다 분당 과금. 쓰지 않음 |

Expo 웹 export는 메모리·시간이 있다. NAS가 너무 느리면 팀 PC를 Runner로 쓴다.

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
