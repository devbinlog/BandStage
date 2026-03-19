import { notFound } from "next/navigation";
import Link from "next/link";
import { getBandById } from "@/server/queries/bands";
import { formatDate, formatPrice } from "@/lib/utils";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const band = await getBandById(id);
  if (!band) return { title: "밴드를 찾을 수 없습니다." };
  return {
    title: `${band.name} | Band-Stage`,
    description: band.description ?? `${band.name} 밴드 정보`,
  };
}

const MEMBER_ROLE_LABEL: Record<string, string> = {
  VOCAL: "보컬",
  GUITAR: "기타",
  BASS: "베이스",
  DRUMS: "드럼",
  KEYS: "키보드",
  PRODUCER: "프로듀서",
  MANAGER: "매니저",
  OTHER: "기타",
};

export default async function BandDetailPage({ params }: PageProps) {
  const { id } = await params;
  const band = await getBandById(id);

  if (!band) notFound();

  return (
    <div className="space-y-6 pb-16">
      {/* 헤더 */}
      <header className="space-y-3">
        <div className="flex items-center gap-4">
          {band.profileImage || band.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={band.profileImage ?? band.coverImage!}
              alt={band.name}
              className="h-20 w-20 rounded-full object-cover border-2 border-gray-200 shadow"
            />
          ) : (
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center text-3xl">
              🎸
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-[#0b1021]">{band.name}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              {band.genre && (
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
                  style={{ backgroundColor: band.genre.color ?? "#0d28c4" }}
                >
                  {band.genre.name}
                </span>
              )}
              {band.region && (
                <span className="text-sm text-gray-500">{band.region.name}</span>
              )}
              {band.formedYear && (
                <span className="text-sm text-gray-400">
                  {band.formedYear}년 결성
                  {band.disbandedYear ? ` – ${band.disbandedYear}년` : ""}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* SNS 링크 */}
        <div className="flex flex-wrap gap-2">
          {band.instagram && (
            <a href={band.instagram} target="_blank" rel="noopener noreferrer"
              className="rounded-lg border border-pink-200 bg-pink-50 px-3 py-1 text-xs text-pink-600 hover:bg-pink-100 transition-colors">
              Instagram
            </a>
          )}
          {band.youtube && (
            <a href={band.youtube} target="_blank" rel="noopener noreferrer"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs text-red-600 hover:bg-red-100 transition-colors">
              YouTube
            </a>
          )}
          {band.soundcloud && (
            <a href={band.soundcloud} target="_blank" rel="noopener noreferrer"
              className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-1 text-xs text-orange-600 hover:bg-orange-100 transition-colors">
              SoundCloud
            </a>
          )}
          {band.website && (
            <a href={band.website} target="_blank" rel="noopener noreferrer"
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-600 hover:bg-gray-100 transition-colors">
              웹사이트
            </a>
          )}
        </div>
      </header>

      {/* 소개 */}
      {band.description && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {band.description}
          </p>
        </div>
      )}

      {/* 멤버 */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold text-[#0b1021]">멤버</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {band.members.map((member) => (
            <div
              key={member.id}
              className="rounded-xl border border-gray-200 bg-white p-3 text-center shadow-sm"
            >
              <div className="h-12 w-12 mx-auto rounded-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center text-xl mb-2">
                {member.user?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={member.user.image} alt={member.name} className="h-full w-full rounded-full object-cover" />
                ) : "🎵"}
              </div>
              <p className="font-medium text-sm text-[#0b1021] truncate">{member.name}</p>
              <p className="text-xs text-gray-400">
                {MEMBER_ROLE_LABEL[member.role] ?? member.role}
                {member.instrument && ` · ${member.instrument}`}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 예정 공연 */}
      {band.events.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#0b1021]">
            예정 공연 ({band._count.events}회)
          </h2>
          <div className="space-y-3">
            {band.events.map((event) => {
              const minPrice = event.ticketTypes[0]?.price ? Number(event.ticketTypes[0].price) : null;
              return (
                <Link
                  key={event.id}
                  href={`/performances/${event.slug}`}
                  className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 hover:border-[#0d28c4]/40 transition-colors"
                >
                  <div>
                    <p className="font-medium text-[#0b1021]">{event.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDate(event.startsAt)} · {event.venue?.name}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-[#0d28c4]">
                    {formatPrice(minPrice)}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* 커뮤니티 링크 */}
      <Link
        href={`/bands/${band.id}/community`}
        className="block rounded-xl border border-[#0d28c4]/20 bg-[#0d28c4]/5 p-4 text-center text-sm text-[#0d28c4] hover:bg-[#0d28c4]/10 transition-colors"
      >
        팬 커뮤니티 보기 →
      </Link>
    </div>
  );
}
