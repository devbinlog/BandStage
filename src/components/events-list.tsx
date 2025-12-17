import Link from "next/link";

// 임시 목업 데이터 (데이터베이스 연결 없이도 작동)
const mockEvents = [
  {
    id: "1",
    slug: "band-stage-launch",
    title: "Band-Stage Launch Showcase",
    status: "PUBLISHED",
    startsAt: new Date("2024-12-15T19:30:00"),
    band: {
      name: "Parallel Echo",
    },
    venue: {
      name: "홍대 롤링홀",
    },
    ticketTypes: [
      {
        price: 35000,
      },
    ],
  },
  {
    id: "2",
    slug: "indie-pulse-2025",
    title: "Indie Pulse 2025",
    status: "APPROVED",
    startsAt: new Date("2024-12-20T18:00:00"),
    band: {
      name: "Soul Engine",
    },
    venue: {
      name: "이태원 Vurt",
    },
    ticketTypes: [
      {
        price: 40000,
      },
    ],
  },
  {
    id: "3",
    slug: "past-event",
    title: "Past Event Example",
    status: "CLOSED",
    startsAt: new Date("2024-11-01T19:00:00"),
    band: {
      name: "Example Band",
    },
    venue: {
      name: "예시 공연장",
    },
    ticketTypes: [
      {
        price: 30000,
      },
    ],
  },
];

export async function EventsList() {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("ko-KR", {
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return { label: "예매중", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", glow: "" };
      case "APPROVED":
        return { label: "예정", color: "text-[#0d28c4]", bg: "bg-[#0d28c4]/10", border: "border-[#0d28c4]/30", glow: "" };
      case "CLOSED":
        return { label: "마감", color: "text-gray-500", bg: "bg-gray-100", border: "border-gray-300", glow: "" };
      default:
        return { label: "대기", color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200", glow: "" };
    }
  };

  let events: typeof mockEvents = [];

  // 서버 사이드에서만 Prisma 사용
  if (typeof window === "undefined") {
    try {
      // 데이터베이스에서 공연 목록 가져오기 시도
      const { db } = await import("@/lib/prisma");
      
      events = await db.event.findMany({
        where: {
          status: {
            in: ["PUBLISHED", "APPROVED"],
          },
        },
        include: {
          venue: {
            select: {
              id: true,
              name: true,
              addressLine1: true,
            },
          },
          band: {
            select: {
              id: true,
              name: true,
            },
          },
          ticketTypes: {
            orderBy: {
              price: "asc",
            },
            take: 1,
          },
        },
        orderBy: {
          startsAt: "asc",
        },
        take: 20,
      });
    } catch (error: any) {
      console.error("EventsList error:", error);
      // 데이터베이스 연결 실패 시 목업 데이터 사용
      console.log("Using mock data due to database connection error");
      events = mockEvents;
    }
  } else {
    // 클라이언트 사이드에서는 목업 데이터 사용
    events = mockEvents;
  }

  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
        예정된 공연이 없습니다.
      </div>
    );
  }

  return (
    <section className="space-y-3">
      {events.map((event) => {
        const statusInfo = getStatusInfo(event.status);
        
        return (
          <Link
            key={event.id}
            href={`/events/${event.slug}`}
            className="group block rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-[#0d28c4]/50 hover:bg-gray-50 hover:shadow-md"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              {/* 좌측: 텍스트 정보 */}
              <div className="flex-1 space-y-1">
                <h2 className="text-xl font-bold text-[#0b1021] group-hover:text-[#0d28c4] transition-colors">
                  {event.title}
                </h2>
                {event.band && (
                  <p className="text-sm font-medium text-gray-600">{event.band.name}</p>
                )}
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                  <span>{formatDate(event.startsAt)}</span>
                  {event.venue && (
                    <>
                      <span>·</span>
                      <span>{event.venue.name}</span>
                    </>
                  )}
                </div>
              </div>
              
              {/* 우측: 상태 태그 */}
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${statusInfo.color} ${statusInfo.bg} ${statusInfo.border} ${statusInfo.glow}`}
                >
                  {statusInfo.label}
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </section>
  );
}
