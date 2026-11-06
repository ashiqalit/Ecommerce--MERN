import { useEffect, useState, type FormEvent } from "react";
import { fetchCategories } from "../../api/products";
import {
  createCategoryRequest,
  deleteCategoryRequest,
  updateCategoryRequest,
} from "../../api/categories";
import type { Category } from "../../types";
import { getErrorMessage, getFieldErrors } from "../../utils/errors";

export default function AdminCategories() {
  const [reloadKey, setReloadKey] = useState(0);
  const [result, setResult] = useState<{
    key: number;
    categories: Category[];
    error: string;
  } | null>(null);

  const [name, setName] = useState("");
  const [addError, setAddError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [actionError, setActionError] = useState("");
  const [busy, setBusy] = useState(false);

  const loading = result?.key !== reloadKey;
  const categories = result?.categories ?? [];
  const error = !loading && result ? result.error : "";

  useEffect(() => {
    let cancelled = false;

    fetchCategories()
      .then((categories) => {
        if (!cancelled) setResult({ key: reloadKey, categories, error: "" });
      })
      .catch((err) => {
        if (!cancelled) {
          setResult({
            key: reloadKey,
            categories: [],
            error: getErrorMessage(err),
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const refresh = () => setReloadKey((key) => key + 1);

  async function handleAdd(event: FormEvent) {
    event.preventDefault();
    setAddError("");
    setBusy(true);
    try {
      await createCategoryRequest(name);
      setName("");
      refresh();
    } catch (err) {
      setAddError(getFieldErrors(err).name ?? getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleSave(id: number) {
    setActionError("");
    setBusy(true);
    try {
      await updateCategoryRequest(id, editName);
      setEditingId(null);
      refresh();
    } catch (err) {
      setActionError(getFieldErrors(err).name ?? getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(category: Category) {
    if (!window.confirm(`Delete category "${category.name}"?`)) return;
    setActionError("");
    setBusy(true);
    try {
      await deleteCategoryRequest(category.id);
      refresh();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Categories</h1>

      <form onSubmit={handleAdd} noValidate className="mt-6">
        <div className="flex gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New category name"
            className={`w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${
              addError ? "border-red-500" : "border-gray-300"
            }`}
          />
          <button
            type="submit"
            disabled={busy}
            className="shrink-0 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            Add
          </button>
        </div>
        {addError && <p className="mt-1 text-sm text-red-600">{addError}</p>}
      </form>

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
          <button onClick={refresh} className="mt-2 font-medium underline">
            Try again
          </button>
        </div>
      ) : !result ? (
        <div className="mt-6 h-40 animate-pulse rounded-2xl bg-gray-200" />
      ) : categories.length === 0 ? (
        <p className="mt-8 text-gray-600">No categories yet. Add one above.</p>
      ) : (
        <ul
          className={`mt-6 divide-y rounded-2xl bg-white shadow-sm transition-opacity ${
            loading ? "opacity-50" : ""
          }`}
        >
          {categories.map((category) => (
            <li
              key={category.id}
              className="flex items-center justify-between gap-3 px-4 py-3"
            >
              {editingId === category.id ? (
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  autoFocus
                  className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <div>
                  <p className="font-medium text-gray-900">{category.name}</p>
                  <p className="text-xs text-gray-500">
                    {category._count?.products ?? 0} product
                    {category._count?.products === 1 ? "" : "s"}
                  </p>
                </div>
              )}

              <div className="flex shrink-0 gap-3 text-sm">
                {editingId === category.id ? (
                  <>
                    <button
                      disabled={busy}
                      onClick={() => handleSave(category.id)}
                      className="font-medium text-indigo-600 hover:underline disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-gray-600 hover:underline"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setEditingId(category.id);
                        setEditName(category.name);
                        setActionError("");
                      }}
                      className="text-indigo-600 hover:underline"
                    >
                      Rename
                    </button>
                    <button
                      disabled={busy}
                      onClick={() => handleDelete(category)}
                      className="text-red-600 hover:underline disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
