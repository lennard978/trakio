import React from "react";
import { CheckIcon } from "@heroicons/react/24/solid";

export default function PremiumFeatureRow({
  title,
  free = false,
  premium = false,
}) {
  return (
    <div className="flex items-center justify-between py-2 text-sm">
      <span className="text-gray-700 dark:text-gray-300">
        {title}
      </span>

      <div className="flex gap-6">
        <span className="w-6 flex justify-center">
          {free && <CheckIcon className="w-5 h-5 text-orange-600" />}
        </span>

        <span className="w-6 flex justify-center">
          {premium && <CheckIcon className="w-5 h-5 text-orange-400" />}
        </span>
      </div>
    </div>
  );
}
