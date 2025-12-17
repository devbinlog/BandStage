"use client";

import Link from "next/link";

const mockUser = {
  name: "홍길동",
  email: "hong@example.com",
  role: "FAN", // FAN, ARTIST, VENUE
};

const tickets = [
  {
    id: "1",
    title: "Band-Stage Launch Showcase",
    date: "2024년 12월 15일 19:30",
    venue: "홍대 롤링홀",
    status: "QR 준비",
    qrCode: "QR_CODE_PLACEHOLDER",
  },
];

const myBand = null; // 밴드가 있는 경우
const myVenue = null; // 공연장이 있는 경우

export default function MePage() {
  const user = mockUser;

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
        <h1 className="text-3xl font-bold text-white mb-4">마이페이지</h1>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-xs text-gray-400 mb-1">이름</p>
            <p className="text-lg font-medium text-white">{user.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">이메일</p>
            <p className="text-lg font-medium text-white">{user.email}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">역할</p>
            <p className="text-lg font-medium text-white">
              {user.role === "FAN" ? "팬" : user.role === "ARTIST" ? "아티스트" : "공연장"}
            </p>
          </div>
        </div>
      </div>

      {/* My Tickets */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
        <h2 className="text-2xl font-bold text-white mb-4">내 티켓</h2>
        {tickets.length > 0 ? (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="rounded-lg border border-gray-800 bg-gray-900 p-5"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2">{ticket.title}</h3>
                    <div className="space-y-1 text-sm text-gray-400">
                      <p>📅 {ticket.date}</p>
                      <p>🏟 {ticket.venue}</p>
                      <span className="inline-flex rounded-full border border-emerald-500/50 bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-400 mt-2">
                        {ticket.status}
                      </span>
                    </div>
                  </div>
                  {/* QR Code */}
                  <div className="flex-shrink-0">
                    <div className="rounded-lg border-2 border-cyan-500/50 bg-white p-4 w-32 h-32 flex items-center justify-center">
                      <span className="text-gray-400 text-xs">QR Code</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-gray-800 bg-gray-900 p-8 text-center text-gray-400">
            예매한 티켓이 없습니다.
          </div>
        )}
      </div>

      {/* My Band (artist) */}
      {user.role === "ARTIST" && (
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">내 밴드</h2>
            <Link
              href="/events/new"
              className="rounded-lg border border-cyan-500/50 bg-cyan-500/20 px-4 py-2 text-sm font-medium text-cyan-400 hover:bg-cyan-500/30 transition-colors"
            >
              공연 등록하기
            </Link>
          </div>
          {myBand ? (
            <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
              <p className="text-white font-medium">{myBand.name}</p>
              <p className="text-sm text-gray-400 mt-1">{myBand.role}</p>
            </div>
          ) : (
            <div className="rounded-lg border border-gray-800 bg-gray-900 p-8 text-center text-gray-400">
              밴드가 없습니다.
            </div>
          )}
        </div>
      )}

      {/* My Venue (venue) */}
      {user.role === "VENUE" && (
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
          <h2 className="text-2xl font-bold text-white mb-4">대관 일정</h2>
          {myVenue ? (
            <div className="space-y-3">
              {/* 대관 일정 리스트 */}
            </div>
          ) : (
            <div className="rounded-lg border border-gray-800 bg-gray-900 p-8 text-center text-gray-400">
              등록된 공연장이 없습니다.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
