import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/prisma";
import { formatDate, ROLE_LABEL } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "마이페이지 | Band-Stage",
};

export default async function MyPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [user, recentTickets] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        displayName: true,
        email: true,
        role: true,
        image: true,
        bio: true,
        createdAt: true,
        _count: {
          select: {
            bookmarks: true,
            tickets: true,
            ownedBands: true,
            events: true,
          },
        },
      },
    }),
    db.ticket.findMany({
      where: { userId: session.user.id, status: { in: ["PENDING", "CONFIRMED"] } },
      include: {
        event: { select: { id: true, slug: true, title: true, startsAt: true } },
        ticketType: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  if (!user) redirect("/login");

  const menuItems = [
    { href: "/mypage/reservations", icon: "🎫", label: "예매 내역", count: user._count.tickets },
    { href: "/mypage/bookmarks", icon: "🔖", label: "북마크", count: user._count.bookmarks },
    { href: "/mypage/profile", icon: "⚙️", label: "프로필 수정", count: null },
  ];

  if (user.role === "ARTIST" || user.role === "ADMIN") {
    menuItems.push({ href: "/organizer", icon: "🎸", label: "오거나이저 대시보드", count: user._count.events });
  }

  if (user.role === "VENUE" || user.role === "ADMIN") {
    menuItems.push({ href: "/venue-manager", icon: "🏟", label: "공연장 관리", count: null });
  }

  if (user.role === "ADMIN") {
    menuItems.push({ href: "/admin", icon: "🔐", label: "관리자 패널", count: null });
  }

  return (
    <div className="space-y-6">
      {/* 프로필 카드 */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center text-2xl overflow-hidden">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt={user.name ?? ""} className="h-full w-full object-cover" />
            ) : (
              "👤"
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#0b1021]">
              {user.displayName ?? user.name ?? "사용자"}
            </h1>
            <p className="text-sm text-gray-500">{user.email}</p>
            <span className="mt-1 inline-flex rounded-full bg-[#0d28c4]/10 px-2 py-0.5 text-xs text-[#0d28c4]">
              {ROLE_LABEL[user.role] ?? user.role}
            </span>
          </div>
        </div>
        {user.bio && (
          <p className="mt-4 text-sm text-gray-600 border-t border-gray-100 pt-4">
            {user.bio}
          </p>
        )}
        <p className="mt-2 text-xs text-gray-400">
          가입일: {formatDate(user.createdAt)}
        </p>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "예매", value: user._count.tickets },
          { label: "북마크", value: user._count.bookmarks },
          { label: "공연 등록", value: user._count.events },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm"
          >
            <p className="text-2xl font-bold text-[#0d28c4]">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* 메뉴 */}
      <div className="space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:border-[#0d28c4]/40 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium text-[#0b1021]">{item.label}</span>
            </div>
            <div className="flex items-center gap-2">
              {item.count !== null && (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                  {item.count}
                </span>
              )}
              <span className="text-gray-400">→</span>
            </div>
          </Link>
        ))}
      </div>

      {/* 최근 예매 */}
      {recentTickets.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-semibold text-[#0b1021]">최근 예매</h2>
          {recentTickets.map((ticket) => (
            <Link
              key={ticket.id}
              href={`/performances/${ticket.event.slug}`}
              className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-4 hover:bg-white transition-colors"
            >
              <div>
                <p className="font-medium text-[#0b1021] text-sm">{ticket.event.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {ticket.ticketType.name} · {formatDate(ticket.event.startsAt)}
                </p>
              </div>
              <span className="text-xs text-gray-400">→</span>
            </Link>
          ))}
          <Link href="/mypage/reservations" className="text-sm text-[#0d28c4] hover:underline">
            전체 예매 내역 보기 →
          </Link>
        </section>
      )}
    </div>
  );
}
