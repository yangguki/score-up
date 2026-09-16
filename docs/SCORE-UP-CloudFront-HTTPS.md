# SCORE UP — CloudFront HTTPS 설정

| 항목 | 내용 |
| --- | --- |
| 문서명 | CloudFront HTTPS 설정 및 Android PWA 경고 해결 |
| 버전 | v0.1 |
| 작성일 | 2026-09-16 |
| 담당 | Infra |
| 상태 | 참고용 (CloudFront 배포는 비용 발생) |

---

## 1. 문제

S3 정적 웹 호스팅은 **HTTP**만 제공한다. Android에서 PWA 설치 시 다음 경고가 발생한다:

| 증상 | 원인 |
| --- | --- |
| "안전하지 않은 앱이 차단됨" | HTTP에서 PWA 설치 시도 |
| "오래된 개인정보 보호 기능" 경고 | HTTPS 헤더(HSTS, Referrer-Policy 등) 미설정 |
| 서비스 워커 미등록 | `isSecureContext === false` |

---

## 2. 해결 방안

### 2.1 CloudFront 배포 (권장)

S3 버킷 앞에 CloudFront를 두면 HTTPS를 사용할 수 있다.

**비용 주의**: CloudFront는 데이터 전송량에 따라 비용이 발생한다. 팀 UX 검수 목적이면 cloudflared 터널이 무료다.

### 2.2 cloudflared 터널 (무료, 임시)

```bash
cloudflared tunnel --url http://localhost:3000
```

로컬 개발 또는 일회성 테스트에 적합하다.

---

## 3. CloudFront 콘솔 설정 (비용 발생)

> **범위 밖**: 이 문서는 설정 방법만 안내한다. 실제 CloudFront 배포 생성은 팀 결정 후 진행한다.

### 3.1 배포 생성

1. CloudFront → **배포 생성**
2. 원본 도메인: `score-up-preview-xxx.s3-website.ap-northeast-2.amazonaws.com`
   - **중요**: S3 REST 엔드포인트가 아닌 **웹사이트 엔드포인트** 사용
   - "Use website endpoint" 선택
3. 프로토콜: HTTPS only (또는 Redirect HTTP to HTTPS)
4. 기본 루트 객체: `index.html`
5. 가격 등급: "Use only North America and Europe" (비용 절감)
6. 대체 도메인 이름(CNAME): 필요 없음 (CloudFront 기본 도메인 사용)

### 3.2 오류 페이지 설정

Expo Router SPA를 위해 404를 index.html로 리다이렉트한다.

1. 배포 → **오류 페이지** → 사용자 정의 오류 응답 생성
2. HTTP 오류 코드: `404`
3. 오류 캐싱 최소 TTL: `0`
4. 응답 페이지 경로: `/index.html`
5. HTTP 응답 코드: `200`

### 3.3 Response Headers Policy (보안 헤더)

Android "오래된 개인정보 보호 기능" 경고를 해결하려면 보안 헤더를 추가한다.

1. CloudFront → **정책** → **응답 헤더** → 정책 생성
2. 이름: `score-up-security-headers`
3. 보안 헤더 구성:

| 헤더 | 값 | 설명 |
| --- | --- | --- |
| Strict-Transport-Security (HSTS) | `max-age=31536000; includeSubDomains` | HTTPS 강제 |
| X-Content-Type-Options | `nosniff` | MIME 스니핑 방지 |
| Referrer-Policy | `strict-origin-when-cross-origin` | 리퍼러 제한 |
| X-Frame-Options | `DENY` | 클릭재킹 방지 |

4. 배포 → 동작 편집 → 응답 헤더 정책 연결

### 3.4 캐시 무효화 (배포 후)

파일 업데이트 후 캐시를 비운다.

```bash
aws cloudfront create-invalidation --distribution-id DISTRIBUTION_ID --paths "/*"
```

---

## 4. 앱 코드 변경 사항

HTTP에서 PWA 기능을 안전하게 비활성화하도록 코드를 수정했다.

### 4.1 서비스 워커 등록 (`app/+html.tsx`)

```javascript
if ('serviceWorker' in navigator && window.isSecureContext) {
  // HTTPS/localhost에서만 SW 등록
} else if (!window.isSecureContext) {
  console.log('ServiceWorker skipped: insecure context');
}
```

### 4.2 PWA 훅 (`hooks/use-pwa-install.ts`)

- 새 상태: `insecure-context`
- 메시지: "PWA 설치는 HTTPS 환경에서만 가능합니다."
- HTTP에서 설치 버튼 비활성화

### 4.3 메타 태그 (`app/+html.tsx`)

```html
<meta name="referrer" content="strict-origin-when-cross-origin" />
<meta http-equiv="X-Content-Type-Options" content="nosniff" />
```

### 4.4 매니페스트 (`public/manifest.json`)

```json
{
  "id": "score-up-pwa",
  "prefer_related_applications": false,
  "icons": [
    { "src": "/icon-192.png", "purpose": "any" },
    { "src": "/icon-512.png", "purpose": "any" },
    { "src": "/icon-512-maskable.png", "purpose": "maskable" }
  ]
}
```

---

## 5. Android 재설치 절차

기존 HTTP 바로가기를 삭제하고 HTTPS URL에서 다시 설치한다.

### 5.1 기존 바로가기 삭제

1. 홈 화면에서 SCORE UP 아이콘 길게 누르기
2. **삭제** 또는 **제거** 선택

### 5.2 브라우저 데이터 삭제 (권장)

1. Chrome 설정 → 사이트 설정 → 저장용량
2. `score-up...` 사이트 찾기
3. **데이터 삭제**

### 5.3 HTTPS URL로 재설치

1. Chrome에서 CloudFront HTTPS URL 열기
   - 예: `https://d1234567890.cloudfront.net/`
2. 주소창 아래 또는 메뉴(⋮) → **앱 설치** / **홈 화면에 추가**
3. 설치 확인

---

## 6. 검증 체크리스트

### HTTP URL (S3)

- [ ] 서비스 워커 등록 안 됨 (콘솔: "insecure context")
- [ ] 설정 → 홈 화면에 추가: "HTTPS 필요" 버튼 비활성화
- [ ] 설치 권유 배너 표시 안 됨
- [ ] 앱 자체는 정상 동작

### HTTPS URL (CloudFront / cloudflared)

- [ ] 서비스 워커 등록됨 (DevTools → Application → Service Workers)
- [ ] 설정 → 홈 화면에 추가: 버튼 활성화
- [ ] Android Chrome에서 "앱 설치" 프롬프트 표시
- [ ] 설치 후 홈 화면 아이콘 정상
- [ ] 앱 실행 시 standalone 모드 (주소창 없음)

### 보안 헤더 (CloudFront Response Headers Policy 적용 시)

- [ ] DevTools → Network → 응답 헤더에 HSTS 있음
- [ ] X-Content-Type-Options: nosniff
- [ ] Referrer-Policy: strict-origin-when-cross-origin
- [ ] Android 경고 없음

---

## 7. 관련 문서

- `docs/SCORE-UP-PWA.md` — PWA 전체 개요
- `docs/SCORE-UP-팀공유-S3-미리보기.md` — S3 정적 호스팅
