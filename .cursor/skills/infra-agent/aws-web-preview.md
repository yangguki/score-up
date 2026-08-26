# 팀 공유 웹 미리보기 (최소 비용)

팀·콘솔 절차의 원본은 `docs/SCORE-UP-팀공유-S3-미리보기.md`다. 이 파일은 Infra agent용 요약이다.

**적용됨:** S3 정적 웹 + GitHub Actions(`origin-hub` `main`). `Deploy S3 preview` 초록 확인.

## 비용 한눈에

| 방법 | 언제 | 비용 |
| --- | --- | --- |
| `cloudflared tunnel` | PC가 켜져 있는 동안만 공유 | **$0** |
| **S3 + GitHub Actions (기본)** | 팀 URL, `main` push로 갱신 | S3 조회·업로드만. Actions는 공개 repo면 보통 무료 범위 |
| S3 + CloudFront | HTTPS가 꼭 필요할 때만 | 배포 월정액 없음 |
| Amplify / EC2 / GitLab Runner / CodeBuild | — | **쓰지 않음** |

## 적용된 연결

| 항목 | 값 |
| --- | --- |
| 버킷 | `score-up-preview-211125640658-ap-northeast-2-an` |
| 미리보기 | `http://score-up-preview-211125640658-ap-northeast-2-an.s3-website.ap-northeast-2.amazonaws.com/` |
| 워크플로 | `.github/workflows/deploy-s3.yml` |
| GitHub | `https://github.com/yangguki/score-up.git` (`origin-hub`) |
| GitLab | `http://woorii.synology.me:30000/ormak/score-up.git` (`origin`, 백업) |
| Secrets | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` (Actions) |

S3를 바꾸려면 `git push origin-hub main`. GitLab만 push하면 미리보기는 그대로다.

## 로컬 정적 파일

```powershell
pnpm export:web
```

`apps/mobile/dist/index.html`이 있어야 한다. 수동 업로드할 때는 `dist` **안**을 버킷 루트에 올린다.

## 만들지 말 것

NAT, ALB, EC2, Route 53 존, Amplify Git 빌드, GitLab Runner, RDS/Cognito/API Gateway (Phase 6 전).

## 실패 시

| 증상 | 원인 |
| --- | --- |
| Actions에 워크플로가 없음 | `.github/workflows/deploy-s3.yml`이 GitHub `main`에 없음 |
| Credentials could not be loaded | GitHub Secrets 미등록 |
| AccessDenied (sync) | IAM에 해당 버킷 쓰기 없음 |
| AccessDenied (브라우저) | 퍼블릭 차단 또는 정책 ARN이 접두어만 넣음 |
| 웹사이트 엔드포인트를 버킷 이름으로 씀 | `s3 sync` 실패. 호스트에서 `.s3-website...`를 뺀다 |
| GitLab job stuck | 배포는 Actions로 옮김. GitLab CI는 `when: never` |
