const COLORS: Record<string, string> = {
  PAID: "bg-green-100 text-green-700",
  ACTIVE: "bg-green-100 text-green-700",
  PARTIAL: "bg-amber-100 text-amber-700",
  UNPAID: "bg-red-100 text-red-700",
  SOLD: "bg-gray-100 text-gray-700",
};

export default function StatusBadge({ status }: { status: string }) {
  const classes = COLORS[status] ?? "bg-gray-100 text-gray-700";
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${classes}`}>{status}</span>;
}
