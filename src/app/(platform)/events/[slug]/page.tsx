import Link from "next/link";
import { notFound } from "next/navigation";
import { EventTicketSelector } from "@/components/event-ticket-selector";

// 타입 정의
interface TicketType {
  id: string;
  name: string;
  description?: string;
  price: number | null;
  quantity: number;
  remaining: number;
  perUserLimit?: number;
  category?: string;
}

interface EventData {
  id: string;
  slug: string;
  title: string;
  summary?: string;
  description?: string;
  status: string;
  coverImage?: string | null;
  startsAt: Date | string;
  endsAt?: Date | string | null;
  genre?: string | null;
  ageLimit?: string | null;
  ticketNote?: string | null;
  venue?: {
    id: string;
    name: string;
    addressLine1?: string | null;
    slug?: string;
  } | null;
  band?: {
    id: string;
    name: string;
    slug?: string;
  } | null;
  ticketTypes?: TicketType[];
}

// 임시 목업 데이터
const mockEvents: Record<string, EventData> = {
  "band-stage-launch": {
    id: "1",
    slug: "band-stage-launch",
    title: "Band-Stage Launch Showcase",
    summary: "Band-Stage의 시작을 알리는 쇼케이스. 신곡과 협업 세션 공개",
    description:
      "<p>Band-Stage 플랫폼의 런칭을 기념하는 특별한 공연입니다. 다양한 밴드들이 함께하는 협업 무대와 신곡 발표가 예정되어 있습니다.</p><p>이번 공연에서는 새로운 플랫폼의 시작을 함께 축하하며, 특별 게스트와의 협업 무대도 선보일 예정입니다.</p>",
    status: "PUBLISHED",
    coverImage: "/event-poster-placeholder.jpg", // 포스터 이미지 경로
    startsAt: new Date("2024-12-15T19:30:00"),
    endsAt: new Date("2024-12-15T22:00:00"),
    genre: "인디 록",
    ageLimit: "만 19세 이상",
    ticketNote: "현장 판매도 가능합니다.",
    venue: {
      id: "1",
      name: "홍대 롤링홀",
      addressLine1: "서울 마포구 어울마당로 35",
      slug: "rolling-hall",
    },
    band: {
      id: "1",
      name: "Parallel Echo",
      slug: "parallel-echo",
    },
    ticketTypes: [
      {
        id: "1",
        name: "일반",
        description: "일반 입장권",
        price: 35000,
        quantity: 200,
        remaining: 120,
        perUserLimit: 4,
      },
    ],
  },
};

