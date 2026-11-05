import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router";
import { fetchMyOrder } from "../../api/orders";
import { OrderStatusTracker } from "../../components/OrderStatusTracker";
import type { Order } from "../../types";
import { getErrorMessage } from "../../utils/errors";
import { formatDateTime, formatPrice, statusInfo } from "../../utils/format";
import { imageSrc } from "../../utils/image";

export default function OrderDetails() {
  const { id } = useParams();
  const location = useLocation();
  const justPlaced =
    (location.state as { placed?: boolean } | null)?.placed === true;

  const [result, setResult] = useState<{
    id: string;
    order: Order | null;
    error: string;
  } | null>(null);

  const loading = !!id && result?.id !== id;
  const order = result?.order ?? null;
  const error = !loading && result ? result.error : "";

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    fetchMyOrder(Number(id))
      .then((order) => {
        if (!cancelled) setResult({ id, order, error: "" });
      })
      .catch((err) => {
        if (!cancelled) {
          setResult({ id, order: null, error: getErrorMessage(err) });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const backLink = (
    <Link to="/orders" className="text-sm text-indigo-600 hover:underline">
      &larr; All orders
    </Link>
  );

  if (loading) {
    return (
      <div>
        {backLink}
        <div className="mt-6 space-y-4">
          <div className="h-24 animate-pulse rounded-2xl bg-gray-200" />
          <div className="h-48 animate-pulse rounded-2xl bg-gray-200" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div>
        {backLink}
        <div
          role="alert"
          className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700"
        >
          {error || "Order not found"}
        </div>
      </div>
    );
  }

  const status = statusInfo(order.status);
  const { address } = order;

  return (
    <div>
      {backLink}

      {justPlaced && (
        <div
          role="status"
          className="mt-4 rounded-2xl bg-green-50 p-5 text-green-800"
        >
          <p className="text-lg font-semibold">Order placed successfully!</p>
          <p className="mt-1 text-sm">
            Thank you. Please keep {formatPrice(order.totalAmount)} ready to pay
            in cash when your order is delivered.
          </p>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Order #{order.id}
          </h1>
          <p className="text-sm text-gray-500">
            Placed on {formatDateTime(order.createdAt)}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${status.className}`}
        >
          {status.label}
        </span>
      </div>

      <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
        <OrderStatusTracker status={order.status} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <ul className="space-y-3 lg:col-span-2">
          {order.items.map((item) => (
            <li
              key={item.id}
              className="flex gap-4 rounded-2xl bg-white p-4 shadow-sm"
            >
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                {item.imageUrl && (
                  <img
                    src={imageSrc(item.imageUrl)}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="flex flex-1 items-center justify-between gap-3">
                <div>
                  <Link
                    to={`/products/${item.productId}`}
                    className="font-medium text-gray-900 hover:underline"
                  >
                    {item.name}
                  </Link>
                  <p className="text-sm text-gray-600">
                    {item.quantity} × {formatPrice(item.price)}
                  </p>
                </div>
                <span className="font-semibold text-gray-900">
                  {formatPrice(item.lineTotal)}
                </span>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit space-y-5 rounded-2xl bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              Delivery address
            </h2>
            <div className="mt-1 text-sm text-gray-600">
              <p className="font-medium text-gray-900">{address.fullName}</p>
              <p>{address.phone}</p>
              <p>{address.place}</p>
              <p>
                {address.city}, {address.state} - {address.pincode}
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-900">Payment</h2>
            <p className="mt-1 text-sm text-gray-600">Cash on Delivery</p>
          </div>

          <div className="flex justify-between border-t pt-3 text-base font-semibold">
            <span>Total</span>
            <span>{formatPrice(order.totalAmount)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
