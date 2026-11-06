import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { fetchAdminUser } from "../../api/admin";
import { StatusBadge } from "../../components/StatusBadge";
import type { UserDetail } from "../../types";
import { getErrorMessage } from "../../utils/errors";
import { formatDateTime, formatPrice } from "../../utils/format";

export default function AdminUserDetails() {
  const { id } = useParams();
  const [result, setResult] = useState<{
    id: string;
    user: UserDetail | null;
    error: string;
  } | null>(null);

  const loading = !!id && result?.id !== id;
  const user = result?.user ?? null;
  const error = !loading && result ? result.error : "";

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    fetchAdminUser(Number(id))
      .then((user) => {
        if (!cancelled) setResult({ id, user, error: "" });
      })
      .catch((err) => {
        if (!cancelled) {
          setResult({ id, user: null, error: getErrorMessage(err) });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const backLink = (
    <Link to="/admin/users" className="text-sm text-indigo-600 hover:underline">
      &larr; All users
    </Link>
  );

  if (loading) {
    return (
      <div>
        {backLink}
        <div className="mt-6 h-64 animate-pulse rounded-2xl bg-gray-200" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div>
        {backLink}
        <div
          role="alert"
          className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700"
        >
          {error || "User not found"}
        </div>
      </div>
    );
  }

  return (
    <div>
      {backLink}

      <div className="mt-4 rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-gray-500">Email</dt>
            <dd className="text-gray-900">{user.email}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Role</dt>
            <dd className="text-gray-900">
              {user.role === "ADMIN" ? "Admin" : "Customer"}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Registered</dt>
            <dd className="text-gray-900">{formatDateTime(user.createdAt)}</dd>
          </div>
        </dl>
      </div>

      <h2 className="mt-8 text-lg font-semibold text-gray-900">
        Order history ({user.orders.length})
      </h2>

      {user.orders.length === 0 ? (
        <p className="mt-3 text-gray-600">
          This user has not placed any orders.
        </p>
      ) : (
        <div className="mt-3 overflow-x-auto rounded-2xl bg-white shadow-sm">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {user.orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-4 py-3">
                    <Link
                      to={`/admin/orders/${order.id}`}
                      className="font-medium text-indigo-600 hover:underline"
                    >
                      #{order.id}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatDateTime(order.createdAt)}
                  </td>
                  <td className="px-4 py-3">{order.itemCount}</td>
                  <td className="px-4 py-3">
                    {formatPrice(order.totalAmount)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
