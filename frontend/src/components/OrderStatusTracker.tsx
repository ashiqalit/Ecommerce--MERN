import type { OrderStatus } from "../types";
import { statusInfo } from "../utils/format";

const steps: OrderStatus[] = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"];

export function OrderStatusTracker({ status }: { status: OrderStatus }) {
  if (status === "CANCELLED") {
    return (
      <div
        role="status"
        className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
      >
        This order was cancelled.
      </div>
    );
  }

  const current = steps.indexOf(status);

  return (
    <ol className="flex w-full">
      {steps.map((step, index) => {
        const done = index <= current;
        return (
          <li
            key={step}
            className="flex flex-1 flex-col items-center text-center text-xs"
          >
            <div className="flex w-full items-center">
              <div
                className={`h-0.5 flex-1 ${
                  index === 0
                    ? "bg-transparent"
                    : done
                      ? "bg-indigo-600"
                      : "bg-gray-300"
                }`}
              />
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-white ${
                  done ? "bg-indigo-600" : "bg-gray-300"
                }`}
              >
                {done ? "✓" : ""}
              </div>
              <div
                className={`h-0.5 flex-1 ${
                  index === steps.length - 1
                    ? "bg-transparent"
                    : index < current
                      ? "bg-indigo-600"
                      : "bg-gray-300"
                }`}
              />
            </div>
            <span
              className={`mt-1 ${
                done ? "font-medium text-gray-900" : "text-gray-500"
              }`}
            >
              {statusInfo(step).label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
