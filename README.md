# BandStage

지역 기반 라이브 음악 플랫폼 — 밴드, 공연장, 공연, 예매를 하나로 연결합니다.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)

---

## Project Overview

### 문제

- 공연 정보가 SNS, 커뮤니티, 구글폼 등에 분산되어 있어 탐색이 어렵다
- 지역 기반 공연 검색 수단이 없다
- 소규모 공연장은 별도 홍보 채널이 없다
- 밴드와 주최자가 공연을 직접 관리할 수단이 없다

### 해결

BandStage는 공연의 전체 라이프사이클을 하나의 플랫폼으로 통합한다.

```
지역(Region) → 공연장(Venue) → 공연(Event) → 예매(Reservation)
```

지역 단위로 공연장을 구조화하고, 각 공연장에 공연을 연결한다.
밴드와 주최자가 직접 등록&관리하며, 관리자 승인을 거쳐 공개된다.

---

## Core Features

### 1. 지역 기반 공연 탐색

- 서울 구 단위 필터링 (마포구, 강남구, 용산구, 성동구, 종로구 등)
- 장르 필터 (인디 록, 재즈, 메탈, 포크, 블루스, 펑크, 일렉트로닉)
- 날짜 & 상태별 정렬, 필터 조합 후 공유 가능한 URL 구조

### 2. 공연장 데이터 구조화

- 실제 서울 공연장 25개 (롤링홀, 올댓재즈, 무신사 개러지, 현대카드 UNDERSTAGE 등)
- 공연장 유형 필터 (라이브클럽, 공연홀, 야외, 복합공간, 바)
- 공연장별 수용 인원, 주소, 연락처, 네이버 지도 링크 제공

### 3. 공연 등록 시스템

- 누구나 공연 정보 입력 페이지에 접근 가능
- 폼 제출 시 로그인 체크 (비로그인 시 인라인 안내 후 리다이렉트)
- DRAFT → PENDING → APPROVED → PUBLISHED 상태 흐름
- 티켓 타입 다중 등록 (일반, VIP, 얼리버드) 및 수량·잔여 관리

### 4. 공연 상세 페이지

- 티켓 타입별 가격·잔여 수량 표시
- 예매 기능 (로그인 필요, callbackUrl 자동 처리)
- 공연장 & 밴드 연결 정보 표시

### 5. 사용자 기능

- 마이페이지 — 예매 내역, 북마크, 프로필 수정
- 공연, 공연장, 밴드 북마크
- 이메일 로그인 (NextAuth.js Credentials Provider, JWT session)

### 6. 주최자(Organizer) 기능

- 밴드 및 공연 직접 등록, 수정, 삭제
- 등록 공연의 상태 추적 및 예매자 목록 확인
- 공연 포스터 및 티켓 디자인 후 배포

### 7. 관리자(Admin) 기능

- 공연 승인 / 반려 / 게시
- 공연장 인증, 사용자 역할 변경
- 신고 처리, 공지사항 작성
- 대시보드 통계 (전체 유저, 공연, 미승인, 오픈 신고 수)

---

## Page Images
- MainPage 
<img width="1288" height="719" alt="밴드스테이지메인1" src="https://github.com/user-attachments/assets/b9ad1379-5d54-4d26-8c1b-68cbc8003ee7" />
<img width="1288" height="719" alt="밴드스테이지메인2" src="https://github.com/user-attachments/assets/5b376d4a-42f0-4913-95e6-805d4eff1e5c" />
<img width="1288" height="719" alt="밴드스테이지메인3" src="https://github.com/user-attachments/assets/02b099b6-5817-422a-9896-15ae2d5ce10e" />


- Performances Page
<img width="1288" height="719" alt="밴드스테이지공연검색1" src="https://github.com/user-attachments/assets/2bf45ac6-9363-4ec3-8a38-c081f6f2dfb7" />
<img width="1288" height="719" alt="밴드스테이지공연검색2" src="https://github.com/user-attachments/assets/5c15781c-60eb-4746-9a0b-bfc93250de54" />
<img width="1288" height="719" alt="밴드스테이지공연검색3" src="https://github.com/user-attachments/assets/3b2c19db-aac1-4032-839a-9be2a02908d9" />



- Venues Page
<img width="1288" height="719" alt="밴드스테이지공연장1" src="https://github.com/user-attachments/assets/bbd9abb7-2064-4a0f-bd22-96d6b2c2aa6c" />
<img width="1288" height="719" alt="밴드스테이지공연장2" src="https://github.com/user-attachments/assets/94044721-be44-4f67-afd6-ebd987236aeb" />
<img width="1288" height="719" alt="밴드스테이지공연장3" src="https://github.com/user-attachments/assets/35a28619-928b-4d20-ad13-827f5104c68b" />

- Bands Page
<img width="1288" height="719" alt="밴드스테이지아티스트" src="https://github.com/user-attachments/assets/2695f34b-0a73-4ffa-aae1-f2e5edfc1b2e" />


- Search Page
<img width="1288" height="719" alt="밴드스테이지검색페이지" src="https://github.com/user-attachments/assets/065117b8-ac4f-45c5-ae07-5f8191172982" />


- Performances Upload Page
<img width="1288" height="719" alt="밴드스테이지공연등록1" src="https://github.com/user-attachments/assets/ec7f54d6-88c3-41a7-a6b9-dc1ceabfe16e" />
<img width="1288" height="719" alt="밴드스테이지공연등록2" src="https://github.com/user-attachments/assets/03d6e5c1-612b-4fd4-a47f-4c5dce352490" />



## Information Architecture

