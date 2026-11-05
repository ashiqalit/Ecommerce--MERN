import { useEffect, useState } from "react";
import { Link } from "react-router";
import { fetchMyOrders } from "../../api/orders";
import { Pagination } from "../../components/Pagination";
import type { OrderList } from "../../types";
import { getErrorMessage } from "../../utils/errors";
import { formatDateTime, formatPrice, statusInfo } from "../../utils/format";
import { imageSrc } from "../../utils/image";

export default function Orders() {
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [result, setResult] = useState<{
    key: string;
    data: OrderList | null;
    error: string;
  } | null>(null);

  const key = `${page}|${reloadKey}`;
  const loading = result?.key !== key;
  const data = result?.data ?? null;
  const error = !loading && result ? result.error : "";

  useEffect(() => {
    let cancelled = false;

    fetchMyOrders(page)
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
  }, [page, key]);

  function handlePageChange(next: number) {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">My orders</h1>

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
        <div className="mt-6 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl bg-gray-200"
            />
          ))}
        </div>
      ) : data.items.length === 0 ? (
        <div className="mt-12 text-center text-gray-600">
          <p>You haven&rsquo;t placed any orders yet.</p>
          <Link
            to="/"
            className="mt-4 inline-block rounded-lg bg-indigo-600 px-6 py-2 font-medium text-white"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <>
          <ul
            className={`mt-6 space-y-4 transition-opacity ${
              loading ? "opacity-50" : ""
            }`}
          >
            {data.items.map((order) => {
              const status = statusInfo(order.status);
              const itemCount = order.items.reduce(
                (sum, item) => sum + item.quantity,
                0,
              );
              const extra = order.items.length - 4;

              return (
                <li key={order.id}>
                  <Link
                    to={`/orders/${order.id}`}
                    className="block rounded-2xl bg-white p-4 shadow-sm transition hover:shadow-md"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-900">
                          Order #{order.id}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDateTime(order.createdAt)}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      {order.items.slice(0, 4).map((item) => (
                        <div
                          key={item.id}
                          className="h-12 w-12 overflow-hidden rounded-lg bg-gray-100"
                        >
                          {item.imageUrl && (
                            <img
                              src={imageSrc(item.imageUrl)}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>
                      ))}
                      {extra > 0 && (
                        <span className="text-xs text-gray-500">
                          +{extra} more
                        </span>
                      )}
                    </div>

                    <p className="mt-3 text-sm text-gray-600">
                      {itemCount} item{itemCount === 1 ? "" : "s"} ·{" "}
                      <span className="font-semibold text-gray-900">
                        {formatPrice(order.totalAmount)}
                      </span>
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>

          {data.pagination.totalPages > 1 && (
            <Pagination
              page={data.pagination.page}
              totalPages={data.pagination.totalPages}
              onChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
}
