import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getVenuesByManager } from "@/server/queries/venues";
import { formatCapacity } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "공연장 관리 | Band-Stage",
};

export default async function VenueManagerPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "VENUE" && session.user.role !== "ADMIN") {
    redirect("/mypage");
  }

  const venues = await getVenuesByManager(session.user.id);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#0b1021]">공연장 관리</h1>
        <Link
          href="/venue-manager/venues/new"
          className="rounded-lg bg-[#0d28c4] px-4 py-2 text-sm font-medium text-white hover:bg-[#0b1fb5] transition-colors"
        >
          + 공연장 등록
        </Link>
      </header>

      {venues.length > 0 ? (
        <div className="space-y-3">
          {venues.map((venue) => (
            <div
              key={venue.id}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg overflow-hidden bg-gradient-to-br from-slate-50 to-blue-100 flex-shrink-0">
                  {venue.images[0]?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={venue.images[0].url}
                      alt={venue.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xl">🏟</div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-[#0b1021]">{venue.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatCapacity(venue.capacityMin, venue.capacityMax)}
                    {venue.isVerified && (
                      <span className="ml-2 text-emerald-600">✓ 인증</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/venues/${venue.slug}`}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                  target="_blank"
                >
                  보기
                </Link>
                <Link
                  href={`/venue-manager/venues/${venue.id}/edit`}
                  className="rounded-lg bg-[#0d28c4]/10 px-3 py-1.5 text-xs text-[#0d28c4] hover:bg-[#0d28c4]/20 transition-colors"
                >
                  편집
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-200 p-12 text-center">
          <p className="text-4xl mb-3">🏟</p>
          <p className="text-sm text-gray-500">등록된 공연장이 없습니다.</p>
          <Link
            href="/venue-manager/venues/new"
            className="mt-3 inline-block text-sm text-[#0d28c4] hover:underline"
          >
            공연장 등록하기
          </Link>
        </div>
      )}
    </div>
  );
}
