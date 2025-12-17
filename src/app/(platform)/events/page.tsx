import { EventsList } from "@/components/events-list";
import { EventsFilter } from "@/components/events-filter";

export default function EventsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-4xl font-bold text-[#0b1021]">모든 공연 보기</h1>
      </header>

      {/* Sticky Filter Bar */}
      <EventsFilter />

      {/* Event List */}
      <div className="space-y-3">
        <EventsList />
      </div>
    </div>
  );
}
