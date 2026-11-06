import { useEffect, useState } from "react";
import { Link } from "react-router";
import { fetchAdminOrders } from "../../api/admin";
import { Pagination } from "../../components/Pagination";
import { StatusBadge } from "../../components/StatusBadge";
import type { AdminOrderList, OrderStatus } from "../../types";
import { getErrorMessage } from "../../utils/errors";
import { formatDateTime, formatPrice, statusInfo } from "../../utils/format";
import { orderStatuses } from "../../utils/orders";

export default function AdminOrders() {
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [result, setResult] = useState<{
    key: string;
    data: AdminOrderList | null;
    error: string;
  } | null>(null);

  const key = `${status}|${page}|${reloadKey}`;
  const loading = result?.key !== key;
  const data = result?.data ?? null;
  const error = !loading && result ? result.error : "";

  useEffect(() => {
    let cancelled = false;

    fetchAdminOrders({ status: status || undefined, page, limit: 10 })
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
  }, [status, page, key]);

  function changeFilter(next: OrderStatus | "") {
    setStatus(next);
    setPage(1);
  }

  const tabs: { value: OrderStatus | ""; label: string }[] = [
    { value: "", label: "All" },
    ...orderStatuses.map((s) => ({ value: s, label: statusInfo(s).label })),
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Orders</h1>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => changeFilter(tab.value)}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium ${
              status === tab.value
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

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
        <p className="mt-8 text-gray-600">No orders found.</p>
      ) : (
        <>
          <div
            className={`mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm transition-opacity ${
              loading ? "opacity-50" : ""
            }`}
          >
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.items.map((order) => (
                  <tr key={order.id}>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      #{order.id}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-900">{order.user.name}</p>
                      <p className="text-xs text-gray-500">
                        {order.user.email}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDateTime(order.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      {order.items.reduce((sum, i) => sum + i.quantity, 0)}
                    </td>
                    <td className="px-4 py-3">
                      {formatPrice(order.totalAmount)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/admin/orders/${order.id}`}
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
