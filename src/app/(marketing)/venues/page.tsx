import { Suspense } from "react";
import Link from "next/link";
import { getVenues } from "@/server/queries/venues";
import { getAllRegionsFlat, getRegionBySlug } from "@/server/queries/regions";
import { VenueCard } from "@/components/shared/VenueCard";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { SearchBar } from "@/components/forms/SearchBar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "공연장 | Band-Stage",
  description: "밴드 공연을 위한 공연장 목록",
};

const VENUE_TYPES = [
  { value: "LIVE_CLUB", label: "라이브클럽" },
  { value: "CONCERT_HALL", label: "공연홀" },
  { value: "OUTDOOR", label: "야외" },
  { value: "MULTIPLEX", label: "복합공간" },
  { value: "BAR", label: "바/카페" },
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
    venueType?: string;
    region?: string;
    page?: string;
  }>;
}

export default async function VenuesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1");
  const regionSlug = params.region;

  const [regionRecord, dbRegions] = await Promise.all([
    regionSlug ? getRegionBySlug(regionSlug) : Promise.resolve(null),
    getAllRegionsFlat(),
  ]);

  const allRegions = dbRegions.length > 0 ? dbRegions : FALLBACK_REGIONS;
  const displayRegions = allRegions.filter((r) => r.level <= 2);

  const result = await getVenues({
    q: params.q,
    venueType: params.venueType as "LIVE_CLUB" | "CONCERT_HALL" | "OUTDOOR" | "MULTIPLEX" | "BAR" | "OTHER" | undefined,
    regionId: regionRecord?.id,
    page,
    limit: 12,
  });

  function buildUrl(overrides: Record<string, string | undefined>) {
    const sp = new URLSearchParams();
    const base = {
      ...(params.q && { q: params.q }),
      ...(params.venueType && { venueType: params.venueType }),
      ...(regionSlug && { region: regionSlug }),
    };
    const merged = { ...base, ...overrides };
    for (const [k, v] of Object.entries(merged)) {
      if (v) sp.set(k, v);
    }
    return `/venues?${sp.toString()}`;
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-bold text-[#0b1021]">공연장 가이드</h1>
        <p className="mt-2 text-gray-500">
          {result.meta.total > 0
            ? `${result.meta.total.toLocaleString()}개의 공연장`
            : "공연장 목록을 불러오고 있습니다."}
        </p>
      </header>

      {/* 검색 + 필터 */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-5">
        <SearchBar placeholder="공연장 이름이나 주소 검색..." defaultValue={params.q} />

        {/* 공연장 유형 */}
        <div>
          <p className="text-xs font-medium text-gray-400 mb-2">공연장 유형</p>
          <div className="flex flex-wrap gap-2">
            <Link
              href={buildUrl({ venueType: undefined })}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                !params.venueType
                  ? "border-[#0d28c4] bg-[#0d28c4] text-white"
                  : "border-gray-200 text-gray-600 hover:border-[#0d28c4]/50"
              }`}
            >
              전체
            </Link>
            {VENUE_TYPES.map((type) => {
              const isActive = params.venueType === type.value;
              return (
                <Link
                  key={type.value}
                  href={buildUrl({ venueType: isActive ? undefined : type.value })}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    isActive
                      ? "border-[#0d28c4] bg-[#0d28c4] text-white"
                      : "border-gray-200 text-gray-600 hover:border-[#0d28c4]/50"
                  }`}
                >
                  {type.label}
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
        {(regionSlug || params.venueType) && (
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-100">
            <span className="text-xs text-gray-400">필터:</span>
            {params.venueType && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs text-[#0d28c4]">
                {VENUE_TYPES.find((t) => t.value === params.venueType)?.label}
                <Link href={buildUrl({ venueType: undefined })} className="ml-0.5 hover:text-red-500">×</Link>
              </span>
            )}
            {regionSlug && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs text-[#0d28c4]">
                {displayRegions.find((r) => r.slug === regionSlug)?.name ?? regionSlug}
                <Link href={buildUrl({ region: undefined })} className="ml-0.5 hover:text-red-500">×</Link>
              </span>
            )}
            <Link href="/venues" className="ml-auto text-xs text-gray-400 hover:text-red-400">
              전체 초기화
            </Link>
          </div>
        )}
      </div>

      {/* 공연장 그리드 */}
      {result.items.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {result.items.map((venue) => (
            <VenueCard key={venue.id} venue={venue} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="🏟"
          title="공연장이 없습니다"
          description={
            regionSlug || params.venueType
              ? "해당 조건의 공연장을 찾지 못했습니다. 필터를 변경해보세요."
              : "등록된 공연장이 없습니다."
          }
        />
      )}

      <Suspense fallback={null}>
        <Pagination totalPages={result.meta.totalPages} currentPage={page} />
      </Suspense>
    </div>
  );
}
