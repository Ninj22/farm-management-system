import { FileDown, FileText } from "lucide-react";
import { downloadReport } from "../lib/reports";

const CSV_REPORTS = [
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
      <p className="text-sm text-gray-500 mb-6">Export reports for offline review or accounting.</p>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-green-900">Farm summary report</p>
          <p className="text-xs text-green-700">One-page PDF overview — livestock, inventory value, revenue, expenses</p>
        </div>
        <button
          onClick={() => downloadReport("/reports/summary.pdf", "farm_summary_report.pdf")}
          className="flex items-center gap-2 bg-green-700 text-white text-sm px-4 py-2 rounded"
        >
          <FileText size={15} />
          Download PDF
        </button>
      </div>

      <p className="text-sm font-medium text-gray-700 mb-2">CSV exports</p>
      <div className="grid grid-cols-2 gap-3">
        {CSV_REPORTS.map((r) => (
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
