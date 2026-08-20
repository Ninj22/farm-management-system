import { Outlet, NavLink } from "react-router-dom";
import {
  LayoutDashboard, Box, PawPrint, Stethoscope, Truck, ShoppingCart, Receipt, LogOut, Sprout, Wrench, FileBarChart,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/inventory", label: "Inventory", icon: Box },
  { to: "/livestock", label: "Livestock", icon: PawPrint },
  { to: "/veterinary", label: "Veterinary", icon: Stethoscope },
  { to: "/purchases", label: "Purchases", icon: Truck },
  { to: "/sales", label: "Sales", icon: ShoppingCart },
  { to: "/expenses", label: "Expenses", icon: Receipt },
  { to: "/equipment", label: "Equipment", icon: Wrench },
  { to: "/reports", label: "Reports", icon: FileBarChart },
];

export default function Layout() {
  const { logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col">
        <div className="flex items-center gap-2 px-5 py-5 font-semibold text-lg text-green-800">
          <Sprout size={22} />
          GreenAcres
        </div>
        <nav className="flex flex-col gap-0.5 px-3 flex-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive ? "bg-green-50 text-green-800 font-medium" : "text-gray-600 hover:bg-gray-50"
                }`
              }
            >
              <Icon size={17} strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-6 py-4 text-sm text-gray-500 hover:text-gray-800 border-t border-gray-100"
        >
          <LogOut size={16} />
          Log out
        </button>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
