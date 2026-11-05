import { Link } from "react-router";
import { useAuth } from "../context/useAuth";
import { useCart } from "../context/useCart";

export function Navbar() {
  const { user, loading, logout } = useAuth();
  const { totalItems } = useCart();
  const showCart = !user || user.role === "CUSTOMER";

  return (
    <header className="border-b bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-xl font-bold text-indigo-600">
          MiniShop
        </Link>

        <div className="flex items-center gap-4 text-sm">
          {loading ? null : (
            <>
              {showCart && (
                <Link
                  to="/cart"
                  className="flex items-center gap-1 text-gray-700 hover:text-indigo-600"
                >
                  Cart
                  {totalItems > 0 && (
                    <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-xs text-white">
                      {totalItems}
                    </span>
                  )}
                </Link>
              )}

              {user?.role === "CUSTOMER" && (
                <Link
                  to="/orders"
                  className="text-gray-700 hover:text-indigo-600"
                >
                  Orders
                </Link>
              )}

              {user ? (
                <>
                  <span className="hidden text-gray-600 sm:inline">
                    Hi, {user.name}
                  </span>
                  {user.role === "ADMIN" && (
                    <Link
                      to="/admin"
                      className="text-indigo-600 hover:underline"
                    >
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="rounded-lg bg-gray-900 px-3 py-1.5 text-white"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-indigo-600 hover:underline">
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-white"
                  >
                    Register
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
