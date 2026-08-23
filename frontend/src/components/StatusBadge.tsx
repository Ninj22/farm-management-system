const COLORS: Record<string, string> = {
  PAID: "bg-gold-100 text-gold-700",
  ACTIVE: "bg-gold-100 text-gold-700",
  OPERATIONAL: "bg-gold-100 text-gold-700",
  PARTIAL: "bg-amber-100 text-amber-700",
  UNDER_MAINTENANCE: "bg-amber-100 text-amber-700",
  UNPAID: "bg-rust-100 text-rust-700",
  OUT_OF_SERVICE: "bg-rust-100 text-rust-700",
  SOLD: "bg-line text-ink-muted",
};

export default function StatusBadge({ status }: { status: string }) {
  const classes = COLORS[status] ?? "bg-line text-ink-muted";
  return (
    <span className={`rounded px-2 py-0.5 font-mono text-xs font-semibold ${classes}`}>
      {status}
    </span>
  );
}
