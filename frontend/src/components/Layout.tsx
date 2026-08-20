import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/inventory", label: "Inventory" },
  { to: "/livestock", label: "Livestock" },
  { to: "/veterinary", label: "Veterinary" },
  { to: "/purchases", label: "Purchases" },
  { to: "/sales", label: "Sales" },
  { to: "/expenses", label: "Expenses" },
];

export default function Layout() {
  const { logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-56 bg-white border-r border-gray-200 p-4 flex flex-col">
        <div className="font-semibold text-lg mb-6 text-green-800">GreenAcres</div>
        <nav className="flex flex-col gap-1 flex-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `px-3 py-2 rounded text-sm ${isActive ? "bg-green-50 text-green-800 font-medium" : "text-gray-600 hover:bg-gray-50"}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button onClick={logout} className="text-sm text-gray-500 hover:text-gray-800 text-left">
          Log out
        </button>
      </aside>
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
