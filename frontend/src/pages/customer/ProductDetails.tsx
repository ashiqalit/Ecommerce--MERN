import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { fetchProduct } from "../../api/products";
import type { Product } from "../../types";
import { getErrorMessage } from "../../utils/errors";
import { formatPrice, stockInfo } from "../../utils/format";
import { imageSrc } from "../../utils/image";

export default function ProductDetails() {
  const { id } = useParams();
  const [result, setResult] = useState<{
    id: string;
    product: Product | null;
    error: string;
  } | null>(null);
  const [quantity, setQuantity] = useState(1);

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

          {!outOfStock && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">
                Quantity
              </span>
              <div className="flex items-center rounded-lg border border-gray-300 bg-white">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => q - 1)}
                  className="px-3 py-1.5 text-lg disabled:opacity-40"
                >
                  &minus;
                </button>
                <span className="min-w-10 text-center text-sm">{quantity}</span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  disabled={quantity >= product.stock}
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 py-1.5 text-lg disabled:opacity-40"
                >
                  +
                </button>
              </div>
            </div>
          )}

          <button
            type="button"
            disabled={outOfStock}
            className="w-full rounded-lg bg-indigo-600 py-3 font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300 md:w-auto md:px-10"
          >
            {outOfStock ? "Out of stock" : "Add to cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
