import { useEffect, useState } from "react";
import { Link } from "react-router";
import { fetchAdminUsers } from "../../api/admin";
import { Pagination } from "../../components/Pagination";
import { useDebounce } from "../../hooks/useDebounce";
import type { UserList } from "../../types";
import { getErrorMessage } from "../../utils/errors";
import { formatDateTime } from "../../utils/format";

export default function AdminUsers() {
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [result, setResult] = useState<{
    key: string;
    data: UserList | null;
    error: string;
  } | null>(null);

  const search = useDebounce(searchInput.trim(), 400);
  const key = `${search}|${page}|${reloadKey}`;
  const loading = result?.key !== key;
  const data = result?.data ?? null;
  const error = !loading && result ? result.error : "";

  useEffect(() => {
    let cancelled = false;

    fetchAdminUsers({ search: search || undefined, page, limit: 10 })
      .then((data) => {
        if (!cancelled) setResult({ key, data, error: "" });
      })
      .catch((err) => {
        if (!cancelled) {
          setResult({ key, data: null, error: getErrorMessage(err) });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [search, page, key]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Users</h1>

      <input
        type="search"
        value={searchInput}
        onChange={(e) => {
          setSearchInput(e.target.value);
          setPage(1);
        }}
        placeholder="Search by name or email..."
        className="mt-4 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 sm:max-w-sm"
      />

      {error ? (
        <div
          role="alert"
          className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700"
        >
          <p>{error}</p>
          <button
            onClick={() => setReloadKey((k) => k + 1)}
            className="mt-2 font-medium underline"
          >
            Try again
          </button>
        </div>
      ) : !data ? (
        <div className="mt-6 h-64 animate-pulse rounded-2xl bg-gray-200" />
      ) : data.items.length === 0 ? (
        <p className="mt-8 text-gray-600">No users found.</p>
      ) : (
        <>
          <div
            className={`mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm transition-opacity ${
              loading ? "opacity-50" : ""
            }`}
          >
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Registered</th>
                  <th className="px-4 py-3">Orders</th>
                  <th className="px-4 py-3 text-right" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.items.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {user.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          user.role === "ADMIN"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {user.role === "ADMIN" ? "Admin" : "Customer"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDateTime(user.createdAt)}
                    </td>
                    <td className="px-4 py-3">{user.orderCount}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/admin/users/${user.id}`}
                        className="text-indigo-600 hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.pagination.totalPages > 1 && (
            <Pagination
              page={data.pagination.page}
              totalPages={data.pagination.totalPages}
              onChange={(next) => setPage(next)}
            />
          )}
        </>
      )}
    </div>
  );
}
