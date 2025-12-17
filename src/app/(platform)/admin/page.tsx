const pendingEvents = [
  { title: "Indie Pulse", artist: "Soul Engine", status: "PENDING" },
];

const venueSuggestions = [
  { name: "서교스테이션", status: "NEW" },
];

const reports = [
  { target: "공연", status: "IN_REVIEW" },
];

export default function AdminPage() {
  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm text-gray-500">Admin Console</p>
        <h1 className="text-3xl font-semibold text-gray-900">운영 대시보드</h1>
        <p className="text-sm text-gray-600">공연 승인, 제보, 신고를 관리합니다.</p>
      </header>

      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-gray-900">공연 승인 대기</h2>
        <div className="mt-4 space-y-3">
          {pendingEvents.map((event) => (
            <div key={event.title} className="rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-900">{event.title}</p>
              <p className="text-xs text-gray-500">{event.artist}</p>
              <div className="mt-3 flex gap-2">
                <button className="rounded-full bg-emerald-100 px-3 py-1 text-xs text-emerald-700 hover:bg-emerald-200">승인</button>
                <button className="rounded-full bg-red-100 px-3 py-1 text-xs text-red-700 hover:bg-red-200">반려</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-gray-900">공연장 제보</h2>
        {venueSuggestions.map((suggestion) => (
          <div key={suggestion.name} className="mt-4 rounded-xl border border-gray-200 p-4">
            <p className="text-gray-900">{suggestion.name}</p>
            <p className="text-xs text-gray-500">상태 {suggestion.status}</p>
            <button className="mt-2 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 hover:bg-gray-200">등록</button>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-gray-900">신고 관리</h2>
        {reports.map((report, index) => (
          <div key={index} className="mt-4 rounded-xl border border-gray-200 p-4">
            <p className="text-gray-900">{report.target}</p>
            <p className="text-xs text-gray-500">{report.status}</p>
            <div className="mt-2 flex gap-2">
              <button className="rounded-full bg-emerald-100 px-3 py-1 text-xs text-emerald-700 hover:bg-emerald-200">처리 완료</button>
              <button className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 hover:bg-gray-200">보류</button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
