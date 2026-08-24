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
      <h1 className="text-xl font-semibold text-ink mb-1">Reports</h1>
      <p className="text-sm text-ink-muted mb-6">Export reports for offline review or accounting.</p>

      <div className="bg-plum-100 border border-plum-200 rounded-xl p-4 mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-plum-900">Farm summary report</p>
          <p className="text-xs text-plum-800">One-page PDF overview — livestock, inventory value, revenue, expenses</p>
        </div>
        <button
          onClick={() => downloadReport("/reports/summary.pdf", "farm_summary_report.pdf")}
          className="flex items-center gap-2 bg-plum-800 text-white text-sm px-4 py-2 rounded-lg hover:bg-plum-900"
        >
          <FileText size={15} />
          Download PDF
        </button>
      </div>

      <p className="text-sm font-medium text-ink mb-2">CSV exports</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {CSV_REPORTS.map((r) => (
          <button
            key={r.path}
            onClick={() => downloadReport(r.path, r.file)}
            className="flex items-center justify-between bg-white border border-line rounded-xl px-4 py-3 text-sm hover:bg-paper text-left text-ink"
          >
            <span>{r.label}</span>
            <FileDown size={16} className="text-ink-muted" />
          </button>
        ))}
      </div>
    </div>
  );
}
