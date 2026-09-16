# SCORE UP — PWA 지원

| 항목 | 내용 |
| --- | --- |
| 문서명 | PWA (Progressive Web App) 설치 및 테스트 |
| 버전 | v0.1 |
| 작성일 | 2026-09-15 |
| 담당 | Infra |
| 상태 | 활성 |

SCORE UP 웹 버전은 PWA로 설치할 수 있다. 모바일 브라우저에서 "홈 화면에 추가"하면 앱처럼 동작한다.

> **참고**: PWA는 웹 전용이다. 추후 Expo 네이티브 빌드로 Android/iOS 앱도 배포할 예정이며, Capacitor로 마이그레이션하지 않는다.

---

## 1. PWA 개요

| 항목 | 설명 |
| --- | --- |
| 매니페스트 | `apps/mobile/public/manifest.json` — 앱 이름, 아이콘, 테마 색상 등 |
| 서비스 워커 | Workbox로 생성 (`dist/sw.js`) — 설치 조건 충족 + 기본 오프라인 캐시 |
| 아이콘 | 192×192, 512×512 (+ maskable) — `public/` 폴더에 위치 |
| 설치 조건 | HTTPS 또는 localhost, 유효한 매니페스트, 서비스 워커 등록 |

### 캐시 전략

| 리소스 | 전략 | 설명 |
| --- | --- | --- |
| 이미지 | CacheFirst | 30일 캐시, 최대 60개 |
| 폰트 | CacheFirst | 1년 캐시, 최대 30개 |
| JS/CSS | StaleWhileRevalidate | 캐시 우선 사용 후 백그라운드 업데이트 |
| 기타 네트워크 요청 | NetworkFirst | 네트워크 우선, 10초 타임아웃 시 캐시 |

---

## 2. 빌드

저장소 루트에서:

```bash
pnpm install
pnpm export:web
```

성공하면 `apps/mobile/dist/` 안에 다음 파일이 있어야 한다:

- `index.html`
- `manifest.json`
- `sw.js` (서비스 워커)
- `icon-192.png`, `icon-512.png`, `icon-512-maskable.png`
- `_expo/` (번들된 JS/CSS)

> `pnpm export:web`은 내부적으로 `expo export --platform web && npx workbox-cli generateSW workbox-config.js`를 실행한다.

---

## 3. 로컬 테스트

### 3.1 HTTPS 터널 (cloudflared)

서비스 워커는 HTTPS 또는 localhost에서만 동작한다. 모바일에서 테스트하려면 터널을 사용한다.

```bash
# dist 폴더를 정적 서버로 띄우기
cd apps/mobile
npx serve dist -l 3000

# 다른 터미널에서 cloudflared 터널
cloudflared tunnel --url http://localhost:3000
```

터널 URL (예: `https://xxx-xxx.trycloudflare.com`)을 모바일 브라우저에서 열면 된다.

### 3.2 localhost (같은 기기)

같은 기기의 Chrome에서 테스트한다면:

```bash
cd apps/mobile
npx serve dist -l 3000
# http://localhost:3000 에서 열기
```

---

## 4. 모바일에서 PWA 설치

### Android (Chrome)

1. Chrome에서 HTTPS URL을 연다
2. 주소창 아래 또는 메뉴(⋮)에서 **"앱 설치"** 또는 **"홈 화면에 추가"** 탭
3. 설치 확인 팝업에서 **설치** 선택
4. 홈 화면에 SCORE UP 아이콘이 생긴다

### iOS (Safari)

1. Safari에서 HTTPS URL을 연다
2. **공유** 버튼 (□↑) 탭
3. **홈 화면에 추가** 선택
4. 이름 확인 후 **추가** 탭

> iOS는 서비스 워커 지원이 제한적이지만 홈 화면 앱으로는 동작한다.

---

## 5. Lighthouse 검증

Chrome DevTools에서 설치 가능 여부를 확인할 수 있다:

1. Chrome에서 페이지 열기
2. DevTools (F12) → **Lighthouse** 탭
3. **Progressive Web App** 체크 후 분석 실행
4. "Installable" 항목 확인

