"use client";

import { useState } from "react";

const dateOptions = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
];

const regions = ["서울", "수도권", "부산", "대구", "기타"];
const genres = ["록", "팝", "재즈", "퓨전", "인디"];

export function EventsFilter() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  return (
    <div className="sticky top-[73px] z-40 border-b border-gray-200 bg-white/95 backdrop-blur-sm py-4">
      <div className="space-y-4">
        {/* Date Filters */}
        <div className="flex gap-2">
          {dateOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedDate(selectedDate === option.value ? null : option.value)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                selectedDate === option.value
                  ? "border-[#0d28c4] bg-[#0d28c4]/10 text-[#0d28c4] shadow-[#0d28c4]/30"
                  : "border-gray-300 bg-gray-50 text-gray-700 hover:border-[#0d28c4]/50 hover:bg-gray-100"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Select Filters & Search */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Region Select */}
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-[#0d28c4] focus:outline-none focus:ring-1 focus:ring-[#0d28c4]"
          >
            <option value="">전체 지역</option>
            {regions.map((region) => (
              <option key={region} value={region} className="bg-white">
                {region}
              </option>
            ))}
          </select>

          {/* Genre Select */}
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-[#0d28c4] focus:outline-none focus:ring-1 focus:ring-[#0d28c4]"
          >
            <option value="">전체 장르</option>
            {genres.map((genre) => (
              <option key={genre} value={genre} className="bg-white">
                {genre}
              </option>
            ))}
          </select>

          {/* Search */}
          <input
            type="text"
            placeholder="공연 제목, 밴드명으로 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-[#0d28c4] focus:outline-none focus:ring-1 focus:ring-[#0d28c4]"
          />
        </div>
      </div>
    </div>
  );
}




