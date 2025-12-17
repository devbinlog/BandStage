# 데이터베이스 및 백엔드 시스템 설정 가이드

## 개요

Band-Stage는 **Next.js (App Router) + Prisma ORM + Supabase PostgreSQL** 기반의 풀스택 애플리케이션입니다. 서버리스 아키텍처를 사용하여 Vercel에 배포되며, 데이터베이스는 Supabase의 관리형 PostgreSQL 서비스를 사용합니다.

## 기술 스택

### 백엔드 시스템
- **Next.js 16 (App Router)**: React 기반 풀스택 프레임워크
  - Server Components: 서버에서 렌더링되는 컴포넌트
  - Server Actions: 서버에서 실행되는 함수 (폼 제출, 데이터 변조 등)
  - API Routes: RESTful API 엔드포인트 (`/api/*`)
  
- **Prisma ORM**: 타입 안전한 데이터베이스 접근
  - Prisma Client: 자동 생성되는 타입 안전한 데이터베이스 클라이언트
  - Prisma Schema: 데이터베이스 스키마 정의 (`prisma/schema.prisma`)
  - 마이그레이션: 스키마 변경 이력 관리

- **NextAuth.js (Auth.js)**: 인증 시스템
  - Credentials Provider: 이메일/비밀번호 로그인
  - JWT 세션 관리
  - Prisma Adapter: 세션 및 계정 정보를 DB에 저장

### 데이터베이스
- **Supabase PostgreSQL**: 관리형 PostgreSQL 데이터베이스
  - 자동 백업 및 복구
  - 연결 풀링 지원
  - 실시간 기능 지원 가능

## 데이터베이스 설정

### 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 가입 및 로그인
2. "New Project" 클릭
3. 프로젝트 이름, 데이터베이스 비밀번호, 지역 설정
4. 프로젝트 생성 완료 대기 (약 2분)

### 2. 연결 문자열 가져오기

