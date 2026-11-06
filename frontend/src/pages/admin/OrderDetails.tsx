import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { fetchAdminOrder, updateOrderStatusRequest } from "../../api/admin";
import { OrderStatusTracker } from "../../components/OrderStatusTracker";
import { StatusBadge } from "../../components/StatusBadge";
import type { AdminOrder, OrderStatus } from "../../types";
import { getErrorMessage } from "../../utils/errors";
import { formatDateTime, formatPrice, statusInfo } from "../../utils/format";
import { imageSrc } from "../../utils/image";
import { allowedTransitions } from "../../utils/orders";

export default function AdminOrderDetails() {
  const { id } = useParams();
  const [result, setResult] = useState<{
    id: string;
    order: AdminOrder | null;
    error: string;
  } | null>(null);
  const [updating, setUpdating] = useState(false);
  const [actionError, setActionError] = useState("");

  const loading = !!id && result?.id !== id;
  const order = result?.order ?? null;
  const error = !loading && result ? result.error : "";

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    fetchAdminOrder(Number(id))
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

  async function changeStatus(next: OrderStatus) {
    if (!order || !id) return;
    if (
      next === "CANCELLED" &&
      !window.confirm("Cancel this order? The items will go back into stock.")
    ) {
      return;
    }

    setUpdating(true);
    setActionError("");
    try {
      const updated = await updateOrderStatusRequest(order.id, next);
      setResult({ id, order: updated, error: "" });
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setUpdating(false);
    }
  }

  const backLink = (
    <Link
      to="/admin/orders"
      className="text-sm text-indigo-600 hover:underline"
    >
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

  const nextStatuses = allowedTransitions[order.status];
  const { address, user } = order;

  return (
    <div>
      {backLink}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Order #{order.id}
          </h1>
          <p className="text-sm text-gray-500">
            Placed on {formatDateTime(order.createdAt)}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="mt-6 space-y-4 rounded-2xl bg-white p-5 shadow-sm">
        <OrderStatusTracker status={order.status} />

        <div className="border-t pt-4">
          <p className="text-sm font-medium text-gray-900">Update status</p>

          {nextStatuses.length === 0 ? (
            <p className="mt-1 text-sm text-gray-500">
              This order is {statusInfo(order.status).label.toLowerCase()}, so
              no further changes are possible.
            </p>
          ) : (
            <div className="mt-2 flex flex-wrap gap-3">
              {nextStatuses.map((next) => (
                <button
                  key={next}
                  disabled={updating}
                  onClick={() => changeStatus(next)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50 ${
                    next === "CANCELLED"
                      ? "border border-red-300 text-red-600 hover:bg-red-50"
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
                  }`}
                >
                  {next === "CANCELLED"
                    ? "Cancel order"
                    : `Mark as ${statusInfo(next).label}`}
                </button>
              ))}
            </div>
          )}

          {actionError && (
            <p role="alert" className="mt-3 text-sm text-red-600">
              {actionError}
            </p>
          )}
        </div>
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
                  <p className="font-medium text-gray-900">{item.name}</p>
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
            <h2 className="text-sm font-semibold text-gray-900">Customer</h2>
            <div className="mt-1 text-sm text-gray-600">
              <Link
                to={`/admin/users/${user.id}`}
                className="font-medium text-indigo-600 hover:underline"
              >
                {user.name}
              </Link>
              <p>{user.email}</p>
            </div>
          </div>

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
