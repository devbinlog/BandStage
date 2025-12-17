import Link from "next/link";

const mockBand = {
  id: "1",
  name: "Parallel Echo",
  genre: "Indie Rock",
  region: "서울",
  description: "도시적인 신스와 강렬한 기타가 공존하는 사운드. 2020년 결성된 서울 기반 인디 록 밴드로, 현대적인 신스 사운드와 클래식한 록 기타 라인이 조화를 이루는 독특한 음악을 선보입니다.",
  sns: [
    { label: "YouTube", url: "https://youtube.com", icon: "▶️" },
    { label: "Instagram", url: "https://instagram.com", icon: "📷" },
    { label: "Spotify", url: "https://spotify.com", icon: "🎵" },
  ],
  members: [
    { name: "채린", role: "보컬", image: null },
    { name: "준호", role: "기타", image: null },
    { name: "도윤", role: "드럼", image: null },
  ],
  upcoming: [
    { id: "1", title: "Band-Stage Launch Showcase", date: "11월 30일", venue: "홍대 롤링홀" },
  ],
};

export default function BandDetailPage() {
  return (
    <div className="space-y-8">
      {/* Band Header */}
      <header className="space-y-4">
        <h1 className="text-4xl font-bold text-white">{mockBand.name}</h1>
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-cyan-500/50 bg-cyan-500/20 px-3 py-1 text-sm font-medium text-cyan-400">
            {mockBand.genre}
          </span>
          <span className="text-gray-400">·</span>
          <span className="text-gray-400">{mockBand.region}</span>
        </div>
        
        {/* SNS 아이콘 Row */}
        <div className="flex gap-4">
          {mockBand.sns.map((sns) => (
            <Link
              key={sns.label}
              href={sns.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-2 text-sm text-gray-300 transition-all hover:border-cyan-500/50 hover:text-cyan-400 hover:shadow-[0_0_10px_rgba(34,211,238,0.3)]"
            >
              <span>{sns.icon}</span>
              <span>{sns.label}</span>
            </Link>
          ))}
        </div>
      </header>

      {/* Band Bio */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
        <h2 className="text-2xl font-bold text-white mb-4">밴드 소개</h2>
        <p className="text-gray-300 leading-relaxed">{mockBand.description}</p>
      </div>

      {/* Band Members */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">멤버</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {mockBand.members.map((member) => (
            <div
              key={member.name}
              className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 text-center"
            >
              {/* 사진 Placeholder */}
              <div className="mx-auto mb-4 h-24 w-24 rounded-full border-2 border-gray-700 bg-gray-800 flex items-center justify-center text-3xl">
                🎸
              </div>
              <h3 className="text-lg font-semibold text-white">{member.name}</h3>
              <p className="mt-1 text-sm text-gray-400">{member.role}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">곧 있을 공연</h2>
        {mockBand.upcoming.length > 0 ? (
          <div className="space-y-3">
            {mockBand.upcoming.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="block rounded-xl border border-gray-800 bg-gray-900/50 p-5 transition-all hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)]"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">{event.title}</h3>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-400">
                      <span>📅 {event.date}</span>
                      <span>·</span>
                      <span>🏟 {event.venue}</span>
                    </div>
                  </div>
                  <span className="rounded-full border border-emerald-500/50 bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-400">
                    예매중
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-8 text-center text-gray-400">
            예정된 공연이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
