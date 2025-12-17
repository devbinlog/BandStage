import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // 임시로 미들웨어 비활성화 - 데이터베이스 연결 문제 해결 전까지
  // 모든 요청을 통과시킴
  return NextResponse.next();
}

export const config = {
  matcher: ["/me/:path*", "/events/new", "/admin/:path*"],
};
