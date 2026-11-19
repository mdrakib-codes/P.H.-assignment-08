import type { BookingStatus } from "@/types";

const STATUS_CLASSES: Record<BookingStatus, string> = {
  Pending: "badge-warning",
  Confirmed: "badge-success",
  Completed: "badge-info",
  Cancelled: "badge-error",
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span className={`badge ${STATUS_CLASSES[status]}`} aria-label={`Status: ${status}`}>
      {status}
    </span>
  );
}
