import { useState, type FormEvent } from "react";
import { createAddressRequest, type AddressInput } from "../api/addresses";
import type { Address } from "../types";
import {
  getErrorMessage,
  getFieldErrors,
  type FieldErrors,
} from "../utils/errors";
import { FormField } from "./FormField";

const emptyForm: AddressInput = {
  fullName: "",
  phone: "",
  place: "",
  city: "",
  state: "",
  pincode: "",
};

const fields: {
  name: keyof AddressInput;
  label: string;
  autoComplete: string;
  inputMode?: "tel" | "numeric";
  maxLength?: number;
}[] = [
  { name: "fullName", label: "Full name", autoComplete: "name" },
  {
    name: "phone",
    label: "Phone number",
    autoComplete: "tel",
    inputMode: "tel",
  },
  {
    name: "place",
    label: "Address (house, street, area)",
    autoComplete: "street-address",
  },
  { name: "city", label: "City", autoComplete: "address-level2" },
  { name: "state", label: "State", autoComplete: "address-level1" },
  {
    name: "pincode",
    label: "Pincode",
    autoComplete: "postal-code",
    inputMode: "numeric",
    maxLength: 6,
  },
];

interface AddressFormProps {
  onSaved: (address: Address) => void;
  onCancel?: () => void;
}

export function AddressForm({ onSaved, onCancel }: AddressFormProps) {
  const [values, setValues] = useState<AddressInput>(emptyForm);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setFieldErrors({});
    setSubmitting(true);

    try {
      const address = await createAddressRequest(values);
      onSaved(address);
    } catch (err) {
      const found = getFieldErrors(err);
      setFieldErrors(found);
      setError(Object.keys(found).length > 0 ? "" : getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-4 rounded-2xl bg-white p-5 shadow-sm"
    >
      <h3 className="font-medium text-gray-900">New delivery address</h3>

      {error && (
        <div
          role="alert"
          className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {fields.map((field) => (
        <FormField
          key={field.name}
          label={field.label}
          name={field.name}
          autoComplete={field.autoComplete}
          inputMode={field.inputMode}
          maxLength={field.maxLength}
          value={values[field.name]}
          onChange={(e) =>
            setValues((prev) => ({ ...prev, [field.name]: e.target.value }))
          }
          error={fieldErrors[field.name]}
        />
      ))}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-indigo-600 px-5 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {submitting ? "Saving..." : "Save address"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-300 px-5 py-2 text-gray-700"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