1. Supabase 대시보드에서 프로젝트 선택
2. Settings > Database로 이동
3. "Connection string" 섹션에서 "URI" 선택
4. 연결 문자열 복사 (형식: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`)

### 3. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 환경 변수를 설정합니다:

```env
# 데이터베이스 연결 (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# NextAuth 설정
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="[RANDOM-32-CHAR-STRING]"
# NEXTAUTH_SECRET 생성: openssl rand -base64 32

# Google OAuth는 제거되었습니다 (Credentials만 사용)
```

### 4. Prisma 설정

#### 스키마 확인
`prisma/schema.prisma` 파일에 데이터베이스 스키마가 정의되어 있습니다:
- User: 사용자 정보
- Event: 공연 정보
- Venue: 공연장 정보
- Band: 밴드 정보
- Ticket: 티켓 정보
- 등등...

#### Prisma Client 생성
```bash
npm run db:generate
```

#### 데이터베이스에 스키마 적용
```bash
# 개발 환경 (스키마 직접 반영)
npm run db:push

# 프로덕션 환경 (마이그레이션 사용)
npm run db:migrate
```

## 데이터 흐름

### 1. 인증 (Authentication)

```
사용자 로그인 요청
  ↓
/login 페이지 (클라이언트)
  ↓
NextAuth Credentials Provider
  ↓
Prisma로 User 테이블에서 이메일 조회
  ↓
bcryptjs로 비밀번호 검증
  ↓
JWT 토큰 생성
  ↓
세션 생성 (쿠키에 저장)
```

### 2. 데이터 저장 (Create Event 예시)

```
사용자가 공연 등록 폼 제출
  ↓
Server Action (createEvent)
  ↓
인증 확인 (auth())
  ↓
Prisma를 통해 Event, TicketType 생성
  ↓
Supabase PostgreSQL에 저장
  ↓
페이지 재검증 (revalidatePath)
```

### 3. 데이터 조회 (Read Event 예시)

```
사용자가 이벤트 페이지 접속
  ↓
Server Component (EventDetailPage)
  ↓
Prisma로 Event 조회 (include로 관계 데이터 포함)
  ↓
Supabase PostgreSQL에서 데이터 가져오기
  ↓
Server Component에서 렌더링
  ↓
클라이언트에 HTML 전송
```

## 데이터베이스 스키마 구조

### 주요 테이블

1. **User**: 사용자 계정 정보
   - id, email, password, name, role (FAN/ARTIST/VENUE/ADMIN)
   - 관계: events, tickets, bands, venues 등

2. **Event**: 공연 정보
   - id, title, slug, description, startsAt, endsAt
   - status: DRAFT/PENDING/APPROVED/PUBLISHED/REJECTED/ARCHIVED
   - 관계: venue, band, owner, ticketTypes, tickets

3. **TicketType**: 티켓 타입
   - id, name, price, quantity, remaining
   - 관계: event, tickets

4. **Ticket**: 티켓 (예매 정보)
   - id, status: UNPAID/PENDING/CONFIRMED/CANCELLED
   - 관계: ticketType, event, user

## 백엔드 아키텍처

### Server Components vs Client Components

- **Server Components** (기본): 서버에서 실행, DB 접근 가능
  - 예: `app/(platform)/events/[slug]/page.tsx`
  - Prisma 직접 사용 가능
  - 번들 크기 감소 (클라이언트로 전송되지 않음)

- **Client Components** (`"use client"`): 브라우저에서 실행
  - 예: `components/event-ticket-selector.tsx`
  - 인터랙티브 기능 (useState, onClick 등)
  - DB 접근 불가 → Server Action 사용

### Server Actions

서버에서 실행되는 함수, 클라이언트에서 직접 호출 가능:

```typescript
// src/server/actions/events.ts
"use server";

export async function createEvent(input: CreateEventInput) {
  const session = await auth(); // 인증 확인
  // Prisma로 DB 저장
  // ...
}
```

### API Routes

RESTful API 엔드포인트가 필요한 경우:

```typescript
// src/app/api/auth/signup/route.ts
export async function POST(request: Request) {
  // 회원가입 로직
  // ...
}
```

## 배포 환경 설정

### Vercel 배포 시

1. Vercel 프로젝트 생성
2. GitHub 저장소 연결: `https://github.com/devbinlog/BandStage.git`
3. 환경 변수 설정:
   - DATABASE_URL
   - DIRECT_URL
   - NEXTAUTH_SECRET
   - NEXTAUTH_URL
4. 배포 → Prisma 마이그레이션 자동 실행

### 데이터베이스 연결

- **로컬 개발**: `.env.local`의 DATABASE_URL 사용
- **프로덕션**: Vercel 환경 변수 사용
- Supabase는 자동으로 연결 풀링 및 SSL을 처리합니다.

## 보안 고려사항

1. **비밀번호**: bcryptjs로 해시하여 저장 (salt rounds: 10)
2. **세션**: JWT 토큰 사용, HTTP-only 쿠키에 저장
3. **환경 변수**: `.env.local`은 git에 커밋하지 않음
4. **SQL Injection**: Prisma가 자동으로 방지
5. **권한 관리**: NextAuth + User.role 기반 접근 제어

## 유용한 명령어

```bash
# Prisma Client 재생성
npm run db:generate

# 스키마를 DB에 반영 (개발)
npm run db:push

# 마이그레이션 생성 및 적용 (프로덕션)
npm run db:migrate

# Prisma Studio (DB GUI)
npm run db:studio

# 개발 서버 실행
npm run dev
```

## 문제 해결

### 데이터베이스 연결 오류
- DATABASE_URL이 올바른지 확인
- Supabase 프로젝트가 활성화되어 있는지 확인
- 방화벽/네트워크 설정 확인

### Prisma Client 생성 오류
- `npm install` 실행
- `npm run db:generate` 재실행

### 마이그레이션 충돌
- `prisma/migrations` 폴더 확인
- 필요시 `npm run db:push`로 강제 반영 (개발 환경만)

