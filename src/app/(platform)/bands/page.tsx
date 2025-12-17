const bands = [
  {
    name: "Parallel Echo",
    genre: "Indie Rock",
    region: "서울",
    intro: "시티팝과 록을 섞은 신스 드리븐 사운드",
  },
  {
    name: "Luminous Drift",
    genre: "Dream Pop",
    region: "부산",
    intro: "몽환적인 기타와 파도 같은 신스",
  },
];

const filters = {
  genres: ["록", "팝", "재즈", "퓨전"],
  regions: ["서울", "수도권", "부산", "대구", "기타"],
};

export default function BandsPage() {
  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm text-gray-500">Band directory</p>
        <h1 className="text-3xl font-semibold text-gray-900">밴드 리스트</h1>
        <p className="text-sm text-gray-600">장르와 지역으로 밴드를 찾아보세요.</p>
      </header>
      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="grid gap-4 md:grid-cols-2">
          {Object.entries(filters).map(([key, values]) => (
            <div key={key}>
              <p className="text-sm text-gray-600">{key === "genres" ? "장르" : "지역"}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {values.map((value) => (
                  <button key={value} className="rounded-full border border-gray-300 px-3 py-1 text-xs text-gray-700 hover:bg-gray-50">
                    {value}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <input
            placeholder="밴드명으로 검색"
            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2 text-sm text-gray-900"
          />
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        {bands.map((band) => (
          <div key={band.name} className="rounded-2xl border border-gray-200 bg-white p-5">
            <p className="text-xs text-gray-500">{band.genre} · {band.region}</p>
            <h2 className="mt-1 text-2xl font-semibold text-gray-900">{band.name}</h2>
            <p className="mt-2 text-sm text-gray-700">{band.intro}</p>
            <button className="mt-3 text-sm text-emerald-600">프로필 보기 →</button>
          </div>
        ))}
      </section>
    </div>
  );
}
