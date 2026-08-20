import { FileDown } from "lucide-react";
import { downloadReport } from "../lib/reports";

const REPORTS = [
  { label: "Inventory report", path: "/reports/inventory.csv", file: "inventory_report.csv" },
  { label: "Livestock report", path: "/reports/livestock.csv", file: "livestock_report.csv" },
  { label: "Purchases report", path: "/reports/purchases.csv", file: "purchases_report.csv" },
  { label: "Sales report", path: "/reports/sales.csv", file: "sales_report.csv" },
  { label: "Expenses report", path: "/reports/expenses.csv", file: "expenses_report.csv" },
  { label: "Stock movement report", path: "/reports/stock-transactions.csv", file: "stock_transactions_report.csv" },
];

export default function Reports() {
  return (
    <div>
      <h1 className="text-xl font-semibold mb-1">Reports</h1>
      <p className="text-sm text-gray-500 mb-6">Export CSV reports for offline review or accounting.</p>

      <div className="grid grid-cols-2 gap-3">
        {REPORTS.map((r) => (
          <button
            key={r.path}
            onClick={() => downloadReport(r.path, r.file)}
            className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm hover:bg-gray-50 text-left"
          >
            <span>{r.label}</span>
            <FileDown size={16} className="text-gray-400" />
          </button>
        ))}
      </div>
    </div>
  );
}
