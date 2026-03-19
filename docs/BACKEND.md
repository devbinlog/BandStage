# 백엔드 아키텍처

## 개요

Next.js App Router의 서버 기능을 활용한 풀스택 백엔드입니다.
API Routes, Server Actions, Server Components 세 레이어를 역할에 따라 분리합니다.

---

## 레이어 구조

```
클라이언트 요청
    │
    ├─ 페이지 접근 → middleware.ts (JWT 인증)
    │
    ├─ 폼 제출 → Server Actions (src/server/actions/)
    │
    ├─ API 요청 → API Routes (src/app/api/)
    │
    └─ 페이지 렌더링 → Server Components → Queries (src/server/queries/)
                                          ↓
                                     Prisma ORM
                                          ↓
                                   Supabase PostgreSQL
```

---

## 인증 시스템

**NextAuth.js v4 — Credentials Provider + JWT**

```
로그인 요청 (POST /api/auth/callback/credentials)
  ↓
Credentials Provider
  ↓
Prisma로 User 테이블 이메일 조회
  ↓
bcryptjs로 비밀번호 검증 (bcrypt.compare)
  ↓
JWT 페이로드에 id, email, name, role 포함
  ↓
HTTP-only 쿠키에 JWT 저장
```

**세션 확장** (`src/auth.ts`):
- `session.user.id` — 서버 액션에서 소유자 확인에 사용
- `session.user.role` — 권한 분기에 사용

**회원가입** (`POST /api/auth/signup`):
- Zod로 입력값 검증
- bcryptjs `saltRounds: 10`으로 비밀번호 해시 후 저장
- 중복 이메일 처리

---

## 미들웨어 (라우트 보호)

`middleware.ts` — `next-auth/jwt`의 `getToken()`으로 토큰 검증

| 경로 패턴 | 요구 역할 | 미충족 시 |
|-----------|-----------|-----------|
| `/mypage/*` | 로그인 | `/login?callbackUrl=...` |
| `/organizer/*` | ARTIST 또는 ADMIN | `/login` |
| `/venue-manager/*` | VENUE 또는 ADMIN | `/login` |
| `/admin/*` | ADMIN | `/` |
| `/login`, `/signup` | 비로그인 | `/` (이미 로그인 시) |

---

## Server Actions

클라이언트에서 직접 호출하는 서버 함수입니다.
모든 액션은 `auth()`로 세션을 확인한 후 Zod 스키마로 입력값을 검증합니다.

### `src/server/actions/events.ts`

| 함수 | 설명 |
|------|------|
| `createEvent(input)` | 공연 등록 — DRAFT 상태로 생성, 티켓 타입 일괄 생성 |
| `updateEvent(id, input)` | 공연 수정 — 소유자 또는 ADMIN만 가능 |
| `deleteEvent(id)` | 공연 삭제 — DRAFT/REJECTED 상태만 삭제 가능 |
| `toggleBookmark(targetType, targetId)` | 북마크 토글 (없으면 생성, 있으면 삭제) |

### `src/server/actions/venues.ts`

| 함수 | 설명 |
|------|------|
| `createVenue(input)` | 공연장 등록 |
| `updateVenue(id, input)` | 공연장 수정 — 관리자 또는 ADMIN만 가능 |
| `deleteVenue(id)` | 공연장 삭제 |

### `src/server/actions/bands.ts`

| 함수 | 설명 |
|------|------|
| `createBand(input)` | 밴드 등록 |
| `updateBand(id, input)` | 밴드 수정 |
| `deleteBand(id)` | 밴드 삭제 |

### `src/server/actions/reservations.ts`

| 함수 | 설명 |
|------|------|
| `createReservation(ticketTypeId, quantity)` | 예약 생성 — Prisma 트랜잭션으로 원자성 보장 |
| `cancelReservation(ticketId)` | 예약 취소 — 공연 24시간 전까지만 가능 |
| `getMyReservations()` | 내 예약 목록 조회 |

