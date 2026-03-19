import { notFound } from "next/navigation";
import Link from "next/link";
import { getPerformanceBySlug } from "@/server/queries/performances";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDateTime, formatPrice } from "@/lib/utils";
import { auth } from "@/auth";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getPerformanceBySlug(slug);
  if (!event) return { title: "공연을 찾을 수 없습니다." };
  return {
    title: `${event.title} | Band-Stage`,
    description: event.summary ?? undefined,
  };
}

export default async function PerformanceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [event, session] = await Promise.all([
    getPerformanceBySlug(slug),
    auth(),
  ]);

  if (!event) notFound();

  const minPrice = event.ticketTypes[0]?.price ? Number(event.ticketTypes[0].price) : null;

  return (
    <div className="space-y-6 pb-24">
      {/* 헤더 */}
      <header className="space-y-3">
        <div className="flex items-center gap-2">
          <StatusBadge status={event.status} />
          {event.genre && (
            <span
              className="rounded-full px-3 py-1 text-xs font-medium text-white"
              style={{ backgroundColor: event.genre.color ?? "#0d28c4" }}
            >
              {event.genre.name}
            </span>
          )}
        </div>
        <h1 className="text-3xl font-bold text-[#0b1021] leading-snug">{event.title}</h1>
        {event.summary && <p className="text-lg text-gray-600">{event.summary}</p>}
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
          {event.band && (
            <Link href={`/bands/${event.band.id}`} className="hover:text-[#0d28c4] transition-colors">
              🎸 {event.band.name}
            </Link>
          )}
          {event.venue && (
            <>
              <span>·</span>
              <Link href={`/venues/${event.venue.slug}`} className="hover:text-[#0d28c4] transition-colors">
                📍 {event.venue.name}
              </Link>
            </>
          )}
          {event.region && <><span>·</span><span>{event.region.name}</span></>}
        </div>
      </header>

      {/* 커버 이미지 */}
      <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
        {event.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.coverImage}
            alt={event.title}
            className="w-full aspect-video object-cover"
          />
        ) : (
          <div className="aspect-video bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
            <span className="text-6xl opacity-20">🎸</span>
          </div>
        )}
      </div>

      {/* 공연 정보 카드 */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-gray-400 mb-1">공연 일시</p>
            <p className="text-sm font-medium text-[#0b1021]">{formatDateTime(event.startsAt)}</p>
            {event.endsAt && (
              <p className="text-xs text-gray-400 mt-0.5">~ {formatDateTime(event.endsAt)}</p>
            )}
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 mb-1">티켓 가격</p>
            <p className="text-sm font-medium text-[#0d28c4]">
              {minPrice !== null ? `${formatPrice(minPrice)}부터` : "무료"}
            </p>
          </div>
          {event.ageLimit && (
            <div>
              <p className="text-xs font-medium text-gray-400 mb-1">관람 연령</p>
              <p className="text-sm text-[#0b1021]">{event.ageLimit}</p>
            </div>
          )}
          {event.venue?.addressLine1 && (
            <div className="sm:col-span-2 md:col-span-3">
              <p className="text-xs font-medium text-gray-400 mb-1">장소</p>
              <p className="text-sm text-[#0b1021]">{event.venue.addressLine1}</p>
              {event.venue.naverMapUrl && (
                <a
                  href={event.venue.naverMapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex text-xs text-[#0d28c4] hover:underline"
                >
                  네이버 지도 보기 →
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 공연 소개 */}
      {event.description && (
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#0b1021]">공연 소개</h2>
          <div
            className="prose prose-sm max-w-none text-gray-700 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            dangerouslySetInnerHTML={{ __html: event.description }}
          />
        </section>
      )}

      {/* 티켓 구매 섹션 */}
      {event.ticketTypes.length > 0 && event.status === "PUBLISHED" && (
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#0b1021]">티켓 구매</h2>
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
            {event.ticketTypes.map((tt) => (
              <div
                key={tt.id}
                className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
              >
                <div>
                  <p className="font-medium text-[#0b1021]">{tt.name}</p>
                  {tt.description && (
                    <p className="text-xs text-gray-400">{tt.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    잔여 {tt.remaining.toLocaleString()}석 / {tt.quantity.toLocaleString()}석
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[#0d28c4]">
                    {tt.price ? formatPrice(Number(tt.price)) : "무료"}
                  </p>
                  {tt.remaining > 0 ? (
                    <Link
                      href={
                        session
                          ? `/events/${event.slug}/checkout`
                          : `/login?callbackUrl=/performances/${event.slug}`
                      }
                      className="mt-2 inline-flex rounded-lg bg-[#0d28c4] px-4 py-2 text-xs font-medium text-white hover:bg-[#0b1fb5] transition-colors"
                    >
                      {session ? "예매하기" : "로그인 후 예매"}
                    </Link>
                  ) : (
                    <span className="mt-2 inline-flex rounded-lg bg-gray-100 px-4 py-2 text-xs text-gray-400">
                      매진
                    </span>
                  )}
                </div>
              </div>
            ))}
            {event.ticketNote && (
              <p className="text-xs text-gray-400 mt-3 pt-3 border-t">📌 {event.ticketNote}</p>
            )}
          </div>
        </section>
      )}

      {/* 밴드 정보 */}
      {event.band && (
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#0b1021]">아티스트</h2>
          <Link
            href={`/bands/${event.band.id}`}
            className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:border-[#0d28c4]/40 transition-colors"
          >
            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center text-2xl flex-shrink-0">
              🎸
            </div>
            <div>
              <p className="font-semibold text-[#0b1021]">{event.band.name}</p>
              {event.band.genre && (
                <p className="text-sm text-gray-500">{event.band.genre.name}</p>
              )}
              {event.band.members.length > 0 && (
                <p className="text-xs text-gray-400">
                  {event.band.members.map((m) => m.name).join(", ")}
                </p>
              )}
            </div>
          </Link>
        </section>
      )}
    </div>
  );
}
