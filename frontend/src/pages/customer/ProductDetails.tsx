import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import { fetchProduct } from "../../api/products";
import { useAuth } from "../../context/useAuth";
import { useCart } from "../../context/useCart";
import type { Product } from "../../types";
import { getErrorMessage } from "../../utils/errors";
import { formatPrice, stockInfo } from "../../utils/format";
import { imageSrc } from "../../utils/image";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { cart, addItem } = useCart();

  const [result, setResult] = useState<{
    id: string;
    product: Product | null;
    error: string;
  } | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const loading = !!id && result?.id !== id;
  const product = result?.product ?? null;
  const error = !loading && result ? result.error : "";

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    fetchProduct(Number(id))
      .then((product) => {
        if (!cancelled) setResult({ id, product, error: "" });
      })
      .catch((err) => {
        if (!cancelled) {
          setResult({ id, product: null, error: getErrorMessage(err) });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleAddToCart() {
    if (!product) return;
    if (!user) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    setAdding(true);
    setMessage(null);
    try {
      await addItem(product.id, quantity);
      setQuantity(1);
      setMessage({ type: "success", text: "Added to cart" });
    } catch (err) {
      setMessage({ type: "error", text: getErrorMessage(err) });
    } finally {
      setAdding(false);
    }
  }

  const backLink = (
    <Link to="/" className="text-sm text-indigo-600 hover:underline">
      &larr; Back to products
    </Link>
  );

  if (loading) {
    return (
      <div>
        {backLink}
        <div className="mt-6 grid gap-8 md:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-2xl bg-gray-200" />
          <div className="space-y-4">
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
            <div className="h-8 w-3/4 animate-pulse rounded bg-gray-200" />
            <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />
            <div className="h-24 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div>
        {backLink}
        <div
          role="alert"
          className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700"
        >
          {error || "Product not found"}
        </div>
      </div>
    );
  }

  const stock = stockInfo(product.stock);
  const outOfStock = product.stock <= 0;
  const isAdmin = user?.role === "ADMIN";

  const inCart =
    cart?.items.find((item) => item.productId === product.id)?.quantity ?? 0;
  const available = product.stock - inCart;
  const selected = Math.max(1, Math.min(quantity, available));

  let buttonLabel = "Add to cart";
  if (outOfStock) buttonLabel = "Out of stock";
  else if (isAdmin) buttonLabel = "Admins cannot place orders";
  else if (available <= 0) buttonLabel = "Maximum quantity in cart";
  else if (adding) buttonLabel = "Adding...";

  const buttonDisabled = outOfStock || isAdmin || available <= 0 || adding;

  return (
    <div>
      {backLink}

      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-2xl bg-gray-100">
          {product.imageUrl ? (
            <img
              src={imageSrc(product.imageUrl)}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              No image
            </div>
          )}
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-500">{product.category.name}</p>
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

          <div className="flex items-center gap-3">
            <span className="text-2xl font-semibold text-gray-900">
              {formatPrice(product.price)}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${stock.className}`}
            >
              {stock.label}
            </span>
          </div>

          {product.description && (
            <p className="whitespace-pre-line text-gray-600">
              {product.description}
            </p>
          )}

          {!outOfStock && !isAdmin && available > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">
                Quantity
              </span>
              <div className="flex items-center rounded-lg border border-gray-300 bg-white">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  disabled={selected <= 1}
                  onClick={() => setQuantity(selected - 1)}
                  className="px-3 py-1.5 text-lg disabled:opacity-40"
                >
                  &minus;
                </button>
                <span className="min-w-10 text-center text-sm">{selected}</span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  disabled={selected >= available}
                  onClick={() => setQuantity(selected + 1)}
                  className="px-3 py-1.5 text-lg disabled:opacity-40"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {inCart > 0 && (
            <p className="text-sm text-gray-600">
              {inCart} already in your{" "}
              <Link to="/cart" className="text-indigo-600 hover:underline">
                cart
              </Link>
            </p>
          )}

          <button
            type="button"
            disabled={buttonDisabled}
            onClick={handleAddToCart}
            className="w-full rounded-lg bg-indigo-600 py-3 font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300 md:w-auto md:px-10"
          >
            {buttonLabel}
          </button>

          {message && (
            <p
              role={message.type === "error" ? "alert" : "status"}
              className={`text-sm ${
                message.type === "error" ? "text-red-600" : "text-green-600"
              }`}
            >
              {message.text}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
