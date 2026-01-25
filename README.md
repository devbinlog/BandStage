# BandStage

## Overview
BandStage는 인디 밴드와 소규모 공연 팀을 위한 공연 정보 관리 및 탐색 플랫폼입니다.  
분산되어 있던 공연 정보(포스터, 일정, 장소, 밴드 정보)를 하나의 흐름으로 통합하여  
공연 등록 → 공연 탐색 → 포스터/티켓 제작 및 홍보까지 이어지는 구조를 제공합니다.

## Problem
- 공연 정보가 SNS, 포스터, 메신저 등 여러 채널에 분산됨
- 밴드와 공연 팀은 관리가 어렵고, 관객은 탐색 비용이 큼
- 권한 분리(관리자/일반 사용자)가 명확하지 않은 경우가 많음

## Solution
- 공연(Event) 중심의 데이터 모델 설계
- 역할(Role) 기반 접근 제어로 관리와 조회 분리
- 환경 변수 검증과 인증 미들웨어를 통한 운영 안정성 확보

## Key Features
- 공연(Event) 등록 및 관리
- 밴드 및 장소 정보 관리
- Role 기반 인증과 인가
- 환경 변수 검증(Zod)
- Vercel 기반 배포 구조

## Tech Stack
Frontend  
- Next.js  
- TypeScript  
- Tailwind CSS  

Backend  
- Next.js API Routes  
- Prisma ORM  

Database  
- Supabase (PostgreSQL)

## Architecture
Client
↓
Next.js (App Router)
↓
API Routes (Auth / Event / Band)
↓
Prisma ORM
↓
Supabase DB


## Quick Start
``bash
git clone https://github.com/devbinlog/BandStage.git
cd BandStage
npm install
npm run dev
Environment Variables
DATABASE_URL=
NEXTAUTH_SECRET=
Project Structure
/app
/api
/components
/lib
/prisma
What I Focused On
권한(Role) 분리를 통한 데이터 접근 안정성 확보

환경 변수 누락 시 즉시 실패하도록 설계

실제 운영 가능한 서비스 구조 설계

## Future Work
1. 포스터/티켓 제작 기능 추가

2. 검색 성능 개선

3. 관리자 대시보드 고도화

