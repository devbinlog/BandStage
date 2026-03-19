import Link from "next/link";
import { globalSearch } from "@/server/queries/search";
import { SearchBar } from "@/components/forms/SearchBar";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "통합 검색 | Band-Stage",
};

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q = "" } = await searchParams;
  const results = q ? await globalSearch(q, 10) : null;

  const totalCount = results
    ? results.performances.length + results.venues.length + results.bands.length
    : 0;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-bold text-[#0b1021]">통합 검색</h1>
      </header>

      <SearchBar
        placeholder="공연, 공연장, 밴드 검색..."
        defaultValue={q}
      />

      {q && (
        <p className="text-sm text-gray-500">
          &quot;{q}&quot; 검색 결과 {totalCount}건
        </p>
      )}

      {results && (
        <div className="space-y-8">
          {/* 공연 결과 */}
          {results.performances.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-[#0b1021]">
                공연 ({results.performances.length})
              </h2>
              <div className="space-y-2">
                {results.performances.map((p) => (
                  <Link
                    key={p.id}
                    href={`/performances/${p.slug}`}
                    className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 hover:border-[#0d28c4]/40 transition-colors"
                  >
                    <div className="h-12 w-12 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100">
                      {p.coverImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.coverImage} alt={p.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xl">🎸</div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-[#0b1021] truncate">{p.title}</p>
                      <p className="text-xs text-gray-400">
                        {formatDate(p.startsAt)}
                        {p.genre && ` · ${p.genre.name}`}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              <Link href={`/performances?q=${encodeURIComponent(q)}`} className="text-sm text-[#0d28c4] hover:underline">
                공연 전체 보기 →
              </Link>
            </section>
          )}

          {/* 공연장 결과 */}
          {results.venues.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-[#0b1021]">
                공연장 ({results.venues.length})
              </h2>
              <div className="space-y-2">
                {results.venues.map((v) => (
                  <Link
                    key={v.id}
                    href={`/venues/${v.slug}`}
                    className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 hover:border-[#0d28c4]/40 transition-colors"
                  >
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-slate-50 to-blue-100 text-xl">
                      🏟
                    </div>
                    <div>
                      <p className="font-medium text-[#0b1021]">{v.name}</p>
                      <p className="text-xs text-gray-400">
                        {[v.district, v.city].filter(Boolean).join(", ")}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              <Link href={`/venues?q=${encodeURIComponent(q)}`} className="text-sm text-[#0d28c4] hover:underline">
                공연장 전체 보기 →
              </Link>
            </section>
          )}

          {/* 밴드 결과 */}
          {results.bands.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-[#0b1021]">
                밴드 ({results.bands.length})
              </h2>
              <div className="space-y-2">
                {results.bands.map((b) => (
                  <Link
                    key={b.id}
                    href={`/bands/${b.id}`}
                    className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 hover:border-[#0d28c4]/40 transition-colors"
                  >
                    <div className="h-12 w-12 flex-shrink-0 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-200">
                      {b.profileImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={b.profileImage} alt={b.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xl">🎸</div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-[#0b1021]">{b.name}</p>
                      {b.genre && (
                        <p className="text-xs text-gray-400">{b.genre.name}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
              <Link href={`/bands?q=${encodeURIComponent(q)}`} className="text-sm text-[#0d28c4] hover:underline">
                밴드 전체 보기 →
              </Link>
            </section>
          )}

          {totalCount === 0 && (
            <div className="py-20 text-center">
              <p className="text-5xl mb-4">🔍</p>
              <p className="text-lg font-semibold text-[#0b1021]">검색 결과가 없습니다</p>
              <p className="text-sm text-gray-400 mt-2">다른 검색어를 시도해 보세요.</p>
            </div>
          )}
        </div>
      )}

      {!q && (
        <div className="py-20 text-center">
          <p className="text-5xl mb-4">🎵</p>
          <p className="text-lg font-semibold text-[#0b1021]">공연, 공연장, 밴드를 검색하세요</p>
          <p className="text-sm text-gray-400 mt-2">원하는 키워드를 입력해 찾아보세요.</p>
        </div>
      )}
    </div>
  );
}
