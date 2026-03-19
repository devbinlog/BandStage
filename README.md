# Band-Stage

밴드 공연을 중심으로 한 공연 예약 플랫폼입니다.
밴드, 공연장, 팬을 하나의 서비스로 연결하며 공연 등록부터 예약까지 전체 흐름을 지원합니다.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)

---

## 프로젝트 개요

공연 기획자(아티스트), 공연장 관리자, 팬이 각자의 역할에 맞는 기능을 사용하는 역할 기반 풀스택 플랫폼입니다.

**해결하는 문제**
- 공연 정보가 SNS, 포스터, 메신저 등 여러 채널에 분산되는 문제
- 밴드·기획팀의 체계적인 공연 관리 부재
- 팬의 공연 탐색 비용과 예약 불편

**핵심 기능**
- 역할별 분리된 접근 제어 (FAN / ARTIST / VENUE / ADMIN)
- 공연 등록 → 관리자 승인 → 게시 흐름
- 티켓 타입별 수량 관리 및 예약 트랜잭션 처리
- 지역·장르 기반 공연 탐색

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Auth | NextAuth.js v4 — Credentials Provider + JWT |
| ORM | Prisma 6 |
| Database | Supabase (PostgreSQL 15) |
| Validation | Zod 4 |
| Runtime | React 19 / Node.js 20+ |

> 상세 문서: [프론트엔드](docs/FRONTEND.md) · [백엔드](docs/BACKEND.md) · [데이터베이스](docs/DATABASE.md)

---

## 폴더 구조

```
bandstage-app/
├── prisma/
│   ├── schema.prisma       # DB 스키마 (15개 모델, 9개 Enum)
│   └── seed.ts             # 시드 데이터
├── docs/
│   ├── FRONTEND.md         # 프론트엔드 아키텍처
│   ├── BACKEND.md          # 백엔드 아키텍처
│   └── DATABASE.md         # DB 스키마 및 설정
├── src/
│   ├── app/
│   │   ├── (marketing)/    # 공개 페이지
│   │   │   ├── performances/
│   │   │   ├── venues/
│   │   │   ├── bands/
│   │   │   └── search/
│   │   ├── (platform)/     # 인증 필요 페이지
│   │   │   ├── mypage/
│   │   │   ├── organizer/
│   │   │   ├── venue-manager/
│   │   │   └── admin/
│   │   └── api/            # REST API 라우트
│   ├── components/
│   │   ├── ui/             # StatusBadge, Pagination, EmptyState, RoleGuard
│   │   ├── shared/         # PerformanceCard, VenueCard, BandCard
│   │   └── forms/          # SearchBar
│   ├── server/
│   │   ├── actions/        # 서버 액션 (mutating)
│   │   └── queries/        # DB 조회 (read-only)
│   ├── types/              # 도메인 타입
│   └── lib/                # Prisma 클라이언트, 유틸
└── middleware.ts            # JWT 기반 라우트 보호
```

---

## 로컬 실행

### 사전 요구 사항
- Node.js 20+
- Supabase 프로젝트 (또는 로컬 PostgreSQL)

### 설치

```bash
git clone https://github.com/devbinlog/BandStage.git
cd BandStage
npm install
```

### 환경변수 설정

프로젝트 루트에 `.env` 파일 생성:

```env
# Supabase PostgreSQL
DATABASE_URL="postgresql://postgres.[project]:[password]@[host]:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[project]:[password]@[host]:5432/postgres"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
```

### DB 초기화

```bash
npm run db:push       # 스키마 적용
npm run db:generate   # Prisma Client 생성
npm run db:seed       # 시드 데이터 삽입
```

### 개발 서버

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) 접속

---

## 테스트 계정

`npm run db:seed` 실행 후 사용 가능:

| 이메일 | 비밀번호 | 역할 |
|--------|----------|------|
| admin@bandstage.kr | admin1234 | ADMIN |
| artist@bandstage.kr | artist1234 | ARTIST |
| venue@bandstage.kr | venue1234 | VENUE |
| fan@bandstage.kr | fan1234 | FAN |

---

## 스크립트

```bash
npm run dev           # 개발 서버
npm run build         # 프로덕션 빌드
npm run lint          # ESLint 검사
npm run db:push       # DB 스키마 동기화
npm run db:studio     # Prisma Studio (DB GUI)
npm run db:seed       # 시드 데이터 삽입
```

---

## 라이선스

MIT
