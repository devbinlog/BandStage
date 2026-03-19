# 데이터베이스 설계

## 개요

Prisma 6 + Supabase PostgreSQL 기반입니다.
`prisma/schema.prisma`에 15개 모델과 9개 Enum이 정의되어 있습니다.

---

## 설정 방법

### 1. Supabase 프로젝트 준비

1. [supabase.com](https://supabase.com)에서 새 프로젝트 생성
2. Settings → Database → Connection string 복사

### 2. 환경변수

`.env` 파일에 설정:

```env
# Connection pooling (애플리케이션 서버 → Supabase)
DATABASE_URL="postgresql://postgres.[ref]:[password]@[host]:6543/postgres?pgbouncer=true"

# Direct connection (마이그레이션용)
DIRECT_URL="postgresql://postgres.[ref]:[password]@[host]:5432/postgres"
```

`prisma/schema.prisma`에서 두 URL을 모두 사용합니다:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### 3. 스키마 적용

```bash
# 개발 환경 — 스키마 직접 반영 (마이그레이션 파일 없음)
npm run db:push

# Prisma Client 생성
npm run db:generate

# 시드 데이터 삽입
npm run db:seed
```

---

## 데이터 모델

### 관계 다이어그램

```
User
 ├─< BandMember >─ Band ─< Event ─< TicketType ─< Ticket
 │                   │       │
 │                  Genre  Venue ── Region
 │                           │
 └─< Bookmark           VenueSuggestion
 └─< AuditLog
 └─< Notice (author)
```

---

## 모델 상세

### User

플랫폼 사용자입니다. 역할(role)에 따라 접근 가능한 기능이 다릅니다.

| 필드 | 타입 | 설명 |
|------|------|------|
| id | String (cuid) | PK |
| email | String (unique) | 로그인 이메일 |
| password | String? | bcrypt 해시 |
| name | String? | 실명 |
| displayName | String? | 화면 표시 이름 |
| role | Role | FAN / ARTIST / VENUE / ADMIN |
| image | String? | 프로필 이미지 URL |
| bio | String? | 자기소개 |

**Role Enum:**
- `FAN` — 기본 역할, 공연 탐색·예약
- `ARTIST` — 공연 등록, 밴드 관리 (오거나이저)
- `VENUE` — 공연장 등록·관리
- `ADMIN` — 전체 관리

---

### Event (공연)

플랫폼의 핵심 엔티티입니다.

| 필드 | 타입 | 설명 |
|------|------|------|
| id | String (cuid) | PK |
| title | String | 공연 제목 |
| slug | String (unique) | URL용 슬러그 |
| summary | String? | 한 줄 요약 |
| description | Text? | 상세 설명 |
| coverImage | String? | 포스터 이미지 URL |
| status | EventStatus | 상태 |
| startsAt | DateTime | 공연 시작 시각 |
| endsAt | DateTime? | 공연 종료 시각 |
| viewCount | Int | 조회수 |
| venueId | String? | FK → Venue |
| bandId | String? | FK → Band |
| ownerId | String? | FK → User (등록자) |
| genreId | String? | FK → Genre |
| regionId | String? | FK → Region |

**EventStatus 흐름:**
```
DRAFT → PENDING → APPROVED → PUBLISHED → ARCHIVED
                ↘ REJECTED
```

| 상태 | 설명 |
|------|------|
| DRAFT | 등록자 임시 저장 |
| PENDING | 관리자 승인 요청 |
| APPROVED | 관리자 승인 완료 (아직 비공개) |
| REJECTED | 관리자 반려 |
| PUBLISHED | 공개 게시 |
| ARCHIVED | 아카이브 (종료 후) |

---

### Venue (공연장)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | String (cuid) | PK |
| name | String | 공연장 이름 |
| slug | String (unique) | URL용 슬러그 |
| addressLine1 | String? | 주소 |
| city | String? | 시/도 |
| lat / lng | Float? | 위도/경도 |
| capacityMin | Int? | 최소 수용인원 |
| capacityMax | Int? | 최대 수용인원 |
| venueType | VenueType | 공연장 유형 |
| isIndoor | Boolean | 실내 여부 |
| tags | String[] | 시설 태그 |
| isVerified | Boolean | 관리자 인증 여부 |
| managerId | String? | FK → User |
| regionId | String? | FK → Region |

**VenueType Enum:** LIVE_CLUB / CONCERT_HALL / OUTDOOR / MULTIPLEX / BAR / OTHER

---

### Band (밴드)

| 필드 | 타입 | 설명 |
|------|------|------|
| id | String (cuid) | PK |
| name | String | 밴드 이름 |
| slug | String (unique) | URL용 슬러그 |
| formedYear | Int? | 결성 연도 |
| instagram / youtube / soundcloud | String? | SNS 링크 |
| isActive | Boolean | 활동 여부 |
| genreId | String? | FK → Genre |
| regionId | String? | FK → Region |
| ownerId | String? | FK → User (밴드 대표) |

---

### BandMember

Band-User 중간 테이블입니다.

| 필드 | 타입 | 설명 |
|------|------|------|
| bandId | String | FK → Band |
| userId | String? | FK → User (계정 없는 멤버 허용) |
| name | String | 멤버 이름 |
| role | BandMemberRole | VOCAL / GUITAR / BASS / DRUMS / KEYS 등 |
| instrument | String? | 추가 악기 정보 |

---

### TicketType / Ticket

**TicketType** — 공연당 티켓 종류 (일반, VIP, 얼리버드 등):

| 필드 | 타입 | 설명 |
|------|------|------|
| eventId | String | FK → Event |
| name | String | 티켓 이름 |
| category | TicketTypeCategory | GENERAL / VIP / EARLY_BIRD / OTHER |
| price | Decimal(10,2)? | 가격 (0 = 무료) |
| quantity | Int | 총 수량 |
| remaining | Int | 잔여 수량 |
| perUserLimit | Int? | 인당 최대 구매 수 |
| salesStart / salesEnd | DateTime? | 판매 기간 |

**Ticket** — 실제 예약 인스턴스:

| 필드 | 타입 | 설명 |
|------|------|------|
| ticketTypeId | String | FK → TicketType |
| eventId | String | FK → Event |
| userId | String | FK → User |
| status | TicketStatus | UNPAID / PENDING / CONFIRMED / CANCELLED |
| quantity | Int | 구매 수량 |
| totalAmount | Decimal? | 결제 금액 |
| qrCode | String (unique) | 입장 QR 코드 |

---

### Region (지역 계층)

자기 참조(self-referential) 트리 구조입니다.

```
level 0: 대한민국
level 1: 서울특별시, 경기도, 부산광역시 ...
level 2: 서울 강남구, 서울 마포구 ...
level 3: (세부 구역)
```

| 필드 | 타입 | 설명 |
|------|------|------|
| slug | String (unique) | URL용 슬러그 (`korea`, `seoul`, `seoul-hongdae`) |
| level | Int | 계층 레벨 (0~3) |
| parentId | String? | FK → Region (상위 지역) |

---

### Genre (장르)

| 필드 | 타입 | 설명 |
|------|------|------|
| name | String (unique) | 장르명 (록, 인디, 재즈 등) |
| slug | String (unique) | URL용 슬러그 |
| color | String? | 뱃지 배경색 (hex) |

---

### 보조 모델

| 모델 | 설명 |
|------|------|
| Bookmark | 유저가 공연·공연장·밴드를 북마크 (복합 unique: userId + targetType + targetId) |
| Notice | 관리자 공지사항 (타입: GENERAL / MAINTENANCE / UPDATE / EVENT) |
| AuditLog | 관리자 액션 감사 로그 (before/after JSON 저장) |
| VenueSuggestion | 유저가 공연장 등록을 제안 |
| Report | 콘텐츠 신고 (상태: OPEN → IN_REVIEW → RESOLVED / DISMISSED) |
| CommunityPost | 밴드 커뮤니티 게시글 |
| CommunityComment | 게시글 댓글 |

---

## 인덱스 전략

주요 인덱스 목록:

```
Event: status, startsAt, venueId, bandId, ownerId, genreId, regionId
Venue: managerId, regionId, venueType
Band: ownerId, genreId, regionId
Ticket: userId, eventId, ticketTypeId, status
Region: parentId, slug
Bookmark: userId / (targetType, targetId)
```

---

## 시드 데이터 (`prisma/seed.ts`)

`npm run db:seed` 실행 시 삽입되는 데이터:

| 유형 | 내용 |
|------|------|
| 장르 | 록, 메탈, 인디, 포크, 재즈, R&B, 일렉트로닉, 힙합 (8개) |
| 지역 | 대한민국 → 서울·부산·경기 → 서울 5개 구 (12개) |
| 사용자 | admin / artist / venue / fan (4명) |
| 공연장 | 롤링홀, CJ Azit, Club FF, 벨로드롬, KT&G 상상마당 (5개) |
| 밴드 | Parallel Echo, Neon Dive, Bluestone Quartet (3팀, 멤버 포함) |
| 공연 | PUBLISHED 3개, APPROVED 1개, PENDING 1개 (총 5개) |

---

## 유용한 명령어

```bash
# 스키마를 DB에 직접 반영 (개발용)
npm run db:push

# 마이그레이션 파일 생성 및 적용 (프로덕션 권장)
npm run db:migrate

# Prisma Client 재생성
npm run db:generate

# Prisma Studio (GUI)
npm run db:studio

# 시드 데이터 삽입
npm run db:seed
```
