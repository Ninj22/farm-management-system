import type { LucideIcon } from "lucide-react";

const TONE_STYLES: Record<string, { bg: string; label: string; value: string }> = {
  featured: { bg: "bg-plum-800", label: "text-plum-200", value: "text-white" },
  default: { bg: "bg-white border border-line", label: "text-ink-muted", value: "text-ink" },
  warning: { bg: "bg-gold-100", label: "text-gold-700", value: "text-gold-700" },
  danger: { bg: "bg-terracotta-100", label: "text-terracotta-700", value: "text-terracotta-700" },
};

export default function StatCard({
  label, value, tone = "default",
}: {
  label: string;
  value: string | number;
  tone?: "featured" | "default" | "warning" | "danger";
  icon?: LucideIcon;
}) {
  const s = TONE_STYLES[tone];
  return (
    <div className={`rounded-xl p-4 ${s.bg}`}>
      <p className={`mb-1.5 text-xs ${s.label}`}>{label}</p>
      <p className={`font-mono text-2xl font-bold ${s.value}`}>{value}</p>
    </div>
  );
}
