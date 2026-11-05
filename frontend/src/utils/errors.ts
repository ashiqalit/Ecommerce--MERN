import axios from "axios";

export type FieldErrors = Record<string, string>;

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return "Cannot reach the server. Please try again.";
    }
    return error.response.data?.message ?? "Something went wrong";
  }
  return "Something went wrong";
}

export function getFieldErrors(error: unknown): FieldErrors {
  const result: FieldErrors = {};
  if (axios.isAxiosError(error)) {
    const errors = error.response?.data?.errors;
    if (Array.isArray(errors)) {
      for (const item of errors) {
        result[item.field] = item.message;
      }
    }
  }
  return result;
}
