import { Link } from "react-router";
import { useAuth } from "../../context/useAuth";

export default function Home() {
  const { user, logout } = useAuth();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Storefront (placeholder)</h1>

      {user ? (
        <div className="mt-4 space-y-3">
          <p className="text-gray-600">
            Welcome, {user.name} ({user.role})
          </p>
          {user.role === "ADMIN" && (
            <Link to="/admin" className="text-indigo-600 hover:underline">
              Go to admin dashboard
            </Link>
          )}
          <div>
            <button
              onClick={logout}
              className="rounded-lg bg-gray-900 px-4 py-2 text-white"
            >
              Log out
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex gap-4">
          <Link to="/login" className="text-indigo-600 hover:underline">
            Log in
          </Link>
          <Link to="/register" className="text-indigo-600 hover:underline">
            Register
          </Link>
        </div>
      )}
    </div>
  );
}
