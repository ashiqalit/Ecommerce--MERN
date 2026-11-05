import { Link } from "react-router";
import type { Product } from "../types";
import { formatPrice, stockInfo } from "../utils/format";
import { imageSrc } from "../utils/image";

export function ProductCard({ product }: { product: Product }) {
  const stock = stockInfo(product.stock);

  return (
    <Link
      to={`/products/${product.id}`}
      className="group overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="aspect-square bg-gray-100">
        {product.imageUrl ? (
          <img
            src={imageSrc(product.imageUrl)}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            No image
          </div>
        )}
      </div>

      <div className="space-y-1 p-4">
        <p className="text-xs text-gray-500">{product.category.name}</p>
        <h3 className="line-clamp-1 font-medium text-gray-900">
          {product.name}
        </h3>
        <div className="flex items-center justify-between pt-1">
          <span className="font-semibold text-gray-900">
            {formatPrice(product.price)}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${stock.className}`}
          >
            {stock.label}
          </span>
        </div>
      </div>
    </Link>
  );
}