또는 DevTools → **Application** → **Manifest** 에서 매니페스트 파싱 상태와 아이콘 확인.

---

## 6. S3 / GitHub Actions 배포

기존 S3 미리보기 배포 (`SCORE-UP-팀공유-S3-미리보기.md` 참조)와 동일하게 동작한다:

```bash
git push origin main
git push origin-hub main
```

GitHub Actions가 `pnpm export:web`을 실행하고 `dist/`를 S3에 업로드한다.

S3 정적 웹 호스팅은 HTTP만 제공하므로, **실제 PWA 설치 테스트는 HTTPS가 필요**하다:

| 방법 | 설명 |
| --- | --- |
| CloudFront 연결 | S3 앞에 CloudFront를 두면 HTTPS 가능 (비용 발생) |
| cloudflared 터널 | 로컬 또는 S3 URL을 터널로 감싸기 |
| Vercel / Netlify | 무료 HTTPS 제공, `dist` 폴더 배포 |

팀 UX 검수 목적이면 cloudflared 터널이 가장 간편하다.

---

## 7. 파일 구조

```
apps/mobile/
├── public/
│   ├── manifest.json      # PWA 매니페스트
│   ├── icon-192.png       # 192×192 아이콘
│   ├── icon-512.png       # 512×512 아이콘
│   └── icon-512-maskable.png  # Maskable 아이콘
├── app/
│   └── +html.tsx          # 매니페스트 링크 + SW 등록 스크립트
├── workbox-config.js      # Workbox 서비스 워커 설정
└── dist/                  # 빌드 출력 (git 제외)
    ├── sw.js              # 생성된 서비스 워커
    └── ...
```

---

## 8. 인앱 설치 UX

### 8.1 설정 화면 — 「홈 화면에 추가」

설정 탭(`/settings`)에 「홈 화면에 추가」 카드가 표시된다.

| 상태 | 동작 |
| --- | --- |
| 이미 standalone으로 실행 중 | "이미 추가됨" (비활성) |
| Android Chrome (beforeinstallprompt 지원) | 「홈 화면에 추가」 버튼 → 네이티브 설치 프롬프트 |
| iOS Safari | 「설치 방법 보기」 → 단계별 안내 모달 |
| 미지원 브라우저 | 카드 숨김 |

### 8.2 브라우저 설치 권유 배너

모바일 브라우저에서 처음 열면 하단에서 슬라이드업 배너가 표시된다.

- **표시 조건**: 모바일 뷰포트(≤768px), standalone 아님, 미 dismiss
- **내용**: "홈 화면에 추가하고 앱처럼 쓰세요"
- **CTA**: Android는 바로 설치 프롬프트 / iOS는 안내 모달
- **나중에**: dismiss하면 localStorage에 저장되어 재표시 안 함

파일:
- `components/pwa/install-prompt-banner.tsx` — 배너 컴포넌트
- `components/pwa/ios-install-modal.tsx` — iOS Safari 안내 모달
- `hooks/use-pwa-install.ts` — PWA 설치 상태 훅
- `store/ui-prefs.ts` — dismiss 상태 persist

---

## 9. 향후 계획

| 항목 | 상태 |
| --- | --- |
| PWA 설치 (웹) | ✅ 구현됨 |
| 인앱 설치 UX (설정 + 권유 배너) | ✅ 구현됨 |
| Expo 네이티브 빌드 (Android/iOS) | 예정 |
| 오프라인 경기 데이터 동기화 | 범위 밖 (현재는 정적 캐시만) |
| Push 알림 | 범위 밖 |

---

## 10. 문제 해결

| 증상 | 원인 / 해결 |
| --- | --- |
| "앱 설치" 안 뜸 | HTTPS 아님, 매니페스트 오류, SW 미등록 |
| 아이콘이 기본값 | 아이콘 경로 오류 — DevTools → Application → Manifest 확인 |
| SW 등록 실패 | Console 에러 확인, `sw.js` 파일 존재 여부 |
| 빌드 후 SW 없음 | `pnpm export:web` 대신 `export:web:no-sw` 실행함 |
| 오프라인 안 됨 | 캐시된 페이지만 동작, 동적 API는 네트워크 필요 |
