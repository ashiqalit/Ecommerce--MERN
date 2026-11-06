import { useEffect, useState } from "react";
import { Link } from "react-router";
import { fetchAdminOrders, fetchAdminUsers } from "../../api/admin";
import { fetchProducts } from "../../api/products";
import { StatusBadge } from "../../components/StatusBadge";
import type { AdminOrder } from "../../types";
import { getErrorMessage } from "../../utils/errors";
import { formatDateTime, formatPrice } from "../../utils/format";

interface Stats {
  products: number;
  users: number;
  orders: number;
  pending: number;
  recent: AdminOrder[];
}

export default function Dashboard() {
  const [reloadKey, setReloadKey] = useState(0);
  const [result, setResult] = useState<{
    key: number;
    stats: Stats | null;
    error: string;
  } | null>(null);

  const loading = result?.key !== reloadKey;
  const stats = result?.stats ?? null;
  const error = !loading && result ? result.error : "";

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      fetchProducts({ limit: 1 }),
      fetchAdminUsers({ limit: 1 }),
      fetchAdminOrders({ limit: 5 }),
      fetchAdminOrders({ status: "PENDING", limit: 1 }),
    ])
      .then(([products, users, orders, pending]) => {
        if (cancelled) return;
        setResult({
          key: reloadKey,
          stats: {
            products: products.pagination.total,
            users: users.pagination.total,
            orders: orders.pagination.total,
            pending: pending.pagination.total,
            recent: orders.items,
          },
          error: "",
        });
      })
      .catch((err) => {
        if (!cancelled) {
          setResult({
            key: reloadKey,
            stats: null,
            error: getErrorMessage(err),
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const cards = stats
    ? [
        { label: "Products", value: stats.products, to: "/admin/products" },
        { label: "Users", value: stats.users, to: "/admin/users" },
        { label: "Orders", value: stats.orders, to: "/admin/orders" },
        { label: "Pending orders", value: stats.pending, to: "/admin/orders" },
      ]
    : [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

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
      ) : !stats ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-2xl bg-gray-200"
            />
          ))}
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => (
              <Link
                key={card.label}
                to={card.to}
                className="rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">
                  {card.value}
                </p>
              </Link>
            ))}
          </div>

          <div className="mt-8 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent orders
            </h2>
            <Link
              to="/admin/orders"
              className="text-sm text-indigo-600 hover:underline"
            >
              View all
            </Link>
          </div>

          {stats.recent.length === 0 ? (
            <p className="mt-4 text-gray-600">No orders yet.</p>
          ) : (
            <div className="mt-3 overflow-x-auto rounded-2xl bg-white shadow-sm">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Order</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {stats.recent.map((order) => (
                    <tr key={order.id}>
                      <td className="px-4 py-3">
                        <Link
                          to={`/admin/orders/${order.id}`}
                          className="font-medium text-indigo-600 hover:underline"
                        >
                          #{order.id}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {order.user.name}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {formatDateTime(order.createdAt)}
                      </td>
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
        </>
      )}
    </div>
  );
}
