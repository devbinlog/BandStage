"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export function Header() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/performances", label: "공연" },
    { href: "/venues", label: "공연장" },
    { href: "/bands", label: "밴드" },
    { href: "/search", label: "검색" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          {/* 로고 */}
          <Link href="/" className="text-xl font-bold text-[#0b1021] hover:text-[#0d28c4] transition-colors">
            Band-Stage
          </Link>

          {/* 데스크톱 네비게이션 */}
          <nav className="hidden md:flex items-center gap-5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-gray-600 hover:text-[#0d28c4] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* 우측 액션 */}
          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <>
                <Link
                  href="/mypage"
                  className="text-sm text-gray-600 hover:text-[#0d28c4] transition-colors"
                >
                  {session.user?.name ?? session.user?.email}
                </Link>
                {(session.user?.role === "ARTIST" || session.user?.role === "ADMIN") && (
                  <Link
                    href="/organizer"
                    className="rounded-lg border border-[#0d28c4] px-3 py-1.5 text-xs font-medium text-[#0d28c4] hover:bg-[#0d28c4] hover:text-white transition-colors"
                  >
                    오거나이저
                  </Link>
                )}
                {session.user?.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="rounded-lg border border-orange-300 px-3 py-1.5 text-xs font-medium text-orange-600 hover:bg-orange-50 transition-colors"
                  >
                    관리자
                  </Link>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="rounded-full border border-gray-300 px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>

          {/* 모바일 햄버거 */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="메뉴"
          >
            <div className="space-y-1.5">
              <span className={`block h-0.5 w-5 bg-gray-700 transition-transform ${mobileOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block h-0.5 w-5 bg-gray-700 transition-opacity ${mobileOpen ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 w-5 bg-gray-700 transition-transform ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </div>
          </button>
        </div>

        {/* 모바일 메뉴 */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-6 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-sm text-gray-600 hover:text-[#0d28c4]"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-gray-100 space-y-2">
              {session ? (
                <>
                  <Link href="/mypage" className="block text-sm font-medium text-[#0b1021]" onClick={() => setMobileOpen(false)}>
                    마이페이지
                  </Link>
                  <button
                    onClick={() => { signOut({ callbackUrl: "/" }); setMobileOpen(false); }}
                    className="text-sm text-gray-500"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <div className="flex gap-3">
                  <Link href="/login" className="text-sm text-gray-600" onClick={() => setMobileOpen(false)}>
                    로그인
                  </Link>
                  <Link
                    href="/signup"
                    className="rounded-lg bg-[#0d28c4] px-4 py-1.5 text-sm font-medium text-white"
                    onClick={() => setMobileOpen(false)}
                  >
                    회원가입
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
