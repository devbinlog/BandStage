import Link from "next/link";
import { getUpcomingPerformances } from "@/server/queries/performances";
import { formatDate, formatPrice, getDday } from "@/lib/utils";

export default async function LandingPage() {
  let upcomingShows: Awaited<ReturnType<typeof getUpcomingPerformances>> = [];

  try {
    upcomingShows = await getUpcomingPerformances(6);
  } catch {
    // DB 연결 실패 시 빈 배열
  }

  const platformPillars = [
    {
      title: "밴드에게",
      description: "공연 등록, 대관 정보, 예매까지 한 흐름으로",
    },
    {
      title: "팬에게",
      description: "믿을 수 있는 공연 정보와 감성 있는 큐레이션",
    },
    {
      title: "씬 전체",
      description: "공연장 → 공연 → 밴드 → 팬을 잇는 인프라",
    },
  ];

  return (
    <div className="space-y-20">
      {/* 히어로 섹션 */}
      <section className="rounded-[32px] bg-gradient-to-br from-[#d4e5ff] via-[#f0f7ff] to-[#a8c2ff] p-8 sm:p-12">
        <div className="space-y-6 text-[#0b1021]">
          <p className="text-sm tracking-[0.6em] text-[#1f40b5]">PLATFORM FOR BANDS</p>
          <h1 className="text-4xl font-semibold leading-snug sm:text-5xl">
            많은 밴드의 공연과
            <br />
            여러 공연장들을 찾아보세요
          </h1>
          <p className="max-w-2xl text-lg text-[#334163]">
            공연 등록, 공연장 검색, 예매의 흐름까지 하나로 이어지는 공연 플랫폼.
            <br />
            수 많은 공연들을 만나보세요.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/performances"
              className="rounded-full bg-[#0d28c4] px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-[#0d28c4]/30 transition hover:translate-y-0.5"
            >
              공연 둘러보기
            </Link>
            <Link
              href="/venues"
              className="rounded-full border border-[#0d28c4] bg-white/60 px-6 py-2 text-sm font-semibold text-[#0d28c4] transition hover:translate-y-0.5"
            >
              공연장 찾기
            </Link>
            <Link
              href="/search"
              className="rounded-full border border-[#334163]/30 bg-white/40 px-6 py-2 text-sm font-semibold text-[#334163] transition hover:translate-y-0.5"
            >
              통합 검색
            </Link>
          </div>
        </div>
      </section>

      {/* 다가오는 공연 */}
      <section className="space-y-5">
        <header className="flex items-end justify-between">
          <div>
            <p className="text-xs tracking-[0.4em] text-[#5b6ba5]">UPCOMING</p>
            <h2 className="mt-1 text-2xl font-semibold text-[#0b1021]">다가오는 공연</h2>
          </div>
          <Link href="/performances" className="text-sm text-[#0d28c4] hover:underline">
            전체 보기 →
          </Link>
        </header>

        {upcomingShows.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingShows.map((show) => {
              const minPrice = show.ticketTypes[0]?.price ? Number(show.ticketTypes[0].price) : null;
              return (
                <Link
                  key={show.id}
                  href={`/performances/${show.slug}`}
                  className="group rounded-2xl border border-[#edf1ff] bg-[#f8f9ff] p-4 hover:border-[#0d28c4]/40 hover:shadow-md transition-all"
                >
                  <p className="text-xs text-[#5b6ba5]">{formatDate(show.startsAt)}</p>
                  <h3 className="mt-2 text-lg font-semibold text-[#0b1021] group-hover:text-[#0d28c4] transition-colors line-clamp-1">
                    {show.title}
                  </h3>
                  <p className="text-sm text-[#46506b]">
                    {show.band?.name ?? "—"} · {show.venue?.name ?? "—"}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="inline-flex rounded-full bg-[#0d28c4]/10 px-3 py-1 text-xs font-medium text-[#0d28c4]">
                      {getDday(show.startsAt)}
                    </span>
                    <span className="text-sm font-semibold text-[#0d28c4]">
                      {formatPrice(minPrice)}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-[#edf1ff] bg-[#f8f9ff] p-12 text-center">
            <p className="text-4xl mb-3">🎸</p>
            <p className="text-sm text-[#5b6ba5]">예정된 공연이 없습니다.</p>
          </div>
        )}
      </section>

      {/* 플랫폼 소개 */}
      <section className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-4 rounded-3xl border border-[#dfe6ff] bg-white p-6 shadow-sm">
          <p className="text-xs tracking-[0.4em] text-[#5b6ba5]">WHY</p>
          <h2 className="text-2xl font-semibold text-[#0b1021]">Band-Stage의 핵심</h2>
          <ul className="space-y-4">
            {platformPillars.map((pillar) => (
              <li key={pillar.title} className="rounded-2xl border border-[#f0f2ff] bg-[#f8f9ff] p-4">
                <p className="text-sm font-semibold text-[#0d28c4]">{pillar.title}</p>
                <p className="text-sm text-[#3a4665]">{pillar.description}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[32px] border border-[#dfe3fc] bg-gradient-to-br from-white to-[#f3f6ff] p-8">
          <div className="flex h-full flex-col justify-between gap-6">
            <div className="space-y-4">
              <p className="text-xs tracking-[0.5em] text-[#5b6ba5]">VENUE GUIDE</p>
              <h2 className="text-2xl font-semibold text-[#0b1021]">첫 공연을 준비 중인가요?</h2>
              <p className="text-sm text-[#3a4665]">
                서울의 라이브클럽과 복합 공연장을 한눈에 비교하고, 대관 조건 · 음향 · 분위기를 미리 파악하세요.
              </p>
              <ul className="space-y-3 pt-2">
                {[
                  "대관 비용과 시간대별 요금 정보 제공",
                  "음향 시스템과 무대 크기 상세 비교",
                  "수용 인원과 공연 분위기 미리보기",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-[#3a4665]">
                    <span className="mt-0.5 text-[#0d28c4]">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-end">
              <Link
                href="/venues"
                className="inline-flex w-fit rounded-full border border-[#0d28c4] px-6 py-2 text-sm font-semibold text-[#0d28c4] transition hover:bg-[#0d28c4] hover:text-white"
              >
                공연장 가이드 보기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-3xl bg-[#0b1021] p-8 sm:p-12 text-center space-y-4">
        <p className="text-xs tracking-[0.6em] text-[#5b7aff]">JOIN US</p>
        <h2 className="text-2xl font-semibold text-white sm:text-3xl">
          밴드, 공연장, 팬이 함께하는 공연 플랫폼
        </h2>
        <p className="text-sm text-gray-400">
          지금 바로 시작하세요. 아티스트와 공연장 파트너를 기다립니다.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link
            href="/signup"
            className="rounded-full bg-[#0d28c4] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#1436f5] transition-colors"
          >
            무료로 시작하기
          </Link>
          <Link
            href="/bands"
            className="rounded-full border border-white/20 px-6 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
          >
            밴드 둘러보기
          </Link>
        </div>
      </section>
    </div>
  );
}