**예약 트랜잭션 흐름:**
```
$transaction 시작
  ↓ TicketType 조회 (remaining 확인)
  ↓ remaining < quantity → 에러 반환
  ↓ perUserLimit 초과 확인
  ↓ Ticket 생성
  ↓ TicketType.remaining 차감 (decrement)
$transaction 완료 (원자성 보장)
```

### `src/server/actions/admin.ts`

| 함수 | 설명 |
|------|------|
| `approvePerformance(id)` | 공연 승인 → APPROVED |
| `rejectPerformance(id, reason)` | 공연 거부 → REJECTED |
| `publishPerformance(id)` | 공연 게시 → PUBLISHED |
| `verifyVenue(id)` | 공연장 인증 |
| `updateUserRole(userId, role)` | 사용자 역할 변경 |
| `resolveReport(id)` | 신고 처리 |
| `createNotice(input)` | 공지사항 작성 |
| `getAdminStats()` | 플랫폼 통계 조회 |

---

## Server Queries

읽기 전용 DB 조회 함수입니다. Server Component에서 직접 호출합니다.

### `src/server/queries/performances.ts`

```typescript
getPerformances(params: PerformanceFilterParams)
  // status, genreId, regionId, bandId, venueId, search, page, limit

getPerformanceBySlug(slug: string)
  // venue, band, ticketTypes, images 포함

getUpcomingPerformances(limit?: number)
  // PUBLISHED + startsAt > now()

getPerformancesByOwner(ownerId: string)
  // 오거나이저 대시보드용
```

### `src/server/queries/venues.ts`

```typescript
getVenues(params: VenueFilterParams)
  // venueType, regionId, search, page, limit

getVenueBySlug(slug: string)
getVenueById(id: string)
getVenuesByManager(managerId: string)
```

### `src/server/queries/search.ts`

```typescript
globalSearch(query: string)
  // events, venues, bands를 병렬(Promise.all)로 동시 조회
```

---

## API Routes

REST API 엔드포인트입니다. 외부 fetch나 클라이언트 컴포넌트의 API 호출에 사용합니다.

### 공연 (`src/app/api/performances/`)

```
GET /api/performances
  Query: status, genreId, regionId, search, page, limit
  Response: { items: [...], total, page, totalPages }

GET /api/performances/[id]
  Response: 공연 상세 (venue, band, ticketTypes 포함)
```

### 공연장 (`src/app/api/venues/`)

```
GET /api/venues
  Query: venueType, regionId, search, page, limit

GET /api/venues/[id]
```

### 밴드 (`src/app/api/bands/`)

```
GET /api/bands
  Query: genreId, regionId, search, page, limit
```

### 지역 (`src/app/api/regions/`)

```
GET /api/regions
  Query: parentId (부모 없음 = 최상위)

GET /api/regions/[slug]
```

### 통합 검색 (`src/app/api/search/`)

```
GET /api/search?q={keyword}
  Response: { performances: [...], venues: [...], bands: [...] }
```

### 인증 (`src/app/api/auth/`)

```
POST /api/auth/signup          # 회원가입
[...] /api/auth/[...nextauth]  # NextAuth 핸들러
```

---

## 보안 설계

| 항목 | 처리 방식 |
|------|-----------|
| 비밀번호 | bcryptjs, salt rounds 10 |
| 세션 | JWT, HTTP-only 쿠키 |
| SQL Injection | Prisma 파라미터화 쿼리 자동 방어 |
| 권한 검사 | 서버 액션 내부에서 `auth()` + 역할 확인 |
| 입력 검증 | Zod 스키마로 모든 서버 액션 입력 검증 |
| 환경변수 | `.env` git 제외, Zod로 런타임 검증 |

---

## 에러 처리 패턴

모든 서버 액션은 `ActionResult<T>` 타입을 반환합니다:

```typescript
type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string }
```

클라이언트에서:
```typescript
const result = await createEvent(input);
if (!result.success) {
  alert(result.error);
  return;
}
router.push("/organizer");
```
