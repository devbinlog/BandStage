"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export function Header() {
  const { data: session } = useSession();
  
  // 모든 페이지를 밝은 테마로 통일
  const headerClasses = "sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm";
  const linkClasses = "text-sm text-gray-600 hover:text-gray-900";
  const logoClasses = "text-xl font-bold text-gray-900";
  const buttonClasses = "flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100";
  const userLinkClasses = "text-sm text-gray-600 hover:text-gray-900";
  const logoutButtonClasses = "rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50";

  return (
    <>
      <header className={headerClasses}>
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className={logoClasses}>
            Band-Stage
          </Link>
          
          <nav className="flex items-center gap-4">
            <Link href="/events" className={linkClasses}>
              공연
            </Link>
            <Link href="/venues" className={linkClasses}>
              공연장
            </Link>
            <Link href="/tickets/design" className={linkClasses}>
              티켓
            </Link>
            
            {session ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/me"
                  className={userLinkClasses}
                >
                  {session.user?.name || session.user?.email}
                </Link>
                <button
                  onClick={() => signOut()}
                  className={logoutButtonClasses}
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-sm text-gray-600 hover:text-[#0d28c4] transition-colors"
                >
                  로그인
                </Link>
                <Link
                  href="/signup"
                  className="rounded-lg bg-[#0d28c4] px-4 py-2 text-sm font-medium text-white hover:bg-[#0b1fb5] transition-colors"
                >
                  회원가입
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>
    </>
  );
}

