import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/prisma";
import { formatPrice, formatCapacity, formatDate } from "@/lib/utils";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

// slug 또는 id로 공연장 조회
async function findVenue(idOrSlug: string) {
  const include = {
    images: { orderBy: { sortOrder: "asc" as const } },
    region: true,
    manager: { select: { id: true, name: true } },
    events: {
      where: { status: "PUBLISHED" as const, startsAt: { gte: new Date() } },
      include: {
        band: { select: { id: true, name: true } },
        ticketTypes: { select: { price: true }, orderBy: { price: "asc" as const }, take: 1 },
      },
      orderBy: { startsAt: "asc" as const },
      take: 5,
    },
    _count: { select: { events: true } },
  };
  try {
    const bySlug = await db.venue.findUnique({ where: { slug: idOrSlug }, include });
    if (bySlug) return bySlug;
    return await db.venue.findUnique({ where: { id: idOrSlug }, include });
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const venue = await findVenue(id);
  if (!venue) return { title: "공연장을 찾을 수 없습니다." };
  return {
    title: `${venue.name} | Band-Stage`,
    description: venue.description ?? `${venue.name} 공연장 정보`,
  };
}

const VENUE_TYPE_LABEL: Record<string, string> = {
  LIVE_CLUB: "라이브클럽",
  CONCERT_HALL: "공연홀",
  OUTDOOR: "야외",
  MULTIPLEX: "복합공간",
  BAR: "바/카페",
  OTHER: "기타",
};

export default async function VenueDetailPage({ params }: PageProps) {
  const { id } = await params;
  const venue = await findVenue(id);

  if (!venue) notFound();

  return (
    <div className="space-y-6 pb-16">
      {/* 헤더 */}
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-[#0d28c4]/30 bg-[#0d28c4]/10 px-3 py-1 text-xs text-[#0d28c4]">
            {VENUE_TYPE_LABEL[venue.venueType] ?? "기타"}
          </span>
          {venue.isVerified && (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs text-emerald-700">
              ✓ 인증된 공연장
            </span>
          )}
        </div>
        <h1 className="text-3xl font-bold text-[#0b1021]">{venue.name}</h1>
        {venue.region && <p className="text-sm text-gray-500">📍 {venue.region.name}</p>}
      </header>

      {/* 이미지 */}
      {venue.images.length > 0 ? (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {venue.images.slice(0, 4).map((img, idx) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={idx}
              src={img.url}
              alt={img.caption ?? venue.name}
              className={`w-full rounded-xl object-cover shadow-sm ${
                idx === 0 ? "aspect-video sm:col-span-2" : "aspect-square"
              }`}
            />
          ))}
        </div>
      ) : (
        <div className="aspect-video rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
          <span className="text-6xl opacity-20">🏟</span>
        </div>
      )}

      {/* 기본 정보 */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-[#0b1021] mb-4">기본 정보</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {venue.addressLine1 && (
            <div>
              <p className="text-xs text-gray-400 mb-1">주소</p>
              <p className="text-sm text-[#0b1021]">{venue.addressLine1}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-gray-400 mb-1">수용 인원</p>
            <p className="text-sm text-[#0b1021]">
              {formatCapacity(venue.capacityMin, venue.capacityMax)}
            </p>
          </div>
          {venue.phone && (
            <div>
              <p className="text-xs text-gray-400 mb-1">전화번호</p>
              <a href={`tel:${venue.phone}`} className="text-sm text-[#0d28c4] hover:underline">
                {venue.phone}
              </a>
            </div>
          )}
          {venue.email && (
            <div>
              <p className="text-xs text-gray-400 mb-1">이메일</p>
              <a href={`mailto:${venue.email}`} className="text-sm text-[#0d28c4] hover:underline">
                {venue.email}
              </a>
            </div>
          )}
          <div>
            <p className="text-xs text-gray-400 mb-1">실내/야외</p>
            <p className="text-sm text-[#0b1021]">{venue.isIndoor ? "실내" : "야외"}</p>
          </div>
          {venue._count && (
            <div>
              <p className="text-xs text-gray-400 mb-1">총 공연 수</p>
              <p className="text-sm text-[#0b1021]">{venue._count.events}회</p>
            </div>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {venue.naverMapUrl && (
            <a
              href={venue.naverMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs text-green-700 hover:bg-green-100 transition-colors"
            >
              네이버 지도
            </a>
          )}
          {venue.website && (
            <a
              href={venue.website}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 transition-colors"
            >
              공식 사이트
            </a>
          )}
        </div>
      </div>

      {/* 소개 */}
      {venue.description && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-[#0b1021] mb-3">공연장 소개</h2>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {venue.description}
          </p>
        </div>
      )}

      {/* 태그 / 편의시설 */}
      {(venue.tags.length > 0 || venue.amenities.length > 0) && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
          {venue.tags.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-[#0b1021] mb-2">태그</p>
              <div className="flex flex-wrap gap-2">
                {venue.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-[#0d28c4]/20 bg-[#0d28c4]/5 px-2 py-1 text-xs text-[#0d28c4]">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          {venue.amenities.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-[#0b1021] mb-2">편의시설</p>
              <div className="flex flex-wrap gap-2">
                {venue.amenities.map((a) => (
                  <span key={a} className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                    ✓ {a}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 대관 정책 */}
      {venue.bookingPolicy && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-[#0b1021] mb-3">대관 정책</h2>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {venue.bookingPolicy}
          </p>
        </div>
      )}

      {/* 예정 공연 */}
      {venue.events.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#0b1021]">예정 공연</h2>
          <div className="space-y-3">
            {venue.events.map((event) => {
              const minPrice = event.ticketTypes[0]?.price ? Number(event.ticketTypes[0].price) : null;
              return (
                <Link
                  key={event.id}
                  href={`/performances/${event.slug}`}
                  className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 hover:border-[#0d28c4]/40 transition-colors"
                >
                  <div>
                    <p className="font-medium text-[#0b1021]">{event.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDate(event.startsAt)} · {event.band?.name}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-[#0d28c4]">
                    {formatPrice(minPrice)}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-xs text-gray-400">
        Band-Stage는 정보 안내만 제공하며, 대관은 공연장에 직접 문의해주세요.
        정보가 틀리면 <Link href="/venues/report" className="text-[#0d28c4] hover:underline">여기</Link>에서 제보할 수 있습니다.
      </div>
    </div>
  );
}
