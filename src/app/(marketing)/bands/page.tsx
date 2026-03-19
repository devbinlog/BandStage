import { Suspense } from "react";
import Link from "next/link";
import { getBands } from "@/server/queries/bands";
import { getGenres } from "@/server/queries/taxonomy";
import { BandCard } from "@/components/shared/BandCard";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { SearchBar } from "@/components/forms/SearchBar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "밴드 | Band-Stage",
  description: "Band-Stage의 모든 밴드",
};

interface PageProps {
  searchParams: Promise<{
    q?: string;
    genreId?: string;
    page?: string;
  }>;
}

export default async function BandsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1");

  const [result, genres] = await Promise.all([
    getBands({
      q: params.q,
      genreId: params.genreId,
      page,
      limit: 12,
    }),
    getGenres(),
  ]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-bold text-[#0b1021]">밴드</h1>
        <p className="mt-2 text-gray-500">
          {result.meta.total.toLocaleString()}개의 밴드
        </p>
      </header>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
        <SearchBar placeholder="밴드 이름 검색..." defaultValue={params.q} />

        <div className="flex flex-wrap gap-2">
          <Link
            href="/bands"
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
              !params.genreId
                ? "border-[#0d28c4] bg-[#0d28c4] text-white"
                : "border-gray-200 text-gray-600 hover:border-[#0d28c4]/50"
            }`}
          >
            전체 장르
          </Link>
          {genres.map((genre) => {
            const isActive = params.genreId === genre.id;
            const sp = new URLSearchParams();
            if (params.q) sp.set("q", params.q);
            if (!isActive) sp.set("genreId", genre.id);
            return (
              <Link
                key={genre.id}
                href={`/bands?${sp.toString()}`}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  isActive
                    ? "border-[#0d28c4] bg-[#0d28c4] text-white"
                    : "border-gray-200 text-gray-600 hover:border-[#0d28c4]/50"
                }`}
              >
                {genre.name}
              </Link>
            );
          })}
        </div>
      </div>

      {result.items.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {result.items.map((band) => (
            <BandCard key={band.id} band={band} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="🎸"
          title="밴드가 없습니다"
          description="조건에 맞는 밴드를 찾지 못했습니다."
        />
      )}

      <Suspense fallback={null}>
        <Pagination totalPages={result.meta.totalPages} currentPage={page} />
      </Suspense>
    </div>
  );
}
