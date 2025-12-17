import { submitVenueSuggestion } from "@/server/actions/venue-suggestions";

const fields = [
  { name: "name", label: "공연장 이름", type: "text", required: true },
  { name: "address", label: "주소", type: "text", required: false },
  { name: "naverMapUrl", label: "네이버 지도 링크", type: "url", required: false },
  { name: "contact", label: "연락처", type: "text", required: false },
];

export default function VenueReportPage() {
  async function action(formData: FormData) {
    "use server";
    await submitVenueSuggestion({
      name: formData.get("name")?.toString() ?? "",
      address: formData.get("address")?.toString() ?? "",
      naverMapUrl: formData.get("naverMapUrl")?.toString() ?? "",
      contact: formData.get("contact")?.toString() ?? "",
      notes: formData.get("notes")?.toString() ?? "",
    });
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <p className="text-sm text-zinc-500">Community</p>
        <h1 className="text-3xl font-semibold text-white">공연장 제보</h1>
        <p className="text-sm text-zinc-400">알고 있는 공연장의 정보를 공유해주세요.</p>
      </div>

      <form action={action} className="space-y-4">
        {fields.map((field) => (
          <div key={field.name} className="space-y-2">
            <label className="text-sm text-zinc-300" htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-400"> *</span>}
            </label>
            <input
              id={field.name}
              name={field.name}
              type={field.type}
              required={field.required}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-white placeholder:text-zinc-500"
            />
          </div>
        ))}
        <div className="space-y-2">
          <label className="text-sm text-zinc-300" htmlFor="notes">
            메모 (특징/분위기)
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={5}
            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-white placeholder:text-zinc-500"
          />
        </div>
        <button className="w-full rounded-full bg-white py-2 text-sm font-semibold text-black" type="submit">
          제보 제출
        </button>
      </form>
    </div>
  );
}
