import { EVENT_STATUS_COLOR, EVENT_STATUS_LABEL } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const color = EVENT_STATUS_COLOR[status] ?? "bg-gray-100 text-gray-600 border-gray-200";
  const label = EVENT_STATUS_LABEL[status] ?? status;

  const sizeClass = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-xs";

  return (
    <span className={`inline-flex rounded-full border font-medium ${color} ${sizeClass}`}>
      {label}
    </span>
  );
}
