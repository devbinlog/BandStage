import Link from "next/link";
import { formatDate, formatPrice, getDday } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { PerformanceListItem } from "@/types";

interface PerformanceCardProps {
  performance: PerformanceListItem;
  showStatus?: boolean;
}

export function PerformanceCard({ performance, showStatus = false }: PerformanceCardProps) {
  const minPrice = performance.ticketTypes?.[0]?.price ?? null;
  const dday = getDday(performance.startsAt);

  return (
    <Link
      href={`/performances/${performance.slug}`}
      className="group block rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:border-[#0d28c4]/40 hover:shadow-md overflow-hidden"
    >
      {/* 커버 이미지 */}
      <div className="relative aspect-[16/9] bg-gradient-to-br from-blue-50 to-indigo-100">
        {performance.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={performance.coverImage}
            alt={performance.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-4xl opacity-30">🎸</span>
          </div>
        )}
        {/* D-day 배지 */}
        <span className="absolute top-2 right-2 rounded-full bg-[#0d28c4] px-2 py-0.5 text-xs font-bold text-white shadow">
          {dday}
        </span>
        {/* 장르 배지 */}
        {performance.genre && (
          <span
            className="absolute bottom-2 left-2 rounded-full px-2 py-0.5 text-xs font-medium text-white shadow"
            style={{ backgroundColor: performance.genre.color ?? "#0d28c4" }}
          >
            {performance.genre.name}
          </span>
        )}
      </div>

      {/* 정보 */}
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-[#0b1021] group-hover:text-[#0d28c4] transition-colors line-clamp-2 leading-snug">
            {performance.title}
          </h3>
          {showStatus && <StatusBadge status={performance.status} size="sm" />}
        </div>

        {performance.band && (
          <p className="text-sm text-gray-500">{performance.band.name}</p>
        )}

        <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
          <span>{formatDate(performance.startsAt)}</span>
          <span className="font-medium text-[#0d28c4]">{formatPrice(minPrice)}</span>
        </div>

        {performance.venue && (
          <p className="text-xs text-gray-400 truncate">
            📍 {performance.venue.name}
            {performance.venue.city && ` · ${performance.venue.city}`}
          </p>
        )}
      </div>
    </Link>
  );
}
