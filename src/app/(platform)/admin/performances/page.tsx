import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/prisma";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate } from "@/lib/utils";
import { approvePerformance, rejectPerformance, publishPerformance } from "@/server/actions/admin";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "공연 관리 | 관리자",
};

export default async function AdminPerformancesPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/");

  const events = await db.event.findMany({
    include: {
      band: { select: { name: true } },
      venue: { select: { name: true } },
      owner: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const pending = events.filter((e) => e.status === "PENDING");
  const others = events.filter((e) => e.status !== "PENDING");

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <Link href="/admin" className="text-sm text-gray-400 hover:text-[#0d28c4]">
            ← 관리자 패널
          </Link>
          <h1 className="text-2xl font-bold text-[#0b1021] mt-1">공연 관리</h1>
        </div>
      </header>

      {/* 승인 대기 */}
      {pending.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-semibold text-orange-600">
            승인 대기 ({pending.length})
          </h2>
          {pending.map((event) => (
            <div
              key={event.id}
              className="rounded-xl border border-orange-200 bg-orange-50/30 p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Link
                    href={`/performances/${event.slug}`}
                    className="font-medium text-[#0b1021] hover:text-[#0d28c4] transition-colors"
                    target="_blank"
                  >
                    {event.title}
                  </Link>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {event.band?.name ?? "—"} · {event.venue?.name ?? "—"} · {formatDate(event.startsAt)}
                  </p>
                  <p className="text-xs text-gray-400">
                    등록: {event.owner?.name ?? event.owner?.email ?? "알 수 없음"}
                  </p>
                </div>
                <StatusBadge status={event.status} size="sm" />
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <form action={approvePerformance.bind(null, event.id)}>
                  <button
                    type="submit"
                    className="rounded-full bg-emerald-100 px-3 py-1 text-xs text-emerald-700 hover:bg-emerald-200 transition-colors"
                  >
                    승인
                  </button>
                </form>
                <form action={publishPerformance.bind(null, event.id)}>
                  <button
                    type="submit"
                    className="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-700 hover:bg-blue-200 transition-colors"
                  >
                    바로 게시
                  </button>
                </form>
                <form action={rejectPerformance.bind(null, event.id, "검토 후 반려")}>
                  <button
                    type="submit"
                    className="rounded-full bg-red-100 px-3 py-1 text-xs text-red-700 hover:bg-red-200 transition-colors"
                  >
                    반려
                  </button>
                </form>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* 전체 목록 */}
      <section className="space-y-2">
        <h2 className="font-semibold text-[#0b1021]">전체 공연</h2>
        {others.map((event) => (
          <div
            key={event.id}
            className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3 shadow-sm"
          >
            <div>
              <Link
                href={`/performances/${event.slug}`}
                className="text-sm font-medium text-[#0b1021] hover:text-[#0d28c4] transition-colors"
                target="_blank"
              >
                {event.title}
              </Link>
              <p className="text-xs text-gray-400 mt-0.5">
                {formatDate(event.startsAt)} · {event.band?.name ?? "—"}
              </p>
            </div>
            <StatusBadge status={event.status} size="sm" />
          </div>
        ))}
      </section>
    </div>
  );
}
