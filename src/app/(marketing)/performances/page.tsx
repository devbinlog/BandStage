import { Suspense } from "react";
import { getPerformances } from "@/server/queries/performances";
import { getGenres, getGenreBySlug } from "@/server/queries/taxonomy";
import { getAllRegionsFlat, getRegionBySlug } from "@/server/queries/regions";
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

// DB 없을 때 폴백 (시드 데이터와 동일한 slug 사용)
const FALLBACK_GENRES = [
  { id: "", name: "인디 록", slug: "indie-rock", color: "#e11d48" },
  { id: "", name: "얼터너티브", slug: "alternative", color: "#7c3aed" },
  { id: "", name: "재즈", slug: "jazz", color: "#d97706" },
  { id: "", name: "메탈", slug: "metal", color: "#374151" },
  { id: "", name: "포크", slug: "folk", color: "#065f46" },
  { id: "", name: "블루스", slug: "blues", color: "#1d4ed8" },
  { id: "", name: "펑크", slug: "funk", color: "#b45309" },
  { id: "", name: "일렉트로닉", slug: "electronic", color: "#0891b2" },
];

const FALLBACK_REGIONS = [
  { id: "", name: "서울 전체", slug: "seoul", level: 1 },
  { id: "", name: "마포구 (홍대/합정)", slug: "seoul-mapo", level: 2 },
  { id: "", name: "강남구", slug: "seoul-gangnam", level: 2 },
  { id: "", name: "용산구 (이태원)", slug: "seoul-yongsan", level: 2 },
  { id: "", name: "성동구 (성수)", slug: "seoul-seongdong", level: 2 },
  { id: "", name: "종로구", slug: "seoul-jongno", level: 2 },
  { id: "", name: "경기도", slug: "gyeonggi", level: 1 },
  { id: "", name: "부산", slug: "busan", level: 1 },
];

interface PageProps {
  searchParams: Promise<{
    q?: string;
    genre?: string;
    region?: string;
    page?: string;
  }>;
}

export default async function PerformancesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1");
  const genreSlug = params.genre;
  const regionSlug = params.region;

  // slug → ID 변환 + 필터 옵션 병렬 로딩
  const [genreRecord, regionRecord, dbGenres, dbRegions] = await Promise.all([
    genreSlug ? getGenreBySlug(genreSlug) : Promise.resolve(null),
    regionSlug ? getRegionBySlug(regionSlug) : Promise.resolve(null),
    getGenres(),
    getAllRegionsFlat(),
  ]);

  // DB 데이터 없으면 폴백 사용
  const genres = dbGenres.length > 0 ? dbGenres : FALLBACK_GENRES;
  const allRegions = dbRegions.length > 0 ? dbRegions : FALLBACK_REGIONS;

  // 지역 필터: 레벨 1(광역시/도) + 레벨 2(구/시)
  const displayRegions = allRegions.filter((r) => r.level <= 2);

  const result = await getPerformances({
    q: params.q,
    genreId: genreRecord?.id,
    regionId: regionRecord?.id,
    page,
    limit: 12,
  });

  // URL 파라미터 빌더 유틸 (slug 기반)
  function buildUrl(overrides: Record<string, string | undefined>) {
    const sp = new URLSearchParams();
    const base = {
      ...(params.q && { q: params.q }),
      ...(genreSlug && { genre: genreSlug }),
      ...(regionSlug && { region: regionSlug }),
    };
    const merged = { ...base, ...overrides };
    for (const [k, v] of Object.entries(merged)) {
      if (v) sp.set(k, v);
    }
    return `/performances?${sp.toString()}`;
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-bold text-[#0b1021]">모든 공연</h1>
        <p className="mt-2 text-gray-500">
          {result.meta.total > 0
            ? `${result.meta.total.toLocaleString()}개의 공연이 있습니다.`
            : "공연 목록을 불러오고 있습니다."}
        </p>
      </header>

      {/* 검색 + 필터 */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-5">
        <SearchBar placeholder="공연 이름 검색..." defaultValue={params.q} />

        {/* 장르 필터 */}
        <div>
          <p className="text-xs font-medium text-gray-400 mb-2">장르</p>
          <div className="flex flex-wrap gap-2">
            <Link
              href={buildUrl({ genre: undefined })}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                !genreSlug
                  ? "border-[#0d28c4] bg-[#0d28c4] text-white"
                  : "border-gray-200 text-gray-600 hover:border-[#0d28c4]/50"
              }`}
            >
              전체 장르
            </Link>
            {genres.map((genre) => {
              const isActive = genreSlug === genre.slug;
              return (
                <Link
                  key={genre.slug}
                  href={buildUrl({ genre: isActive ? undefined : genre.slug })}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    isActive ? "text-white" : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                  style={
                    isActive
                      ? { backgroundColor: genre.color ?? "#0d28c4", borderColor: genre.color ?? "#0d28c4" }
                      : undefined
                  }
                >
                  {genre.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* 지역 필터 */}
        <div>
          <p className="text-xs font-medium text-gray-400 mb-2">지역</p>
          <div className="flex flex-wrap gap-2">
            <Link
              href={buildUrl({ region: undefined })}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                !regionSlug
                  ? "border-[#0d28c4] bg-[#0d28c4] text-white"
                  : "border-gray-200 text-gray-600 hover:border-[#0d28c4]/50"
              }`}
            >
              전체 지역
            </Link>
            {displayRegions.map((region) => {
              const isActive = regionSlug === region.slug;
              return (
                <Link
                  key={region.slug}
                  href={buildUrl({ region: isActive ? undefined : region.slug })}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    isActive
                      ? "border-[#0d28c4] bg-[#0d28c4] text-white"
                      : "border-gray-200 text-gray-600 hover:border-[#0d28c4]/50"
                  }`}
                >
                  {region.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* 활성 필터 요약 */}
        {(genreSlug || regionSlug) && (
          <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
            <span className="text-xs text-gray-400">필터:</span>
            {genreSlug && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs text-[#0d28c4]">
                {genres.find((g) => g.slug === genreSlug)?.name ?? genreSlug}
                <Link href={buildUrl({ genre: undefined })} className="ml-0.5 hover:text-red-500">×</Link>
              </span>
            )}
            {regionSlug && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs text-[#0d28c4]">
                {displayRegions.find((r) => r.slug === regionSlug)?.name ?? regionSlug}
                <Link href={buildUrl({ region: undefined })} className="ml-0.5 hover:text-red-500">×</Link>
              </span>
            )}
            <Link href="/performances" className="ml-auto text-xs text-gray-400 hover:text-red-400">
              전체 초기화
            </Link>
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
          description={
            genreSlug || regionSlug
              ? "해당 조건의 공연을 찾지 못했습니다. 필터를 변경해보세요."
              : "등록된 공연이 없습니다."
          }
        />
      )}

      <Suspense fallback={null}>
        <Pagination totalPages={result.meta.totalPages} currentPage={page} />
      </Suspense>
    </div>
  );
}
