import React, { useMemo } from "react";
import { getForgottenSubscriptions } from "../utils/forgottenSubscriptions";

export default function ForgottenSubscriptions({ subscriptions }) {
  const forgotten = useMemo(
    () => getForgottenSubscriptions(subscriptions),
    [subscriptions]
  );

  if (forgotten.length === 0) return null;

  return (
    <div className="
      bg-yellow-500/5 dark:bg-yellow-500/10
      border border-yellow-500/20
      rounded-xl p-4 mb-4
    ">
      <h3 className="text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-3 text-center">
        Subscriptions you may have forgotten
      </h3>

      <ul className="space-y-2 text-sm">
        {forgotten.map((s) => (
          <li
            key={s.id}
            className="flex justify-between items-center"
          >
            <span className="font-medium">
              {s.name}
            </span>

            <span className="text-xs text-yellow-700 dark:text-yellow-300">
              Last paid {s.overdueDays} days ago
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
