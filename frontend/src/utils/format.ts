const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
});

export const formatPrice = (value: string | number) =>
  currency.format(Number(value));

export function stockInfo(stock: number) {
  if (stock <= 0) {
    return { label: "Out of stock", className: "bg-red-100 text-red-700" };
  }
  if (stock <= 5) {
    return {
      label: `Only ${stock} left`,
      className: "bg-amber-100 text-amber-700",
    };
  }
  return { label: "In stock", className: "bg-green-100 text-green-700" };
}
