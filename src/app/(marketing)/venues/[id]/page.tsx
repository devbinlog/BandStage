import Link from "next/link";

const mockVenue = {
  id: "1",
  name: "롤링홀",
  tags: ["홍대", "밴드", "라이브클럽"],
  address: "서울 마포구 어울마당로 35",
  phone: "02-123-4567",
  homepage: "https://rollinghall.co.kr",
  capacity: "150-250명",
  vibe: ["밴드", "록", "인디"],
  equipment: ["드럼 풀세트", "기타/베이스 앰프", "모니터 4채널", "PA 시스템"],
  booking: "대관료 + 매표 정산 (기본 80:20)",
  schedule: "월-목 오후, 금-일 저녁",
  notes: "사운드체크 필수, 95dB 이상 시 경고",
  mapUrl: "https://map.naver.com",
};

export default function VenueDetailPage() {
  return (
    <div className="space-y-8">
      {/* Venue Title */}
      <header className="space-y-4">
        <h1 className="text-4xl font-bold text-white">{mockVenue.name}</h1>
        {/* 지역 태그 */}
        <div className="flex flex-wrap gap-2">
          {mockVenue.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-cyan-500/50 bg-cyan-500/20 px-3 py-1 text-sm font-medium text-cyan-400"
            >
              {tag}
            </span>
          ))}
        </div>
      </header>

      {/* Map Placeholder Box */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
        <div className="aspect-video rounded-lg bg-gray-800 flex items-center justify-center mb-4">
          <span className="text-gray-500">지도 영역</span>
        </div>
        <a
          href={mockVenue.mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/50 bg-cyan-500/20 px-4 py-2 text-sm font-medium text-cyan-400 transition-all hover:bg-cyan-500/30 hover:shadow-[0_0_10px_rgba(34,211,238,0.5)]"
        >
          🗺 네이버 지도 링크
        </a>
      </div>

      {/* Details Section */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 space-y-6">
        <h2 className="text-2xl font-bold text-white">공연장 정보</h2>
        
        <dl className="grid gap-4 text-sm md:grid-cols-2">
          <div>
            <dt className="text-gray-400 mb-1">주소</dt>
            <dd className="text-white">{mockVenue.address}</dd>
          </div>
          <div>
            <dt className="text-gray-400 mb-1">연락처</dt>
            <dd className="text-white">{mockVenue.phone}</dd>
          </div>
          <div>
            <dt className="text-gray-400 mb-1">홈페이지</dt>
            <dd>
              <a
                href={mockVenue.homepage}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                {mockVenue.homepage}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-gray-400 mb-1">수용 인원</dt>
            <dd className="text-white">{mockVenue.capacity}</dd>
          </div>
        </dl>

        {/* 분위기(태그) */}
        <div>
          <dt className="text-gray-400 mb-2">분위기</dt>
          <div className="flex flex-wrap gap-2">
            {mockVenue.vibe.map((v) => (
              <span
                key={v}
                className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-400"
              >
                #{v}
              </span>
            ))}
          </div>
        </div>

        {/* 장비 리스트 */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">장비 리스트</h3>
          <ul className="space-y-2">
            {mockVenue.equipment.map((item) => (
              <li key={item} className="flex items-center gap-2 text-gray-300">
                <span className="text-cyan-400">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 대관 정보 */}
        <div className="pt-4 border-t border-gray-800">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold text-white mb-2">대관 방식</h3>
              <p className="text-sm text-gray-300">{mockVenue.booking}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-2">대관 가능 시간</h3>
              <p className="text-sm text-gray-300">{mockVenue.schedule}</p>
            </div>
          </div>
        </div>

        {/* 주의사항 */}
        <div className="pt-4 border-t border-gray-800">
          <h3 className="text-sm font-semibold text-white mb-2">주의사항 / 팁</h3>
          <p className="text-sm text-gray-300">{mockVenue.notes}</p>
        </div>
      </div>

      {/* 안내 문구 */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 text-sm text-gray-400">
        <p>
          Band-Stage는 정보 안내만 제공하며, 대관은 공연장에 직접 문의해주세요.
          정보가 틀리면 <Link href="/venues/report" className="text-cyan-400 hover:text-cyan-300">여기</Link>에서 제보할 수 있습니다.
        </p>
      </div>
    </div>
  );
}
