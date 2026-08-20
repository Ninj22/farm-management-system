import type { LucideIcon } from "lucide-react";

const TONE_STYLES: Record<string, { bg: string; text: string; iconBg: string }> = {
  default: { bg: "bg-white", text: "text-gray-900", iconBg: "bg-gray-100 text-gray-600" },
  warning: { bg: "bg-amber-50", text: "text-amber-800", iconBg: "bg-amber-100 text-amber-700" },
  danger: { bg: "bg-red-50", text: "text-red-800", iconBg: "bg-red-100 text-red-700" },
  success: { bg: "bg-green-50", text: "text-green-800", iconBg: "bg-green-100 text-green-700" },
};

export default function StatCard({
  label, value, tone = "default", icon: Icon,
}: {
  label: string;
  value: string | number;
  tone?: "default" | "warning" | "danger" | "success";
  icon: LucideIcon;
}) {
  const s = TONE_STYLES[tone];
  return (
    <div className={`rounded-xl p-4 border border-gray-200 ${s.bg}`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-gray-500">{label}</p>
        <div className={`w-7 h-7 rounded-md flex items-center justify-center ${s.iconBg}`}>
          <Icon size={15} />
        </div>
      </div>
      <p className={`text-2xl font-semibold ${s.text}`}>{value}</p>
    </div>
  );
}
