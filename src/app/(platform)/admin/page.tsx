import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminStats } from "@/server/actions/admin";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "관리자 | Band-Stage",
};

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const stats = await getAdminStats();

  const menuItems = [
    {
      href: "/admin/performances",
      icon: "🎸",
      label: "공연 관리",
      desc: `${stats.pendingEvents}개 승인 대기`,
      alert: stats.pendingEvents > 0,
    },
    {
      href: "/admin/users",
      icon: "👥",
      label: "사용자 관리",
      desc: `총 ${stats.totalUsers}명`,
      alert: false,
    },
    {
      href: "/admin/venues",
      icon: "🏟",
      label: "공연장 관리",
      desc: `총 ${stats.totalVenues}개`,
      alert: false,
    },
    {
      href: "/admin/reports",
      icon: "🚨",
      label: "신고 관리",
      desc: `${stats.openReports}건 미처리`,
      alert: stats.openReports > 0,
    },
    {
      href: "/admin/notices",
      icon: "📢",
      label: "공지사항",
      desc: "공지 작성/관리",
      alert: false,
    },
    {
      href: "/admin/taxonomy",
      icon: "🏷",
      label: "장르/지역 관리",
      desc: "분류 체계",
      alert: false,
    },
  ];

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs text-gray-400 tracking-widest">ADMIN CONSOLE</p>
        <h1 className="text-2xl font-bold text-[#0b1021]">운영 대시보드</h1>
        <p className="text-sm text-gray-500 mt-1">공연 승인, 사용자, 신고를 관리합니다.</p>
      </header>

      {/* 통계 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[
          { label: "전체 사용자", value: stats.totalUsers, alert: false },
          { label: "전체 공연", value: stats.totalEvents, alert: false },
          { label: "승인 대기", value: stats.pendingEvents, alert: stats.pendingEvents > 0 },
          { label: "전체 공연장", value: stats.totalVenues, alert: false },
          { label: "예매 티켓", value: stats.totalTickets, alert: false },
          { label: "미처리 신고", value: stats.openReports, alert: stats.openReports > 0 },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`rounded-xl border p-4 text-center shadow-sm ${
              stat.alert && stat.value > 0
                ? "border-orange-200 bg-orange-50"
                : "border-gray-200 bg-white"
            }`}
          >
            <p
              className={`text-2xl font-bold ${
                stat.alert && stat.value > 0 ? "text-orange-600" : "text-[#0d28c4]"
              }`}
            >
              {stat.value.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* 메뉴 */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-xl border p-5 shadow-sm transition-all hover:shadow-md ${
              item.alert ? "border-orange-200 bg-orange-50/50" : "border-gray-200 bg-white"
            }`}
          >
            <div className="flex items-start justify-between">
              <span className="text-2xl">{item.icon}</span>
              {item.alert && (
                <span className="h-2.5 w-2.5 rounded-full bg-orange-500 ring-2 ring-orange-200" />
              )}
            </div>
            <p className="mt-3 font-semibold text-[#0b1021]">{item.label}</p>
            <p className="text-xs text-gray-400 mt-1">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
