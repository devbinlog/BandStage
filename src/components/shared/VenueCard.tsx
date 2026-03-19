import Link from "next/link";
import { formatCapacity } from "@/lib/utils";
import type { VenueListItem } from "@/types";

const VENUE_TYPE_LABEL: Record<string, string> = {
  LIVE_CLUB: "라이브클럽",
  CONCERT_HALL: "공연홀",
  OUTDOOR: "야외",
  MULTIPLEX: "복합공간",
  BAR: "바/카페",
  OTHER: "기타",
};

interface VenueCardProps {
  venue: VenueListItem;
}

export function VenueCard({ venue }: VenueCardProps) {
  const coverImage = venue.images?.[0]?.url;

  return (
    <Link
      href={`/venues/${venue.slug}`}
      className="group block rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:border-[#0d28c4]/40 hover:shadow-md overflow-hidden"
    >
      {/* 이미지 */}
      <div className="relative aspect-[16/9] bg-gradient-to-br from-slate-50 to-blue-50">
        {coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverImage}
            alt={venue.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-4xl opacity-20">🏟</span>
          </div>
        )}
        {venue.isVerified && (
          <span className="absolute top-2 right-2 rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-medium text-white">
            인증
          </span>
        )}
        <span className="absolute bottom-2 left-2 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white backdrop-blur-sm">
          {VENUE_TYPE_LABEL[venue.venueType] ?? "기타"}
        </span>
      </div>

      {/* 정보 */}
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-[#0b1021] group-hover:text-[#0d28c4] transition-colors">
          {venue.name}
        </h3>

        {(venue.district || venue.city) && (
          <p className="text-xs text-gray-500">
            📍 {[venue.district, venue.city].filter(Boolean).join(", ")}
          </p>
        )}

        <p className="text-xs text-gray-400">
          수용 {formatCapacity(venue.capacityMin, venue.capacityMax)}
        </p>

        {venue.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {venue.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[#0d28c4]/20 bg-[#0d28c4]/5 px-2 py-0.5 text-xs text-[#0d28c4]"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
