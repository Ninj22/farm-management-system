import StatCard from "../components/StatCard";

export default function Dashboard() {
  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Dashboard</h1>
      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Total livestock" value={248} />
        <StatCard label="Low stock items" value={7} tone="warning" />
        <StatCard label="Expiring medicines" value={3} tone="danger" />
        <StatCard label="Revenue this month" value="KES 184,000" tone="success" />
      </div>
    </div>
  );
}
