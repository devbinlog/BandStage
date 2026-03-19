import Link from "next/link";
import type { BandListItem } from "@/types";

interface BandCardProps {
  band: BandListItem;
}

export function BandCard({ band }: BandCardProps) {
  return (
    <Link
      href={`/bands/${band.id}`}
      className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-[#0d28c4]/40 hover:shadow-md"
    >
      {/* 프로필 이미지 */}
      <div className="relative h-16 w-16 flex-shrink-0 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-200">
        {band.profileImage || band.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={band.profileImage ?? band.coverImage!}
            alt={band.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl opacity-40">
            🎸
          </div>
        )}
      </div>

      {/* 정보 */}
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-[#0b1021] group-hover:text-[#0d28c4] transition-colors truncate">
          {band.name}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          {band.genre && (
            <span
              className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium text-white"
              style={{ backgroundColor: band.genre.color ?? "#0d28c4" }}
            >
              {band.genre.name}
            </span>
          )}
          {band.region && (
            <span className="text-xs text-gray-400">{band.region.name}</span>
          )}
        </div>
        {band.description && (
          <p className="mt-1 text-xs text-gray-500 line-clamp-1">{band.description}</p>
        )}
        <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
          {band.members && band.members.length > 0 && (
            <span>{band.members.length}명</span>
          )}
          {band._count && (
            <span>공연 {band._count.events}회</span>
          )}
        </div>
      </div>
    </Link>
  );
}
