import { cn } from "@/lib/utils";

type Status = "pending" | "approved" | "rejected";

const styles: Record<Status, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  approved: "bg-green-100 text-green-800 border-green-300",
  rejected: "bg-red-100 text-red-800 border-red-300",
};

const labels: Record<Status, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

const StatusBadge = ({ status, className }: { status: Status; className?: string }) => (
  <span
    className={cn(
      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border",
      styles[status],
      className,
    )}
  >
    {labels[status]}
  </span>
);

export default StatusBadge;