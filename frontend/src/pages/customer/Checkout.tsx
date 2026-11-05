import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { fetchAddresses } from "../../api/addresses";
import { placeOrderRequest } from "../../api/orders";
import { AddressForm } from "../../components/AddressForm";
import { useCart } from "../../context/useCart";
import type { Address } from "../../types";
import { getErrorMessage } from "../../utils/errors";
import { formatPrice } from "../../utils/format";

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, loading: cartLoading, error: cartError, reload } = useCart();

  const [addressState, setAddressState] = useState<{
    addresses: Address[];
    error: string;
  } | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState("");

  useEffect(() => {
    let cancelled = false;

    fetchAddresses()
      .then((addresses) => {
        if (!cancelled) setAddressState({ addresses, error: "" });
      })
      .catch((err) => {
        if (!cancelled) {
          setAddressState({ addresses: [], error: getErrorMessage(err) });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const addresses = addressState?.addresses ?? [];
  const addressesLoading = addressState === null;
  const selected = selectedId ?? addresses[0]?.id ?? null;
  const formVisible =
    showForm ||
    (addressState !== null && !addressState.error && addresses.length === 0);

  function handleSaved(address: Address) {
    setAddressState((prev) => ({
      addresses: [address, ...(prev?.addresses ?? [])],
      error: "",
    }));
    setSelectedId(address.id);
    setShowForm(false);
  }

  async function handlePlaceOrder() {
    if (selected === null) return;
    setPlacing(true);
    setOrderError("");

    try {
      const order = await placeOrderRequest(selected);
      reload();
      navigate(`/orders/${order.id}`, {
        replace: true,
        state: { placed: true },
      });
    } catch (err) {
      setOrderError(getErrorMessage(err));
      reload();
      setPlacing(false);
    }
  }

  if (cartLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
        <div className="mt-6 h-48 animate-pulse rounded-2xl bg-gray-200" />
      </div>
    );
  }

  if (cartError || !cart) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
        <div
          role="alert"
          className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700"
        >
          <p>{cartError || "Could not load your cart"}</p>
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
      <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="space-y-4 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900">
            Delivery address
          </h2>

          {addressesLoading && (
            <div className="h-24 animate-pulse rounded-lg bg-gray-200" />
          )}

          {addressState?.error && (
            <div
              role="alert"
              className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
            >
              {addressState.error}
            </div>
          )}

          {addresses.length > 0 && (
            <ul className="space-y-3">
              {addresses.map((address) => (
                <li key={address.id}>
                  <label
                    className={`flex cursor-pointer gap-3 rounded-lg border p-4 ${
                      selected === address.id
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selected === address.id}
                      onChange={() => setSelectedId(address.id)}
                      className="mt-1"
                    />
                    <span className="text-sm text-gray-700">
                      <span className="block font-medium text-gray-900">
                        {address.fullName} · {address.phone}
                      </span>
                      {address.place}, {address.city}, {address.state} -{" "}
                      {address.pincode}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}

          {formVisible ? (
            <AddressForm
              onSaved={handleSaved}
              onCancel={
                addresses.length > 0 ? () => setShowForm(false) : undefined
              }
            />
          ) : (
            !addressesLoading && (
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="text-sm font-medium text-indigo-600 hover:underline"
              >
                + Add a new address
              </button>
            )
          )}
        </section>

        <aside className="h-fit rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Order summary</h2>

          <ul className="mt-4 space-y-2 text-sm">
            {cart.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-3">
                <span className="text-gray-700">
                  {item.name} × {item.quantity}
                </span>
                <span>{formatPrice(item.lineTotal)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex justify-between border-t pt-3 text-base font-semibold">
            <span>Total</span>
            <span>{formatPrice(cart.total)}</span>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Payment: Cash on Delivery. Pay when your order arrives.
          </p>

          {hasStockProblem && (
            <p className="mt-3 text-sm text-red-600">
              Some items are over the available stock.{" "}
              <Link to="/cart" className="underline">
                Update your cart
              </Link>
            </p>
          )}

          {orderError && (
            <p role="alert" className="mt-3 text-sm text-red-600">
              {orderError}
            </p>
          )}

          <button
            type="button"
            onClick={handlePlaceOrder}
            disabled={placing || selected === null || hasStockProblem}
            className="mt-4 w-full rounded-lg bg-indigo-600 py-2.5 font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {placing ? "Placing order..." : "Place order (Cash on Delivery)"}
          </button>
          {selected === null && !addressesLoading && (
            <p className="mt-2 text-xs text-gray-500">
              Add a delivery address to place your order.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
