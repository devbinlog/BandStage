# Band-Stage Platform

Band-Stage는 밴드 중심의 공연 기획·홍보·예매 경험을 한 곳에서 제공하기 위한 풀스택 앱입니다. 이 저장소는 Next.js(App Router) + Prisma + Supabase PostgreSQL + NextAuth 기반으로 구성되어 있으며, 대부분의 데이터 읽기/쓰기는 Server Component & Server Action에서 처리하고 필요 시 API Route Handler를 사용합니다.

## Tech Stack
- **Next.js 16 / React 19** – App Router, Server Component, Server Action 중심
- **Prisma ORM** – `src/generated/prisma`에 클라이언트가 생성됨
- **Supabase PostgreSQL** – Production/Postgres 호스팅(접속은 `DATABASE_URL`)
- **NextAuth (Auth.js)** – Google OAuth + Credentials, `User.role` 기반 접근 제어
- **Tailwind CSS v4** – 전역 스타일 및 컴포넌트 스타일링
- **Vercel Deployment** – Node.js 런타임, 필요 시 Edge Function/Serverless 병행

## Local Development
1. **환경 변수 준비**
   ```bash
   cp .env.local.example .env.local
   # DATABASE_URL, NEXTAUTH_SECRET 등을 실제 값으로 채워 넣기
   ```
   - Supabase 프로젝트에서 `Connection string`을 복사해 `DATABASE_URL`/`DIRECT_URL`에 입력합니다.
   - `NEXTAUTH_SECRET`는 최소 16자 이상의 랜덤 문자열을 사용하세요 (`openssl rand -base64 32`).
   - Google OAuth를 사용할 경우 `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`을 발급 받아 입력합니다.

2. **의존성 설치 & Prisma Client 생성**
   ```bash
   npm install
   npm run db:generate   # prisma generate
   ```

3. **DB 동기화**
   로컬 개발 시 스키마를 DB에 반영하려면:
   ```bash
   npm run db:push       # prisma db push
   # 혹은 마이그레이션을 생성하려면 npm run db:migrate
   ```

4. **개발 서버 실행**
   ```bash
   npm run dev
   ```

## Auth & 보안
- `src/auth.ts`에서 NextAuth가 설정되어 있으며, Google OAuth와 Credentials Provider(이메일/비밀번호 해시) 모두 지원합니다.
- `types/next-auth.d.ts`에서 Session/JWT 타입을 확장하여 `user.role`과 `user.id`를 everywhere에서 사용할 수 있습니다.
- `middleware.ts`는 `/me`, `/events/new`, `/admin` 경로를 기본 보호 대상으로 지정합니다. 필요 시 matcher 배열을 확장하세요.
- 서버 전용 환경 변수는 `src/lib/env.ts`의 Zod 스키마를 통과해야 하며, 부족한 값이 있으면 애플리케이션이 부팅되지 않습니다.

## Server Actions & API
- `src/server/actions/venue-suggestions.ts` 예시처럼 Server Action을 기본으로 사용하고, 클라이언트 폼에서 직접 호출할 수 있습니다.
- 재사용 가능한 입력 검증은 `src/lib/validators` 폴더에 추가하세요.
- API Route Handler가 필요하다면 `src/app/api/*` 경로에 생성하고, 가능하면 `auth()` 또는 NextAuth 미들웨어를 이용해 보호합니다.

## 배포(Vercel)
1. Vercel 프로젝트를 생성하고 GitHub 저장소를 연결합니다.
2. Vercel 환경 변수 탭에 `.env.local`과 동일한 키를 입력합니다. (Production/Preview/Development 환경을 각각 분리)
3. `npm run db:migrate`로 Supabase에 스키마를 적용한 후 배포합니다.
4. 커스텀 도메인은 Vercel Dashboard에서 연결하면 됩니다.

## 유용한 npm 스크립트
| 명령어 | 설명 |
| --- | --- |
| `npm run dev` | 로컬 개발 서버 (Next.js) |
| `npm run build` | 프로덕션 빌드 |
| `npm run lint` / `npm run lint:fix` | ESLint 검사/자동수정 |
| `npm run db:generate` | Prisma Client 재생성 |
| `npm run db:push` | Prisma 스키마를 DB에 반영 (테이블 생성/수정) |
| `npm run db:migrate` | 마이그레이션 생성 및 적용 |
| `npm run db:studio` | Prisma Studio 실행 |

## 다음 단계
- /, /venues, /events, /bands 등 메인 페이지 UI 구성
- 서버 액션을 각 폼(공연장 제보, 공연 등록 등)에 연결
- 역할(Role) 기반 관리자/아티스트/팬 경험 강화

필요한 추가 설정이나 자동화가 있다면 `/docs` 디렉터리를 만들어 확장할 수 있습니다.
