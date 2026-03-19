import { Suspense } from "react";
import { getPerformances } from "@/server/queries/performances";
import { getAllRegionsFlat } from "@/server/queries/regions";
import { db } from "@/lib/prisma";
import { PerformanceCard } from "@/components/shared/PerformanceCard";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { SearchBar } from "@/components/forms/SearchBar";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "공연 | Band-Stage",
  description: "밴드 공연 전체 목록",
};

interface PageProps {
  searchParams: Promise<{
    q?: string;
    genreId?: string;
    regionId?: string;
    page?: string;
  }>;
}

export default async function PerformancesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1");

  const [result, genres, regions] = await Promise.all([
    getPerformances({
      q: params.q,
      genreId: params.genreId,
      regionId: params.regionId,
      page,
      limit: 12,
    }),
    db.genre.findMany({ orderBy: { sortOrder: "asc" } }),
    getAllRegionsFlat(),
  ]);

  const cityRegions = regions.filter((r) => r.level === 2);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-bold text-[#0b1021]">모든 공연</h1>
        <p className="mt-2 text-gray-500">
          {result.meta.total.toLocaleString()}개의 공연이 있습니다.
        </p>
      </header>

      {/* 검색 + 필터 */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
        <SearchBar placeholder="공연 이름 검색..." defaultValue={params.q} />

        <div className="flex flex-wrap gap-3">
          {/* 장르 필터 */}
          <div className="flex flex-wrap gap-2">
            <Link
              href="/performances"
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                !params.genreId
                  ? "border-[#0d28c4] bg-[#0d28c4] text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:border-[#0d28c4]/50"
              }`}
            >
              전체 장르
            </Link>
            {genres.map((genre) => {
              const isActive = params.genreId === genre.id;
              const sp = new URLSearchParams();
              if (params.q) sp.set("q", params.q);
              if (params.regionId) sp.set("regionId", params.regionId);
              if (!isActive) sp.set("genreId", genre.id);
              return (
                <Link
                  key={genre.id}
                  href={`/performances?${sp.toString()}`}
                  className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                    isActive
                      ? "border-[#0d28c4] bg-[#0d28c4] text-white"
                      : "border-gray-200 bg-white text-gray-600 hover:border-[#0d28c4]/50"
                  }`}
                >
                  {genre.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* 지역 필터 */}
        {cityRegions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Link
              href="/performances"
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                !params.regionId
                  ? "border-[#0d28c4] bg-[#0d28c4] text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:border-[#0d28c4]/50"
              }`}
            >
              전체 지역
            </Link>
            {cityRegions.slice(0, 8).map((region) => {
              const isActive = params.regionId === region.id;
              const sp = new URLSearchParams();
              if (params.q) sp.set("q", params.q);
              if (params.genreId) sp.set("genreId", params.genreId);
              if (!isActive) sp.set("regionId", region.id);
              return (
                <Link
                  key={region.id}
                  href={`/performances?${sp.toString()}`}
                  className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                    isActive
                      ? "border-[#0d28c4] bg-[#0d28c4] text-white"
                      : "border-gray-200 bg-white text-gray-600 hover:border-[#0d28c4]/50"
                  }`}
                >
                  {region.name}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* 공연 그리드 */}
      {result.items.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {result.items.map((performance) => (
            <PerformanceCard
              key={performance.id}
              performance={{
                ...performance,
                ticketTypes: performance.ticketTypes.map((tt) => ({
                  price: tt.price ? Number(tt.price) : null,
                })),
              }}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="🎸"
          title="공연이 없습니다"
          description="조건에 맞는 공연을 찾지 못했습니다."
        />
      )}

      <Suspense fallback={null}>
        <Pagination totalPages={result.meta.totalPages} currentPage={page} />
      </Suspense>
    </div>
  );
}
