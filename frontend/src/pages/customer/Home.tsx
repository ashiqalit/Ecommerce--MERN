import { useEffect, useState } from "react";
import { fetchCategories, fetchProducts } from "../../api/products";
import { Pagination } from "../../components/Pagination";
import { ProductCard } from "../../components/ProductCard";
import { useDebounce } from "../../hooks/useDebounce";
import type { Category, ProductList } from "../../types";
import { getErrorMessage } from "../../utils/errors";

const PAGE_SIZE = 12;

export default function Home() {
  const [searchInput, setSearchInput] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [page, setPage] = useState(1);

  const [categories, setCategories] = useState<Category[]>([]);
  const [result, setResult] = useState<{
    key: string;
    data: ProductList | null;
    error: string;
  } | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const search = useDebounce(searchInput.trim(), 400);

  const requestKey = `${search}|${categoryId ?? ""}|${page}|${reloadKey}`;
  const loading = result?.key !== requestKey;
  const data = result?.data ?? null;
  const error = !loading && result ? result.error : "";

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetchProducts({
      search: search || undefined,
      categoryId,
      page,
      limit: PAGE_SIZE,
    })
      .then((data) => {
        if (!cancelled) setResult({ key: requestKey, data, error: "" });
      })
      .catch((err) => {
        if (!cancelled) {
          setResult({
            key: requestKey,
            data: null,
            error: getErrorMessage(err),
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [search, categoryId, page, requestKey]);

  function handleSearchChange(value: string) {
    setSearchInput(value);
    setPage(1);
  }

  function handleCategoryChange(value: string) {
    setCategoryId(value ? Number(value) : undefined);
    setPage(1);
  }

  function handlePageChange(next: number) {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function clearFilters() {
    setSearchInput("");
    setCategoryId(undefined);
    setPage(1);
  }

  const hasFilters = searchInput !== "" || categoryId !== undefined;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Products</h1>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search products by name..."
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select
          value={categoryId ?? ""}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 sm:w-56"
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {error ? (
        <div
          role="alert"
          className="mt-8 rounded-lg bg-red-50 p-4 text-sm text-red-700"
        >
          <p>{error}</p>
          <button
            onClick={() => setReloadKey((key) => key + 1)}
            className="mt-2 font-medium underline"
          >
            Try again
          </button>
        </div>
      ) : loading && !data ? (
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[3/4] animate-pulse rounded-2xl bg-gray-200"
            />
          ))}
        </div>
      ) : data ? (
        data.items.length === 0 ? (
          <div className="mt-12 text-center text-gray-600">
            <p>No products found.</p>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="mt-2 text-indigo-600 hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="mt-4 text-sm text-gray-600">
              {data.pagination.total} product
              {data.pagination.total === 1 ? "" : "s"}
            </p>
            <div
              className={`mt-3 grid grid-cols-2 gap-4 transition-opacity md:grid-cols-3 lg:grid-cols-4 ${
                loading ? "opacity-50" : ""
              }`}
            >
              {data.items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {data.pagination.totalPages > 1 && (
              <Pagination
                page={data.pagination.page}
                totalPages={data.pagination.totalPages}
                onChange={handlePageChange}
              />
            )}
          </>
        )
      ) : null}
    </div>
  );
}
