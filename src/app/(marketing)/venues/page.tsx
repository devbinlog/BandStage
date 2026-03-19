import { Suspense } from "react";
import Link from "next/link";
import { getVenues } from "@/server/queries/venues";
import { getAllRegionsFlat } from "@/server/queries/regions";
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

interface PageProps {
  searchParams: Promise<{
    q?: string;
    venueType?: string;
    regionId?: string;
    page?: string;
  }>;
}

export default async function VenuesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1");

  const [result, regions] = await Promise.all([
    getVenues({
      q: params.q,
      venueType: params.venueType as "LIVE_CLUB" | "CONCERT_HALL" | "OUTDOOR" | "MULTIPLEX" | "BAR" | "OTHER" | undefined,
      regionId: params.regionId,
      page,
      limit: 12,
    }),
    getAllRegionsFlat(),
  ]);

  const cityRegions = regions.filter((r) => r.level === 2);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-bold text-[#0b1021]">공연장 가이드</h1>
        <p className="mt-2 text-gray-500">
          {result.meta.total.toLocaleString()}개의 공연장
        </p>
      </header>

      {/* 검색 + 필터 */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
        <SearchBar placeholder="공연장 이름이나 주소 검색..." defaultValue={params.q} />

        {/* 공연장 유형 필터 */}
        <div className="flex flex-wrap gap-2">
          <Link
            href="/venues"
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
              !params.venueType
                ? "border-[#0d28c4] bg-[#0d28c4] text-white"
                : "border-gray-200 text-gray-600 hover:border-[#0d28c4]/50"
            }`}
          >
            전체
          </Link>
          {VENUE_TYPES.map((type) => {
            const isActive = params.venueType === type.value;
            const sp = new URLSearchParams();
            if (params.q) sp.set("q", params.q);
            if (params.regionId) sp.set("regionId", params.regionId);
            if (!isActive) sp.set("venueType", type.value);
            return (
              <Link
                key={type.value}
                href={`/venues?${sp.toString()}`}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
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

        {/* 지역 필터 */}
        {cityRegions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Link
              href="/venues"
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                !params.regionId
                  ? "border-[#0d28c4] bg-[#0d28c4] text-white"
                  : "border-gray-200 text-gray-600 hover:border-[#0d28c4]/50"
              }`}
            >
              전체 지역
            </Link>
            {cityRegions.slice(0, 8).map((region) => {
              const isActive = params.regionId === region.id;
              const sp = new URLSearchParams();
              if (params.q) sp.set("q", params.q);
              if (params.venueType) sp.set("venueType", params.venueType);
              if (!isActive) sp.set("regionId", region.id);
              return (
                <Link
                  key={region.id}
                  href={`/venues?${sp.toString()}`}
                  className={`rounded-full border px-3 py-1 text-xs transition-colors ${
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
          description="조건에 맞는 공연장을 찾지 못했습니다."
        />
      )}

      <Suspense fallback={null}>
        <Pagination totalPages={result.meta.totalPages} currentPage={page} />
      </Suspense>
    </div>
  );
}
