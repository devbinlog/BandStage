import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/prisma";
import { formatDateTime, formatPrice } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "예매 내역 | Band-Stage",
};

const TICKET_STATUS_LABEL: Record<string, string> = {
  UNPAID: "결제 전",
  PENDING: "예매 중",
  CONFIRMED: "확정",
  CANCELLED: "취소됨",
};

const TICKET_STATUS_COLOR: Record<string, string> = {
  UNPAID: "bg-yellow-50 text-yellow-700 border-yellow-200",
  PENDING: "bg-blue-50 text-blue-700 border-blue-200",
  CONFIRMED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-gray-100 text-gray-400 border-gray-200",
};

export default async function ReservationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const tickets = await db.ticket.findMany({
    where: { userId: session.user.id },
    include: {
      event: {
        select: {
          id: true,
          slug: true,
          title: true,
          coverImage: true,
          startsAt: true,
          venue: { select: { name: true } },
        },
      },
      ticketType: { select: { name: true, price: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0b1021]">예매 내역</h1>
          <p className="text-sm text-gray-500 mt-1">총 {tickets.length}건</p>
        </div>
        <Link href="/mypage" className="text-sm text-gray-500 hover:text-[#0d28c4]">
          ← 마이페이지
        </Link>
      </header>

      {tickets.length > 0 ? (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex gap-4">
                {/* 커버 이미지 */}
                <div className="h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100">
                  {ticket.event.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={ticket.event.coverImage}
                      alt={ticket.event.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl">🎸</div>
                  )}
                </div>

                {/* 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/performances/${ticket.event.slug}`}
                      className="font-medium text-[#0b1021] hover:text-[#0d28c4] transition-colors line-clamp-1"
                    >
                      {ticket.event.title}
                    </Link>
                    <span
                      className={`flex-shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${
                        TICKET_STATUS_COLOR[ticket.status] ?? "bg-gray-100 text-gray-600 border-gray-200"
                      }`}
                    >
                      {TICKET_STATUS_LABEL[ticket.status] ?? ticket.status}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 mt-1">
                    {ticket.ticketType.name} × {ticket.quantity}장
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatDateTime(ticket.event.startsAt)}
                    {ticket.event.venue && ` · ${ticket.event.venue.name}`}
                  </p>
                  <p className="text-sm font-semibold text-[#0d28c4] mt-2">
                    {ticket.totalAmount
                      ? formatPrice(Number(ticket.totalAmount))
                      : "무료"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="🎫"
          title="예매 내역이 없습니다"
          description="공연을 찾아 예매해 보세요."
          action={
            <Link
              href="/performances"
              className="rounded-lg bg-[#0d28c4] px-6 py-2 text-sm font-medium text-white"
            >
              공연 보러가기
            </Link>
          }
        />
      )}
    </div>
  );
}
