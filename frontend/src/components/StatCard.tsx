export default function StatCard({ label, value, tone = "default" }: { label: string; value: string | number; tone?: "default" | "warning" | "danger" | "success" }) {
  const toneClasses: Record<string, string> = {
    default: "bg-white",
    warning: "bg-amber-50 text-amber-800",
    danger: "bg-red-50 text-red-800",
    success: "bg-green-50 text-green-800",
  };
  return (
    <div className={`rounded-lg p-4 border border-gray-200 ${toneClasses[tone]}`}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}