```
/
├── performances/            공연 목록 (장르 · 지역 필터)
│   └── [slug]/              공연 상세 + 예매
├── venues/                  공연장 목록 (유형 · 지역 필터)
│   └── [id]/                공연장 상세
├── bands/                   밴드 목록
│   └── [id]/                밴드 상세
├── search/                  통합 검색
├── regions/[slug]/          지역별 공연 · 공연장
│
├── mypage/
│   ├── reservations/        예매 내역
│   ├── bookmarks/           북마크
│   └── profile/             프로필 수정
│
├── organizer/
│   ├── performances/        내 공연 관리
│   │   └── new/             공연 등록
│   ├── bands/               내 밴드 관리
│   └── reservations/        예매자 목록
│
├── venue-manager/
│   ├── venues/              내 공연장 관리
│   └── schedule/            일정 관리
│
└── admin/
    ├── performances/        공연 승인 관리
    ├── venues/              공연장 인증
    ├── users/               역할 관리
    ├── reports/             신고 처리
    ├── notices/             공지사항
    └── taxonomy/            장르 · 지역 관리
```

---

## Tech Stack

### Frontend

- Next.js 15 (App Router, Server Components 우선)
- React 19
- Tailwind CSS v4
- NextAuth.js v4 (Credentials Provider, JWT session)

### Backend

- Next.js Server Actions (데이터 변경)
- Next.js API Routes (REST 엔드포인트)
- Zod (입력 유효성 검사)
- bcryptjs (비밀번호 해싱)

### Database

- Prisma ORM 6
- Supabase PostgreSQL 15

### Infrastructure

- Supabase (DB 호스팅, pgBouncer Connection Pooler)
- Vercel (배포)

---

## Database Structure

### 주요 모델

- User — 역할 기반 계정 (FAN / ARTIST / VENUE / ADMIN)
- Region — 계층형 지역 (국가 > 광역 > 구/군)
- Genre — 음악 장르 분류
- Venue — 공연장 (지역 · 관리자 연결)
- Band — 밴드 (장르 · 지역 · 멤버 연결)
- Event — 공연 (공연장 · 밴드 · 장르 · 지역 연결, 상태 흐름)
- TicketType — 티켓 종류 (가격 · 수량 · 잔여)
- Ticket — 예매 건별 발급 레코드
- Bookmark — 공연 · 공연장 · 밴드 북마크
- Report — 신고
- Notice — 공지사항
- AuditLog — 관리자 작업 이력

### 관계 구조

```
Region ──< Venue ──< Event ──< TicketType ──< Ticket
                       │
              Genre ───┤
                       │
              Band ────┘
               │
          BandMember
               │
             User
```

---

## Key Design Decision

### Region → Venue → Event → Reservation

대부분의 공연 플랫폼은 공연을 단독 엔티티로 취급한다.
BandStage는 공연장을 데이터 구조의 중심으로 설계했다.

- 공연(Event)은 반드시 공연장(Venue)에 속한다
- 공연장은 지역(Region)에 속한다
- 티켓과 예매는 공연 단위로 발생한다

이 구조 덕분에 "지역 → 공연장 → 공연" 순서로 자연스러운 탐색 흐름이 만들어진다.
단순 공연 목록 앱이 아니라, 오프라인 공연 생태계의 관계를 그대로 데이터로 표현한 플랫폼이다.

---

## Example User Flow

### 공연 탐색

```
홈 → 공연 목록
  → 지역 필터 (마포구) + 장르 필터 (인디 록) 선택
  → 공연 카드 클릭 → 상세 확인
  → 예매하기 클릭 (비로그인 → 로그인 후 원래 페이지로 복귀)
```

### 공연장 탐색

```
공연장 목록
  → 유형 (라이브클럽) + 지역 (홍대) 필터
  → 공연장 카드 클릭
  → 상세 정보 확인 + 네이버 지도 이동
  → 해당 공연장에서 열리는 공연 목록 확인
```

### 공연 등록

```
헤더 → 공연 업로드
  → 공연 정보 입력 (제목, 날짜, 공연장, 밴드, 티켓 타입)
  → 승인 요청 버튼 클릭
  → 비로그인 → 인라인 안내 → 로그인 후 자동 복귀
  → PENDING 등록 → 관리자 검토 → APPROVED → PUBLISHED
```

---

## Future Improvements

- 실시간 잔여 티켓 업데이트 (WebSocket 또는 SSE)
- 결제 시스템 연동 (토스페이먼츠)
- 공연장 지도 뷰 (카카오맵 API)
- 밴드 팔로우 및 신규 공연 알림
- 공연 리뷰 및 평점
- 관리자 대시보드 차트 시각화

---

## What I Focused On

- 도메인 모델링 — Region → Venue → Event → Reservation 구조로 오프라인 공연 생태계를 데이터로 표현
- 역할 기반 접근 제어 — 미들웨어와 서버 액션 두 레이어에서 이중 검증
- 서버 컴포넌트 우선 — 데이터 페칭을 서버에서 처리하고 클라이언트 번들 최소화
- 필터 URL 설계 — slug 기반 파라미터로 공유 가능한 URL 구현, DB 장애 시 정적 폴백으로 UI 유지
- 공연 상태 흐름 — DRAFT → PENDING → APPROVED → PUBLISHED → ARCHIVED 단계별 권한 분리

---

## Local Setup

```bash
git clone https://github.com/your-username/BandStage.git
cd BandStage
npm install
```

`.env` 파일 생성:

```env
DATABASE_URL="postgresql://postgres.[project]:[password]@[host]:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[project]:[password]@[host]:5432/postgres"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
```

```bash
npx prisma db push     # 스키마 적용
npx prisma generate    # Prisma Client 생성
npx tsx prisma/seed.ts # 시드 데이터 삽입
npm run dev
```

---

