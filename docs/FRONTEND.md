# 프론트엔드 아키텍처

## 개요

Next.js 16 App Router 기반의 서버 컴포넌트 우선 설계입니다.
데이터 fetching은 서버에서 처리하고, 인터랙션이 필요한 최소한의 컴포넌트에만 `"use client"`를 적용합니다.

---

## 라우트 구조

### 공개 영역 `(marketing)`

비로그인 사용자 접근 가능한 페이지입니다.

| 경로 | 설명 |
|------|------|
| `/` | 랜딩 — 다가오는 공연 목록, 서비스 소개 |
| `/performances` | 공연 목록 — 장르·지역·날짜 필터, 페이지네이션 |
| `/performances/[slug]` | 공연 상세 — 티켓 구매, 밴드 정보, 공연장 정보 |
| `/venues` | 공연장 목록 — 유형·지역 필터 |
| `/venues/[slug]` | 공연장 상세 — 위치, 시설, 예정 공연 |
| `/bands` | 밴드 목록 — 장르 필터 |
| `/bands/[id]` | 밴드 상세 — 멤버 구성, SNS 링크, 출연 공연 |
| `/search` | 통합 검색 — 공연·공연장·밴드 동시 검색 |
| `/login` | 로그인 |
| `/signup` | 회원가입 |

### 인증 영역 `(platform)`

미들웨어에서 JWT 검증 후 접근 허용합니다.

| 경로 | 접근 역할 | 설명 |
|------|-----------|------|
| `/mypage` | 모든 로그인 | 프로필, 예약 내역, 북마크 |
| `/mypage/reservations` | 모든 로그인 | 전체 예약 내역 |
| `/mypage/bookmarks` | 모든 로그인 | 북마크한 공연·공연장·밴드 |
| `/organizer` | ARTIST | 대시보드 — 내 공연, 통계 |
| `/organizer/performances/new` | ARTIST | 공연 등록 폼 |
| `/venue-manager` | VENUE | 내 공연장 목록 및 관리 |
| `/admin` | ADMIN | 플랫폼 통계 대시보드 |
| `/admin/performances` | ADMIN | 공연 승인·거부·게시 |
| `/admin/users` | ADMIN | 사용자 역할 관리 |

---

## 컴포넌트 구조

### UI 컴포넌트 (`src/components/ui/`)

재사용 가능한 기본 컴포넌트입니다.

| 컴포넌트 | 설명 |
|----------|------|
| `StatusBadge` | 이벤트 상태별 색상 뱃지 (서버 컴포넌트) |
| `Pagination` | URL searchParams 기반 페이지네이션 (클라이언트) |
| `EmptyState` | 빈 목록 상태 표시 — 아이콘·제목·설명·액션 버튼 |
| `RoleGuard` | 역할 미충족 시 리다이렉트하는 서버 컴포넌트 래퍼 |

### 도메인 카드 (`src/components/shared/`)

| 컴포넌트 | 표시 정보 |
|----------|-----------|
| `PerformanceCard` | 커버 이미지, D-day 뱃지, 장르, 공연장, 티켓 가격 |
| `VenueCard` | 공연장 유형, 수용인원, 시설 태그, 인증 뱃지 |
| `BandCard` | 프로필 이미지, 장르, 멤버 수, 활동 지역 |

### 폼 컴포넌트 (`src/components/forms/`)

| 컴포넌트 | 설명 |
|----------|------|
| `SearchBar` | `useRouter` + `useTransition` 기반 URL 검색 — 로딩 상태 처리 포함 |

---

## 서버 vs 클라이언트 컴포넌트 분리 원칙

```
서버 컴포넌트 (기본)
├── DB 접근, 비동기 데이터 fetching
├── 민감한 로직 (인증 확인 등)
└── 초기 HTML 렌더링 — 번들 크기 최소화

클라이언트 컴포넌트 ("use client")
├── 사용자 인터랙션 (onClick, onChange 등)
├── 상태 관리 (useState, useReducer)
└── 브라우저 API 사용 (useRouter, useSearchParams 등)
```

**클라이언트 컴포넌트 적용 파일:**
- `src/components/header.tsx` — 세션 상태, 모바일 메뉴 토글
- `src/components/ui/Pagination.tsx` — useSearchParams
- `src/components/forms/SearchBar.tsx` — useRouter, useTransition
- `src/app/(platform)/organizer/performances/new/page.tsx` — 복잡한 폼 상태

---

## 상태 관리

별도의 전역 상태 라이브러리를 사용하지 않습니다.

- **서버 상태**: 서버 컴포넌트에서 직접 DB 조회
- **URL 상태**: 필터·검색·페이지는 searchParams로 관리
- **폼 상태**: `useState`로 컴포넌트 로컬 관리
- **세션**: `useSession()` (NextAuth)

---

## 필터링 및 검색 패턴

URL searchParams를 단일 진실 공급원으로 사용합니다.

```
사용자 필터 변경
  ↓
SearchBar / FilterBar에서 router.push() 호출
  ↓
URL searchParams 업데이트
  ↓
서버 컴포넌트 리렌더링 (자동)
  ↓
새 searchParams로 DB 쿼리 실행
```

---

## 디자인 시스템

| 토큰 | 값 |
|------|-----|
| Primary | `#0d28c4` |
| Dark | `#0b1021` |
| 카드 | `rounded-xl border border-gray-200 bg-white shadow-sm` |
| 입력 | `rounded-lg border border-gray-300 px-4 py-3 text-sm` |
| 버튼 (primary) | `rounded-lg bg-[#0d28c4] px-8 py-3 text-white font-semibold` |

Tailwind CSS v4 사용, 모바일 우선 반응형 설계입니다.

---

## 라우트 보호

`middleware.ts`에서 `next-auth/jwt`로 토큰을 검증합니다.

```
요청 → middleware.ts
  ↓ JWT 없음
  → /login 리다이렉트 (callbackUrl 포함)

  ↓ JWT 있음
  → 역할 확인
     /organizer/* → ARTIST or ADMIN 필요
     /venue-manager/* → VENUE or ADMIN 필요
     /admin/* → ADMIN 필요
     /mypage/* → 로그인만 필요

  ↓ /login, /signup → 이미 로그인 시 / 리다이렉트
```

---

## 페이지별 데이터 fetching 방식

| 페이지 | 방식 |
|--------|------|
| 공연 목록 | Server Component + `getPerformances()` 직접 호출 |
| 공연 상세 | Server Component + `getPerformanceBySlug()` |
| 통합 검색 | Server Component + `globalSearch()` (병렬 쿼리) |
| 오거나이저 대시보드 | Server Component + `getAdminStats()` |
| 공연 등록 폼 | Client Component + API fetch (`/api/venues`, `/api/bands`) |
