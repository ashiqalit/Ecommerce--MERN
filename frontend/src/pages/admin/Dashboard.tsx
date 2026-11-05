import { useAuth } from "../../context/useAuth";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Admin dashboard (placeholder)</h1>
      <p className="mt-2 text-gray-600">Signed in as {user?.email}</p>
      <button
        onClick={logout}
        className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-white"
      >
        Log out
      </button>
    </div>
  );
}
