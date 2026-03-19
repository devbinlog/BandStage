"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

interface PaginationProps {
  totalPages: number;
  currentPage: number;
}

export function Pagination({ totalPages, currentPage }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const buildHref = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    return `${pathname}?${params.toString()}`;
  };

  // 표시할 페이지 번호 범위 (현재 ±2)
  const pages: number[] = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  const baseBtn =
    "flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm transition-colors";
  const activeBtn = `${baseBtn} bg-[#0d28c4] text-white font-medium`;
  const inactiveBtn = `${baseBtn} border border-gray-200 bg-white text-gray-700 hover:bg-gray-50`;
  const disabledBtn = `${baseBtn} border border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed`;

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="페이지네이션">
      {/* 이전 */}
      {currentPage > 1 ? (
        <Link href={buildHref(currentPage - 1)} className={inactiveBtn} aria-label="이전 페이지">
          ←
        </Link>
      ) : (
        <span className={disabledBtn} aria-disabled>←</span>
      )}

      {/* 첫 페이지 + 생략 */}
      {start > 1 && (
        <>
          <Link href={buildHref(1)} className={inactiveBtn}>1</Link>
          {start > 2 && <span className="text-gray-400 text-sm">…</span>}
        </>
      )}

      {/* 페이지 번호 */}
      {pages.map((p) => (
        <Link
          key={p}
          href={buildHref(p)}
          className={p === currentPage ? activeBtn : inactiveBtn}
          aria-current={p === currentPage ? "page" : undefined}
        >
          {p}
        </Link>
      ))}

      {/* 마지막 페이지 + 생략 */}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="text-gray-400 text-sm">…</span>}
          <Link href={buildHref(totalPages)} className={inactiveBtn}>{totalPages}</Link>
        </>
      )}

      {/* 다음 */}
      {currentPage < totalPages ? (
        <Link href={buildHref(currentPage + 1)} className={inactiveBtn} aria-label="다음 페이지">
          →
        </Link>
      ) : (
        <span className={disabledBtn} aria-disabled>→</span>
      )}
    </nav>
  );
}
