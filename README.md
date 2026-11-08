# MyPad 모바일 청첩장

도메인: https://mypad.kr

## 페이지 URL

### 누구나 보는 페이지

| URL | 페이지 | 설명 |
|---|---|---|
| `/` | 서비스 소개 | 메인 화면. 없는 주소로 들어와도 여기로 이동 |

### 고객 (청첩장 만드는 사람)

| URL | 페이지 | 설명 |
|---|---|---|
| `/mypage/login` | 로그인 | 관리자가 발급한 아이디/비밀번호로 로그인 → `/mypage` 로 이동 |
| `/mypage` | 마이페이지 | 청첩장·식전영상 내용 작성, 사진 업로드, 종이청첩장/식권 주문. 로그인 안 했으면 `/mypage/login` 으로 이동 |

### 하객 (청첩장 받는 사람)

`:slug` = 고객마다 자동으로 만들어지는 10자리 고유 주소 (예: `abcd234xyz`)

| URL | 페이지 | 설명 |
|---|---|---|
| `/invite/:slug` | 모바일 청첩장 | 돌잔치 고객이면 `/dol/:slug` 로 자동 이동 |
| `/invite/:slug/video` | 식전영상 (돌잔치는 성장영상) | 청첩장 안의 버튼으로 들어감 |
| `/dol/:slug` | 돌잔치 초대장 | |

### 관리자

| URL | 페이지 | 설명 |
|---|---|---|
| `/admin/wedding` | 고객 계정 발급 | 관리자 키 필요. 스마트스토어 구매 고객에게 아이디/비밀번호 발급 |

## 백엔드 API

주소: `https://api.mypad.kr/weddingPlatform` (Spring 프로젝트 `IdeaProjects/myboard`, 포트 28080)

| 메서드 | 경로 | 용도 | 인증 |
|---|---|---|---|
| POST | `/login` | 로그인 (토큰 발급) | |
| POST | `/logout` | 로그아웃 | 토큰 |
| GET | `/me` | 내 정보 + 청첩장/영상 내용 | 토큰 |
| PUT | `/invite` | 청첩장 내용 저장 | 토큰 |
| GET | `/invite/public?slug=` | 청첩장 공개 조회 | |
| PUT | `/video` | 식전영상 설정 저장 | 토큰 |
| GET | `/video/public?slug=` | 식전영상 공개 조회 | |
| POST | `/upload` | 사진 업로드 (`C:/uploads/wedding/<slug>/` 에 저장) | 토큰 |
| GET | `/image?slug=&fileName=` | 업로드한 사진 보기 | |
| POST | `/orders` | 종이청첩장/식권 주문 | 토큰 |
| GET | `/orders` | 내 주문 목록 | 토큰 |
| POST | `/admin/customers` | 고객 계정 발급 | 관리자 키 |
| GET | `/admin/orders` | 전체 주문 목록 (화면 없음, API로만 조회) | 관리자 키 |

- 토큰: 요청 헤더 `X-Auth-Token`
- 관리자 키: 요청 헤더 `X-Admin-Key` (값은 `application-local.yml` 의 `wedding.admin-key`)
- 상태 확인: `POST https://api.mypad.kr/checkHealth`

## 서버 구조 (이 PC가 운영 서버)

```
브라우저 → Cloudflare → nginx(C:\nginx, 8080) → localhost:3000  (react-app: scripts/serve.js)
                                              → /api/ → 28080  (myboard: Spring)
```

- 실행: `C:\Users\PC\Projects\startup.bat` (nginx, 프론트 빌드+서버, Spring 을 한 번에 실행)
- 코드 수정 후에는 React-App 창을 닫고 `startup.bat` 을 다시 실행해야 반영됨 (`npm run build` 필요)

## 프론트 명령어

| 명령 | 설명 |
|---|---|
| `npm run build` | 빌드 (+ 페이지별 메타 태그 HTML 생성) |
| `npm run serve` | 운영 서버 실행 (`build/` 서빙, 3000번 포트) |
| `npm start` | 개발 서버 (운영에는 쓰지 않음) |

## 페이지를 추가할 때

1. `src/Components/Router.jsx` 에 라우트 추가
2. `src/pageMeta.json` 에 제목/설명 추가 (카톡 미리보기용)
3. `/invite/:slug` 처럼 주소에 `:` 가 들어가면 `scripts/serve.js` 의 `matchDynamic` 에도 추가
4. 이 README 의 URL 표에도 추가
