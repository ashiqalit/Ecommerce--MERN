import type { OrderStatus } from "../types";
import { statusInfo } from "../utils/format";

export function StatusBadge({ status }: { status: OrderStatus }) {
  const info = statusInfo(status);
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${info.className}`}
    >
      {info.label}
    </span>
  );
}
