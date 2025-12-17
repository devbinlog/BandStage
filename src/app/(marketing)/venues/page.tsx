"use client";

import { useState } from "react";
import Link from "next/link";

const venues = [
  {
    id: "1",
    name: "롤링홀",
    district: "홍대",
    address: "서울 마포구 어울마당로 35",
    capacity: "150-250",
    tags: ["밴드", "록"],
    description: "밴드 사운드에 최적화된 대표 라이브클럽",
    phone: "02-123-4567",
    mapUrl: "https://map.naver.com",
  },
  {
    id: "2",
    name: "CJ Azit",
    district: "합정",
    address: "서울 마포구 합정동",
    capacity: "200-300",
    tags: ["복합", "쇼케이스"],
    description: "공연/녹음/촬영까지 가능한 복합 공간",
    phone: "02-987-6543",
    mapUrl: "https://map.naver.com",
  },
  {
    id: "3",
    name: "Club FF",
    district: "홍대",
    address: "서울 마포구 홍익로",
    capacity: "100-200",
    tags: ["인디", "록"],
    description: "인디 밴드의 성지",
    phone: "02-111-2222",
    mapUrl: "https://map.naver.com",
  },
];

const regions = ["전체", "홍대/합정", "강남", "이태원", "기타"];
const capacities = ["전체", "0-100", "100-300", "300+"];

export default function VenuesPage() {
  const [selectedRegion, setSelectedRegion] = useState("전체");
  const [selectedCapacity, setSelectedCapacity] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-8">
      {/* Title */}
      <header>
        <h1 className="text-4xl font-bold text-[#0b1021]">서울 공연장 가이드</h1>
      </header>

      {/* Filter Bar */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="grid gap-4 md:grid-cols-3">
          {/* Region Select */}
          <div>
            <p className="text-sm text-gray-600 mb-2">지역</p>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-[#0d28c4] focus:outline-none focus:ring-1 focus:ring-[#0d28c4]"
            >
              {regions.map((region) => (
                <option key={region} value={region} className="bg-white">
                  {region}
                </option>
              ))}
            </select>
          </div>

          {/* Capacity Select */}
          <div>
            <p className="text-sm text-gray-600 mb-2">수용 인원</p>
            <select
              value={selectedCapacity}
              onChange={(e) => setSelectedCapacity(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-[#0d28c4] focus:outline-none focus:ring-1 focus:ring-[#0d28c4]"
            >
              {capacities.map((capacity) => (
                <option key={capacity} value={capacity} className="bg-white">
                  {capacity}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div>
            <p className="text-sm text-gray-600 mb-2">검색</p>
            <input
              type="text"
              placeholder="공연장 이름이나 주소로 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-[#0d28c4] focus:outline-none focus:ring-1 focus:ring-[#0d28c4]"
            />
          </div>
        </div>
      </div>

      {/* Venue List - 모바일 1열, 웹 2-3열 그리드 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {venues.map((venue) => (
          <Link
            key={venue.id}
            href={`/venues/${venue.id}`}
            className="group block rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-[#0d28c4]/50 hover:shadow-md"
          >
            <h2 className="text-xl font-bold text-[#0b1021] mb-2 group-hover:text-[#0d28c4] transition-colors">
              {venue.name}
            </h2>
            <p className="text-sm text-gray-600 mb-1">{venue.district}</p>
            <p className="text-sm text-gray-500 mb-3">{venue.address}</p>
            <p className="text-sm text-gray-700 mb-3">{venue.description}</p>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="text-xs text-gray-500">수용: {venue.capacity}명</span>
              <span className="text-xs text-gray-500">·</span>
              <span className="text-xs text-gray-500">{venue.phone}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {venue.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[#0d28c4]/30 bg-[#0d28c4]/10 px-2 py-1 text-xs text-[#0d28c4]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
