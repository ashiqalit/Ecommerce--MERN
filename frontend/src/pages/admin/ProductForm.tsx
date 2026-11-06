import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  createProductRequest,
  fetchCategories,
  fetchProduct,
  updateProductRequest,
  uploadProductImage,
} from "../../api/products";
import { FormField } from "../../components/FormField";
import type { Category, Product } from "../../types";
import {
  getErrorMessage,
  getFieldErrors,
  type FieldErrors,
} from "../../utils/errors";
import { imageSrc } from "../../utils/image";

type FormValues = {
  name: string;
  description: string;
  price: string;
  stock: string;
  categoryId: string;
  imageUrl: string;
};

const inputClass = (hasError: boolean) =>
  `w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${
    hasError ? "border-red-500" : "border-gray-300"
  }`;

export default function ProductFormPage() {
  const { id } = useParams();
  const key = id ?? "new";

  const [state, setState] = useState<{
    key: string;
    product: Product | null;
    categories: Category[];
    error: string;
  } | null>(null);

  const loading = state?.key !== key;

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      fetchCategories(),
      id ? fetchProduct(Number(id)) : Promise.resolve(null),
    ])
      .then(([categories, product]) => {
        if (!cancelled) setState({ key, categories, product, error: "" });
      })
      .catch((err) => {
        if (!cancelled) {
          setState({
            key,
            categories: [],
            product: null,
            error: getErrorMessage(err),
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id, key]);

  const backLink = (
    <Link
      to="/admin/products"
      className="text-sm text-indigo-600 hover:underline"
    >
      &larr; Back to products
    </Link>
  );

  if (loading) {
    return (
      <div>
        {backLink}
        <div className="mt-6 h-96 max-w-2xl animate-pulse rounded-2xl bg-gray-200" />
      </div>
    );
  }

  if (state.error) {
    return (
      <div>
        {backLink}
        <div
          role="alert"
          className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700"
        >
          {state.error}
        </div>
      </div>
    );
  }

  return (
    <div>
      {backLink}
      <h1 className="mt-4 text-2xl font-bold text-gray-900">
        {state.product ? "Edit product" : "Add product"}
      </h1>
      <ProductFields
        key={key}
        product={state.product}
        categories={state.categories}
      />
    </div>
  );
}

function ProductFields({
  product,
  categories,
}: {
  product: Product | null;
  categories: Category[];
}) {
  const navigate = useNavigate();

  const [values, setValues] = useState<FormValues>({
    name: product?.name ?? "",
    description: product?.description ?? "",
    price: product?.price ?? "",
    stock: String(product?.stock ?? 0),
    categoryId: product ? String(product.categoryId) : "",
    imageUrl: product?.imageUrl ?? "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  function setField(name: keyof FormValues, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    setUploadError("");
    try {
      const url = await uploadProductImage(file);
      setField("imageUrl", url);
    } catch (err) {
      setUploadError(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setFieldErrors({});
    setSubmitting(true);

    const imageUrl = values.imageUrl.trim();
    const payload = {
      name: values.name,
      description: values.description,
      price: Number(values.price),
      stock: Number(values.stock),
      categoryId: Number(values.categoryId),
      ...(imageUrl && { imageUrl }),
    };

    try {
      if (product) await updateProductRequest(product.id, payload);
      else await createProductRequest(payload);
      navigate("/admin/products");
    } catch (err) {
      const found = getFieldErrors(err);
      setFieldErrors(found);
      setError(Object.keys(found).length > 0 ? "" : getErrorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="mt-6 max-w-2xl space-y-4 rounded-2xl bg-white p-6 shadow-sm"
    >
      {error && (
        <div
          role="alert"
          className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <FormField
        label="Name"
        name="name"
        value={values.name}
        onChange={(e) => setField("name", e.target.value)}
        error={fieldErrors.name}
      />

      <div>
        <label
          htmlFor="description"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Description
        </label>
        <textarea
          id="description"
          rows={4}
          value={values.description}
          onChange={(e) => setField("description", e.target.value)}
          className={inputClass(!!fieldErrors.description)}
        />
        {fieldErrors.description && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.description}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Price (₹)"
          name="price"
          type="number"
          step="0.01"
          min="0"
          value={values.price}
          onChange={(e) => setField("price", e.target.value)}
          error={fieldErrors.price}
        />
        <FormField
          label="Stock quantity"
          name="stock"
          type="number"
          min="0"
          value={values.stock}
          onChange={(e) => setField("stock", e.target.value)}
          error={fieldErrors.stock}
        />
      </div>

      <div>
        <label
          htmlFor="categoryId"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Category
        </label>
        <select
          id="categoryId"
          value={values.categoryId}
          onChange={(e) => setField("categoryId", e.target.value)}
          className={inputClass(!!fieldErrors.categoryId)}
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {fieldErrors.categoryId && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.categoryId}</p>
        )}
        {categories.length === 0 && (
          <p className="mt-1 text-sm text-gray-500">
            No categories yet.{" "}
            <Link
              to="/admin/categories"
              className="text-indigo-600 hover:underline"
            >
              Create one first
            </Link>
          </p>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">Product image</p>

        {values.imageUrl && (
          <img
            src={imageSrc(values.imageUrl)}
            alt="Preview"
            className="h-32 w-32 rounded-lg bg-gray-100 object-cover"
          />
        )}

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFile}
          disabled={uploading}
          className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium"
        />
        {uploading && <p className="text-sm text-gray-500">Uploading...</p>}
        {uploadError && (
          <p role="alert" className="text-sm text-red-600">
            {uploadError}
          </p>
        )}

        <FormField
          label="Or paste an image URL"
          name="imageUrl"
          placeholder="https://... or /uploads/..."
          value={values.imageUrl}
          onChange={(e) => setField("imageUrl", e.target.value)}
          error={fieldErrors.imageUrl}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting || uploading}
          className="rounded-lg bg-indigo-600 px-6 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {submitting
            ? "Saving..."
            : product
              ? "Save changes"
              : "Create product"}
        </button>
        <Link
          to="/admin/products"
          className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
