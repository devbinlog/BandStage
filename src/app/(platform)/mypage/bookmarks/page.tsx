import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/prisma";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "북마크 | Band-Stage",
};

export default async function BookmarksPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const bookmarks = await db.bookmark.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  // 북마크된 아이템 조회
  const eventIds = bookmarks.filter((b) => b.targetType === "EVENT").map((b) => b.targetId);
  const venueIds = bookmarks.filter((b) => b.targetType === "VENUE").map((b) => b.targetId);
  const bandIds = bookmarks.filter((b) => b.targetType === "BAND").map((b) => b.targetId);

  const [events, venues, bands] = await Promise.all([
    eventIds.length > 0
      ? db.event.findMany({
          where: { id: { in: eventIds } },
          select: { id: true, slug: true, title: true, startsAt: true, coverImage: true },
        })
      : Promise.resolve([]),
    venueIds.length > 0
      ? db.venue.findMany({
          where: { id: { in: venueIds } },
          select: { id: true, slug: true, name: true, city: true },
        })
      : Promise.resolve([]),
    bandIds.length > 0
      ? db.band.findMany({
          where: { id: { in: bandIds } },
          select: { id: true, name: true, profileImage: true },
        })
      : Promise.resolve([]),
  ]);

  const totalCount = events.length + venues.length + bands.length;

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0b1021]">북마크</h1>
          <p className="text-sm text-gray-500 mt-1">총 {totalCount}개</p>
        </div>
        <Link href="/mypage" className="text-sm text-gray-500 hover:text-[#0d28c4]">
          ← 마이페이지
        </Link>
      </header>

      {totalCount > 0 ? (
        <div className="space-y-6">
          {events.length > 0 && (
            <section className="space-y-3">
              <h2 className="font-semibold text-[#0b1021]">공연 ({events.length})</h2>
              {events.map((e) => (
                <Link
                  key={e.id}
                  href={`/performances/${e.slug}`}
                  className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 hover:border-[#0d28c4]/40 transition-colors"
                >
                  <div className="h-12 w-12 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100">
                    {e.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={e.coverImage} alt={e.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">🎸</div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-[#0b1021] text-sm">{e.title}</p>
                    <p className="text-xs text-gray-400">{formatDate(e.startsAt)}</p>
                  </div>
                </Link>
              ))}
            </section>
          )}

          {venues.length > 0 && (
            <section className="space-y-3">
              <h2 className="font-semibold text-[#0b1021]">공연장 ({venues.length})</h2>
              {venues.map((v) => (
                <Link
                  key={v.id}
                  href={`/venues/${v.slug}`}
                  className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 hover:border-[#0d28c4]/40 transition-colors"
                >
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gray-50 text-2xl">
                    🏟
                  </div>
                  <div>
                    <p className="font-medium text-[#0b1021] text-sm">{v.name}</p>
                    {v.city && <p className="text-xs text-gray-400">{v.city}</p>}
                  </div>
                </Link>
              ))}
            </section>
          )}

          {bands.length > 0 && (
            <section className="space-y-3">
              <h2 className="font-semibold text-[#0b1021]">밴드 ({bands.length})</h2>
              {bands.map((b) => (
                <Link
                  key={b.id}
                  href={`/bands/${b.id}`}
                  className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 hover:border-[#0d28c4]/40 transition-colors"
                >
                  <div className="h-12 w-12 flex-shrink-0 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-200">
                    {b.profileImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={b.profileImage} alt={b.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">🎸</div>
                    )}
                  </div>
                  <p className="font-medium text-[#0b1021] text-sm">{b.name}</p>
                </Link>
              ))}
            </section>
          )}
        </div>
      ) : (
        <EmptyState
          icon="🔖"
          title="북마크가 없습니다"
          description="관심 있는 공연, 공연장, 밴드를 북마크해 보세요."
        />
      )}
    </div>
  );
}
