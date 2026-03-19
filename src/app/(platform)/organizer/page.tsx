import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/prisma";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "오거나이저 | Band-Stage",
};

export default async function OrganizerPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ARTIST" && session.user.role !== "ADMIN") {
    redirect("/mypage");
  }

  const [events, bands] = await Promise.all([
    db.event.findMany({
      where: { ownerId: session.user.id },
      include: {
        venue: { select: { name: true } },
        _count: { select: { tickets: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.band.findMany({
      where: { ownerId: session.user.id },
      include: { _count: { select: { members: true, events: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const stats = {
    totalEvents: await db.event.count({ where: { ownerId: session.user.id } }),
    publishedEvents: await db.event.count({ where: { ownerId: session.user.id, status: "PUBLISHED" } }),
    pendingEvents: await db.event.count({ where: { ownerId: session.user.id, status: "PENDING" } }),
    totalTickets: await db.ticket.count({
      where: {
        event: { ownerId: session.user.id },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    }),
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#0b1021]">오거나이저 대시보드</h1>
        <Link
          href="/organizer/performances/new"
          className="rounded-lg bg-[#0d28c4] px-4 py-2 text-sm font-medium text-white hover:bg-[#0b1fb5] transition-colors"
        >
          + 공연 등록
        </Link>
      </header>

      {/* 통계 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "총 공연", value: stats.totalEvents },
          { label: "게시됨", value: stats.publishedEvents },
          { label: "승인 대기", value: stats.pendingEvents },
          { label: "예매된 티켓", value: stats.totalTickets },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-[#0d28c4]">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* 내 밴드 */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-[#0b1021]">내 밴드</h2>
          <Link href="/organizer/bands/new" className="text-sm text-[#0d28c4] hover:underline">
            + 밴드 등록
          </Link>
        </div>
        {bands.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {bands.map((band) => (
              <div key={band.id} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div>
                  <p className="font-medium text-[#0b1021]">{band.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    멤버 {band._count.members}명 · 공연 {band._count.events}회
                  </p>
                </div>
                <Link href={`/bands/${band.id}`} className="text-xs text-[#0d28c4] hover:underline">
                  보기
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center">
            <p className="text-sm text-gray-400">등록된 밴드가 없습니다.</p>
            <Link href="/organizer/bands/new" className="mt-2 inline-block text-sm text-[#0d28c4] hover:underline">
              밴드 등록하기
            </Link>
          </div>
        )}
      </section>

      {/* 최근 공연 */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-[#0b1021]">최근 공연</h2>
          <Link href="/organizer/performances" className="text-sm text-[#0d28c4] hover:underline">
            전체 보기
          </Link>
        </div>
        {events.length > 0 ? (
          <div className="space-y-2">
            {events.map((event) => (
              <div key={event.id} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div>
                  <p className="font-medium text-[#0b1021] text-sm">{event.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatDate(event.startsAt)}
                    {event.venue && ` · ${event.venue.name}`}
                    {` · 예매 ${event._count.tickets}건`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={event.status} size="sm" />
                  <Link
                    href={`/organizer/performances/${event.id}/edit`}
                    className="text-xs text-gray-400 hover:text-[#0d28c4]"
                  >
                    편집
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center">
            <p className="text-sm text-gray-400">등록된 공연이 없습니다.</p>
            <Link href="/organizer/performances/new" className="mt-2 inline-block text-sm text-[#0d28c4] hover:underline">
              공연 등록하기
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
