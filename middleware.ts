import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// 인증이 필요한 경로 패턴
const PROTECTED_PREFIXES = [
  "/mypage",
  "/organizer",
  "/venue-manager",
];

// 관리자 전용 경로
const ADMIN_PREFIXES = ["/admin"];

// 로그인 상태에서 접근 시 리다이렉트할 경로
const AUTH_PAGES = ["/login", "/signup"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // JWT 토큰 확인
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET ?? "default-secret-key-for-development-only-min-16-chars",
  });

  const isAuthenticated = !!token;
  const userRole = token?.role as string | undefined;

  // 로그인/회원가입 페이지: 이미 로그인된 경우 마이페이지로 리다이렉트
  if (AUTH_PAGES.some((p) => pathname.startsWith(p))) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/mypage", request.url));
    }
    return NextResponse.next();
  }

  // 관리자 전용 경로: ADMIN 역할만 접근 가능
  if (ADMIN_PREFIXES.some((p) => pathname.startsWith(p))) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // 보호된 경로: 로그인 필요
  if (PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) {
    // 공연 등록 페이지는 누구나 접근 가능 (제출 시 로그인 체크)
    if (pathname === "/organizer/performances/new") {
      return NextResponse.next();
    }

    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // organizer: ARTIST 또는 ADMIN만 접근
    if (pathname.startsWith("/organizer")) {
      if (userRole !== "ARTIST" && userRole !== "ADMIN") {
        return NextResponse.redirect(new URL("/mypage", request.url));
      }
    }

    // venue-manager: VENUE 또는 ADMIN만 접근
    if (pathname.startsWith("/venue-manager")) {
      if (userRole !== "VENUE" && userRole !== "ADMIN") {
        return NextResponse.redirect(new URL("/mypage", request.url));
      }
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/signup",
    "/mypage/:path*",
    "/organizer/:path*",
    "/venue-manager/:path*",
    "/admin/:path*",
  ],
};
