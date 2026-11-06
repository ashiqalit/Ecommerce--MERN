import { useEffect, useState } from "react";
import { Link } from "react-router";
import { deleteProductRequest, fetchProducts } from "../../api/products";
import { Pagination } from "../../components/Pagination";
import { useDebounce } from "../../hooks/useDebounce";
import type { ProductList } from "../../types";
import { getErrorMessage } from "../../utils/errors";
import { formatPrice } from "../../utils/format";
import { imageSrc } from "../../utils/image";

const PAGE_SIZE = 10;

export default function AdminProducts() {
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [result, setResult] = useState<{
    key: string;
    data: ProductList | null;
    error: string;
  } | null>(null);
  const [actionError, setActionError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const search = useDebounce(searchInput.trim(), 400);
  const key = `${search}|${page}|${reloadKey}`;
  const loading = result?.key !== key;
  const data = result?.data ?? null;
  const error = !loading && result ? result.error : "";

  useEffect(() => {
    let cancelled = false;

    fetchProducts({ search: search || undefined, page, limit: PAGE_SIZE })
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
  }, [search, page, key]);

  async function handleDelete(id: number, name: string) {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    setActionError("");
    try {
      await deleteProductRequest(id);
      if (data && data.items.length === 1 && page > 1) setPage(page - 1);
      else setReloadKey((k) => k + 1);
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <Link
          to="/admin/products/new"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + Add product
        </Link>
      </div>

      <input
        type="search"
        value={searchInput}
        onChange={(e) => {
          setSearchInput(e.target.value);
          setPage(1);
        }}
        placeholder="Search products by name..."
        className="mt-4 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 sm:max-w-sm"
      />

      {actionError && (
        <div
          role="alert"
          className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          {actionError}
        </div>
      )}

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
        <p className="mt-8 text-gray-600">No products found.</p>
      ) : (
        <>
          <div
            className={`mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm transition-opacity ${
              loading ? "opacity-50" : ""
            }`}
          >
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.items.map((product) => (
                  <tr key={product.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          {product.imageUrl && (
                            <img
                              src={imageSrc(product.imageUrl)}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>
                        <span className="font-medium text-gray-900">
                          {product.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {product.category.name}
                    </td>
                    <td className="px-4 py-3">{formatPrice(product.price)}</td>
                    <td
                      className={`px-4 py-3 font-medium ${
                        product.stock === 0
                          ? "text-red-600"
                          : product.stock <= 5
                            ? "text-amber-600"
                            : "text-gray-900"
                      }`}
                    >
                      {product.stock}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/admin/products/${product.id}/edit`}
                        className="mr-4 text-indigo-600 hover:underline"
                      >
                        Edit
                      </Link>
                      <button
                        disabled={deletingId === product.id}
                        onClick={() => handleDelete(product.id, product.name)}
                        className="text-red-600 hover:underline disabled:opacity-50"
                      >
                        Delete
                      </button>
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
