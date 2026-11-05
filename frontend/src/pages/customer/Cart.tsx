import { useState } from "react";
import { Link } from "react-router";
import { useCart } from "../../context/useCart";
import { getErrorMessage } from "../../utils/errors";
import { formatPrice } from "../../utils/format";
import { imageSrc } from "../../utils/image";

export default function Cart() {
  const { cart, loading, error, updateItem, removeItem, reload } = useCart();
  const [busyId, setBusyId] = useState<number | null>(null);
  const [actionError, setActionError] = useState("");

  async function run(productId: number, action: () => Promise<unknown>) {
    setBusyId(productId);
    setActionError("");
    try {
      await action();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Your cart</h1>
        <div className="mt-6 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-2xl bg-gray-200"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error || !cart) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Your cart</h1>
        <div
          role="alert"
          className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700"
        >
          <p>{error || "Could not load your cart"}</p>
          <button onClick={reload} className="mt-2 font-medium underline">
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Your cart is empty</h1>
        <Link
          to="/"
          className="mt-4 inline-block rounded-lg bg-indigo-600 px-6 py-2 font-medium text-white"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  const hasStockProblem = cart.items.some((item) => item.exceedsStock);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Your cart</h1>

      {actionError && (
        <div
          role="alert"
          className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          {actionError}
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <ul className="space-y-4 lg:col-span-2">
          {cart.items.map((item) => {
            const busy = busyId === item.productId;

            return (
              <li
                key={item.id}
                className={`flex gap-4 rounded-2xl bg-white p-4 shadow-sm ${
                  busy ? "opacity-60" : ""
                }`}
              >
                <Link
                  to={`/products/${item.productId}`}
                  className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100"
                >
                  {item.imageUrl ? (
                    <img
                      src={imageSrc(item.imageUrl)}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-gray-400">
                      No image
                    </div>
                  )}
                </Link>

                <div className="flex flex-1 flex-col justify-between gap-3">
                  <div>
                    <Link
                      to={`/products/${item.productId}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm text-gray-600">
                      {formatPrice(item.price)} each
                    </p>
                    {item.exceedsStock && (
                      <p className="mt-1 text-sm text-red-600">
                        {item.stock === 0
                          ? "This product is now out of stock. Remove it to continue."
                          : `Only ${item.stock} left. Reduce the quantity to continue.`}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center rounded-lg border border-gray-300">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        disabled={busy || item.quantity <= 1}
                        onClick={() =>
                          run(item.productId, () =>
                            updateItem(item.productId, item.quantity - 1),
                          )
                        }
                        className="px-3 py-1 text-lg disabled:opacity-40"
                      >
                        &minus;
                      </button>
                      <span className="min-w-10 text-center text-sm">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        disabled={busy || item.quantity >= item.stock}
                        onClick={() =>
                          run(item.productId, () =>
                            updateItem(item.productId, item.quantity + 1),
                          )
                        }
                        className="px-3 py-1 text-lg disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>

                    <span className="font-semibold text-gray-900">
                      {formatPrice(item.lineTotal)}
                    </span>

                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        run(item.productId, () => removeItem(item.productId))
                      }
                      className="text-sm text-red-600 hover:underline disabled:opacity-40"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <aside className="h-fit rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Order summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600">Items</dt>
              <dd>{cart.totalItems}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Subtotal</dt>
              <dd>{formatPrice(cart.subtotal)}</dd>
            </div>
            <div className="flex justify-between border-t pt-2 text-base font-semibold">
              <dt>Total</dt>
              <dd>{formatPrice(cart.total)}</dd>
            </div>
          </dl>
          <p className="mt-2 text-xs text-gray-500">
            Payment: Cash on Delivery
          </p>

          {hasStockProblem ? (
            <button
              disabled
              className="mt-4 w-full cursor-not-allowed rounded-lg bg-gray-300 py-2.5 font-medium text-white"
            >
              Fix stock issues to continue
            </button>
          ) : (
            <Link
              to="/checkout"
              className="mt-4 block w-full rounded-lg bg-indigo-600 py-2.5 text-center font-medium text-white hover:bg-indigo-700"
            >
              Proceed to checkout
            </Link>
          )}
        </aside>
      </div>
    </div>
  );
}
