import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/prisma";
import { formatDate, ROLE_LABEL } from "@/lib/utils";
import { updateUserRole } from "@/server/actions/admin";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "사용자 관리 | 관리자",
};

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/");

  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      displayName: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { tickets: true, events: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <header>
        <Link href="/admin" className="text-sm text-gray-400 hover:text-[#0d28c4]">
          ← 관리자 패널
        </Link>
        <h1 className="text-2xl font-bold text-[#0b1021] mt-1">사용자 관리</h1>
        <p className="text-sm text-gray-500">총 {users.length}명</p>
      </header>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="py-3 px-4 text-left font-medium text-gray-500">이름</th>
              <th className="py-3 px-4 text-left font-medium text-gray-500">이메일</th>
              <th className="py-3 px-4 text-left font-medium text-gray-500">역할</th>
              <th className="py-3 px-4 text-left font-medium text-gray-500">예매/공연</th>
              <th className="py-3 px-4 text-left font-medium text-gray-500">가입일</th>
              <th className="py-3 px-4 text-left font-medium text-gray-500">역할 변경</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="py-3 px-4 font-medium text-[#0b1021]">
                  {user.displayName ?? user.name ?? "—"}
                </td>
                <td className="py-3 px-4 text-gray-500">{user.email ?? "—"}</td>
                <td className="py-3 px-4">
                  <span className="rounded-full bg-[#0d28c4]/10 px-2 py-0.5 text-xs text-[#0d28c4]">
                    {ROLE_LABEL[user.role] ?? user.role}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-500 text-xs">
                  {user._count.tickets} / {user._count.events}
                </td>
                <td className="py-3 px-4 text-gray-400 text-xs">
                  {formatDate(user.createdAt)}
                </td>
                <td className="py-3 px-4">
                  <form action={updateUserRole.bind(null, user.id, "ARTIST")}>
                    <select
                      name="role"
                      defaultValue={user.role}
                      className="rounded border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700"
                      onChange={(e) => {
                        const form = e.target.form;
                        if (form) form.requestSubmit();
                      }}
                    >
                      {["FAN", "ARTIST", "VENUE", "ADMIN"].map((r) => (
                        <option key={r} value={r}>{ROLE_LABEL[r] ?? r}</option>
                      ))}
                    </select>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
