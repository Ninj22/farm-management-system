import { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import {
  LayoutDashboard, Box, PawPrint, Stethoscope, Truck, ShoppingCart,
  Receipt, LogOut, Wrench, FileBarChart, Search, Bell, Menu, X, Users, Sprout,
} from "lucide-react";
import { useAuth, } from "../context/AuthContext";
import type { Role } from "../context/AuthContext";

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles?: Role[]; // undefined = visible to everyone
}

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  { label: "Overview", items: [{ to: "/dashboard", label: "Dashboard", icon: LayoutDashboard }] },
  { label: "Operations", items: [
    { to: "/livestock", label: "Livestock", icon: PawPrint, roles: ["ADMIN", "FARM_MANAGER", "VETERINARY_STAFF"] },
    { to: "/veterinary", label: "Veterinary", icon: Stethoscope, roles: ["ADMIN", "FARM_MANAGER", "VETERINARY_STAFF"] },
    { to: "/fields", label: "Fields", icon: Sprout, roles: ["ADMIN", "FARM_MANAGER"] },
    { to: "/crops", label: "Crops", icon: Sprout, roles: ["ADMIN", "FARM_MANAGER"] },
  ]},
  { label: "Inventory", items: [
    { to: "/inventory", label: "Inventory", icon: Box, roles: ["ADMIN", "FARM_MANAGER", "INVENTORY_STAFF"] },
    { to: "/purchases", label: "Purchases", icon: Truck, roles: ["ADMIN", "FARM_MANAGER", "INVENTORY_STAFF"] },
  ]},
  { label: "Business", items: [
    { to: "/sales", label: "Sales", icon: ShoppingCart, roles: ["ADMIN", "FARM_MANAGER", "SALES_STAFF"] },
    { to: "/expenses", label: "Expenses", icon: Receipt, roles: ["ADMIN", "FARM_MANAGER"] },
  ]},
  { label: "Assets & insights", items: [
    { to: "/equipment", label: "Equipment", icon: Wrench, roles: ["ADMIN", "FARM_MANAGER"] },
    { to: "/reports", label: "Reports", icon: FileBarChart, roles: ["ADMIN", "FARM_MANAGER"] },
  ]},
  { label: "Administration", items: [
    { to: "/users", label: "Users", icon: Users, roles: ["ADMIN"] },
  ]},
];

const MOBILE_TABS: NavItem[] = [
  { to: "/dashboard", label: "Home", icon: LayoutDashboard },
  { to: "/inventory", label: "Stock", icon: Box, roles: ["ADMIN", "FARM_MANAGER", "INVENTORY_STAFF"] },
  { to: "/livestock", label: "Animals", icon: PawPrint, roles: ["ADMIN", "FARM_MANAGER", "VETERINARY_STAFF"] },
];

const ALL_MORE_ITEMS: NavItem[] = [
  { to: "/veterinary", label: "Veterinary", icon: Stethoscope, roles: ["ADMIN", "FARM_MANAGER", "VETERINARY_STAFF"] },
  { to: "/purchases", label: "Purchases", icon: Truck, roles: ["ADMIN", "FARM_MANAGER", "INVENTORY_STAFF"] },
  { to: "/sales", label: "Sales", icon: ShoppingCart, roles: ["ADMIN", "FARM_MANAGER", "SALES_STAFF"] },
  { to: "/expenses", label: "Expenses", icon: Receipt, roles: ["ADMIN", "FARM_MANAGER"] },
  { to: "/equipment", label: "Equipment", icon: Wrench, roles: ["ADMIN", "FARM_MANAGER"] },
  { to: "/reports", label: "Reports", icon: FileBarChart, roles: ["ADMIN", "FARM_MANAGER"] },
  { to: "/fields", label: "Fields", icon: Sprout, roles: ["ADMIN", "FARM_MANAGER"] },
  { to: "/crops", label: "Crops", icon: Sprout, roles: ["ADMIN", "FARM_MANAGER"] },
  { to: "/users", label: "Users", icon: Users, roles: ["ADMIN"] },
];

function visible(item: NavItem, role: Role | null): boolean {
  if (!item.roles) return true;
  if (!role) return false;
  return item.roles.includes(role);
}

const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
    isActive ? "bg-gold-500 font-semibold text-plum-900" : "text-plum-200 hover:bg-white/5 hover:text-white"
  }`;

export default function Layout() {
  const { logout, role } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);

  const visibleGroups = NAV_GROUPS.map((g) => ({
    ...g,
    items: g.items.filter((i) => visible(i, role)),
  })).filter((g) => g.items.length > 0);

  const visibleMobileTabs = MOBILE_TABS.filter((i) => visible(i, role));
  const visibleMoreItems = ALL_MORE_ITEMS.filter((i) => visible(i, role));

  return (
    <div className="flex min-h-screen bg-paper">
      <aside className="hidden w-60 flex-col bg-plum-800 lg:flex">
        <div className="flex items-center gap-2.5 px-4 py-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
            <span className="h-2.5 w-2.5 rounded-full bg-gold-500" />
          </span>
          <div>
            <p className="text-sm font-semibold text-white">FarmCore</p>
            <p className="text-[11px] text-plum-200">Operations & Management</p>
          </div>
        </div>

        <nav className="flex-1 space-y-4 px-3 pb-4">
          {visibleGroups.map((group) => (
            <div key={group.label}>
              <p className="mb-1.5 px-3 text-[10.5px] font-semibold uppercase tracking-wide text-plum-200/60">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map(({ to, label, icon: Icon }) => (
                  <NavLink key={to} to={to} className={navLinkClasses}>
                    <Icon size={16} strokeWidth={2} />
                    {label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <button
          onClick={logout}
          className="flex items-center gap-2.5 border-t border-white/10 px-6 py-4 text-sm text-plum-200 transition-colors hover:text-white"
        >
          <LogOut size={16} />
          Log out
        </button>
      </aside>

      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-line bg-white px-4 py-3 lg:px-6">
          <div className="hidden max-w-xs flex-1 items-center gap-2 rounded-lg border border-line px-3 py-1.5 text-sm text-ink-muted lg:flex">
            <Search size={15} />
            Search anything...
          </div>
          <span className="text-sm font-semibold text-plum-800 lg:hidden">FarmCore</span>
          <div className="flex items-center gap-4">
            <Bell size={18} className="text-ink-muted" />
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold-500 text-xs font-bold text-plum-900">
              {role ? role.slice(0, 2) : "?"}
            </span>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto p-4 pb-20 lg:p-8 lg:pb-8">
          <Outlet />
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 flex items-center justify-around border-t border-line bg-white py-2 lg:hidden">
        {visibleMobileTabs.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium ${
                isActive ? "text-plum-800" : "text-ink-muted"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
        <button
          onClick={() => setMoreOpen(true)}
          className="flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium text-ink-muted"
        >
          <Menu size={18} />
          More
        </button>
      </nav>

      {moreOpen && (
        <div className="fixed inset-0 z-20 flex items-end bg-black/40 lg:hidden">
          <div className="w-full rounded-t-2xl bg-white p-4 pb-8">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-ink">More</p>
              <button onClick={() => setMoreOpen(false)} aria-label="Close">
                <X size={18} className="text-ink-muted" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {visibleMoreItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMoreOpen(false)}
                  className="flex flex-col items-center gap-1.5 rounded-lg border border-line py-3 text-xs text-ink"
                >
                  <Icon size={18} />
                  {label}
                </NavLink>
              ))}
            </div>
            <button
              onClick={logout}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-line py-2.5 text-sm text-ink-muted"
            >
              <LogOut size={15} />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
