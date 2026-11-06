import { Link, NavLink, Outlet } from "react-router";
import { useAuth } from "../context/useAuth";

const links = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/products", label: "Products", end: false },
  { to: "/admin/categories", label: "Categories", end: false },
  { to: "/admin/users", label: "Users", end: false },
  { to: "/admin/orders", label: "Orders", end: false },
];

export function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 md:flex">
      <aside className="border-b bg-white md:min-h-screen md:w-56 md:shrink-0 md:border-r md:border-b-0">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-lg font-bold text-indigo-600">
            MiniShop Admin
          </span>
          <button
            onClick={logout}
            className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm text-white md:hidden"
          >
            Log out
          </button>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-2 pb-2 md:flex-col md:pb-0">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <Link
            to="/"
            className="whitespace-nowrap rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100"
          >
            View store &rarr;
          </Link>
        </nav>

        <div className="mt-6 hidden border-t px-4 py-4 md:block">
          <p className="truncate text-xs text-gray-500">{user?.email}</p>
          <button
            onClick={logout}
            className="mt-2 w-full rounded-lg bg-gray-900 px-3 py-1.5 text-sm text-white"
          >
            Log out
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