interface EventDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { slug } = await params;

  let event: EventData | null = null;

  try {
    const { db } = await import("@/lib/prisma");
    const dbEvent = await db.event.findUnique({
      where: { slug },
      include: {
        venue: true,
        band: true,
        ticketTypes: {
          orderBy: { price: "asc" },
        },
      },
    });

    if (dbEvent) {
      event = {
        id: dbEvent.id,
        slug: dbEvent.slug,
        title: dbEvent.title,
        summary: dbEvent.summary || undefined,
        description: dbEvent.description || undefined,
        status: dbEvent.status,
        coverImage: dbEvent.coverImage || undefined,
        startsAt: dbEvent.startsAt,
        endsAt: dbEvent.endsAt || undefined,
        genre: dbEvent.genre || undefined,
        ageLimit: dbEvent.ageLimit || undefined,
        ticketNote: dbEvent.ticketNote || undefined,
        venue: dbEvent.venue
          ? {
              id: dbEvent.venue.id,
              name: dbEvent.venue.name,
              addressLine1: dbEvent.venue.addressLine1 || undefined,
              slug: dbEvent.venue.slug || undefined,
            }
          : undefined,
        band: dbEvent.band
          ? {
              id: dbEvent.band.id,
              name: dbEvent.band.name,
              slug: dbEvent.band.slug || undefined,
            }
          : undefined,
        ticketTypes: dbEvent.ticketTypes.map((tt) => ({
          id: tt.id,
          name: tt.name,
          description: tt.description || undefined,
          price: tt.price ? Number(tt.price) : null,
          quantity: tt.quantity,
          remaining: tt.remaining,
          perUserLimit: tt.perUserLimit || undefined,
          category: tt.category || undefined,
        })),
      };
    }
  } catch (error) {
    console.error("EventDetailPage error:", error);
  }

  // DB에서 찾지 못하면 mock 데이터 사용
  if (!event) {
    event = mockEvents[slug] || null;
  }

  if (!event) {
    notFound();
  }

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(dateObj);
  };

  const minPrice = event.ticketTypes?.[0]?.price;

  return (
    <div className="space-y-6 pb-24 sm:space-y-8">
      {/* Header */}
      <header className="space-y-3 sm:space-y-4">
        <h1 className="text-2xl font-bold text-[#0b1021] sm:text-3xl md:text-4xl">
          {event.title}
        </h1>
        {event.summary && (
          <p className="text-base text-gray-600 sm:text-lg">{event.summary}</p>
        )}
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 sm:gap-3 sm:text-sm">
          {event.band && (
            <Link
              href={`/bands/${event.band.slug || event.band.id}`}
              className="hover:text-[#0d28c4] transition-colors"
            >
              🎸 {event.band.name}
            </Link>
          )}
          {event.venue && (
            <>
              <span>·</span>
              <Link
                href={`/venues/${event.venue.slug || event.venue.id}`}
                className="hover:text-[#0d28c4] transition-colors"
              >
                🏟 {event.venue.name}
              </Link>
            </>
          )}
          {event.genre && (
            <>
              <span>·</span>
              <span>{event.genre}</span>
            </>
          )}
        </div>
      </header>

      {/* 포스터 이미지 섹션 */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        {event.coverImage ? (
          <div className="relative w-full aspect-[3/4] sm:aspect-[4/3] md:aspect-[16/9]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={event.coverImage}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="relative w-full aspect-[3/4] sm:aspect-[4/3] md:aspect-[16/9] bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
            <div className="text-center space-y-2">
              <p className="text-4xl">🎸</p>
              <p className="text-gray-500 text-sm">포스터 이미지</p>
            </div>
          </div>
        )}
      </div>

      {/* Info Section - 카드 형태 */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">날짜/시간</p>
            <p className="text-sm font-medium text-[#0b1021] break-words">
              {formatDate(event.startsAt)}
            </p>
            {event.endsAt && (
              <p className="text-xs text-gray-500 mt-1 break-words">
                ~ {formatDate(event.endsAt)}
              </p>
            )}
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">가격</p>
            <p className="text-sm font-medium text-[#0b1021]">
              {minPrice ? `₩${Number(minPrice).toLocaleString()}부터` : "무료"}
            </p>
          </div>
          <div className="sm:col-span-2 md:col-span-1">
            <p className="text-xs text-gray-500 mb-1">티켓 상태</p>
            <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
              {event.status === "PUBLISHED"
                ? "예매중"
                : event.status === "APPROVED"
                  ? "예정"
                  : "마감"}
            </span>
          </div>
        </div>
        {event.ageLimit && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              관람 연령: <span className="text-[#0b1021]">{event.ageLimit}</span>
            </p>
          </div>
        )}
        {event.venue?.addressLine1 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              장소: <span className="text-[#0b1021] break-words">{event.venue.addressLine1}</span>
            </p>
          </div>
        )}
      </div>

      {/* Description */}
      {event.description && (
        <div className="space-y-3 sm:space-y-4">
          <h2 className="text-xl font-bold text-[#0b1021] sm:text-2xl">공연 소개</h2>
          <div
            className="prose prose-sm sm:prose-base max-w-none text-gray-700 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
            dangerouslySetInnerHTML={{ __html: event.description }}
          />
        </div>
      )}

      {/* Ticket Section - 클라이언트 컴포넌트 사용 */}
      {event.ticketTypes && event.ticketTypes.length > 0 && (
        <EventTicketSelector
          ticketTypes={event.ticketTypes}
          eventSlug={event.slug}
          eventStatus={event.status}
          ticketNote={event.ticketNote}
        />
      )}
    </div>
  );
}
