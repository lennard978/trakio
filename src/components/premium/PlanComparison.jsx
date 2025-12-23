import React from "react";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";

function Row({ label, free, premium }) {
  return (
    <div className="grid grid-cols-3 items-center py-2 text-sm">
      <div className="text-gray-700 dark:text-gray-300">{label}</div>

      <div className="flex justify-center">
        {free ? (
          <CheckIcon className="w-5 h-5 text-green-600" />
        ) : (
          <XMarkIcon className="w-5 h-5 text-gray-400" />
        )}
      </div>

      <div className="flex justify-center">
        {premium ? (
          <CheckIcon className="w-5 h-5 text-green-600" />
        ) : (
          <XMarkIcon className="w-5 h-5 text-gray-400" />
        )}
      </div>
    </div>
  );
}

export default function PlanComparison() {
  return (
    <div className="border rounded-2xl p-5 dark:border-gray-800">
      <h2 className="text-lg font-semibold mb-4">
        Free vs Premium
      </h2>

      {/* HEADER */}
      <div className="grid grid-cols-3 text-xs font-medium text-gray-500 mb-2">
        <div />
        <div className="text-center">Free</div>
        <div className="text-center">Premium</div>
      </div>

      <div className="divide-y dark:divide-gray-800">
        <Row label="Track subscriptions" free premium />
        <Row label="Upcoming payments timeline" free premium />
        <Row label="Monthly budget & progress" free={false} premium />
        <Row label="Forgotten subscription detection" free={false} premium />
        <Row label="Price increase alerts" free={false} premium />
        <Row label="Advanced analytics" free={false} premium />
        <Row label="CSV export" free={false} premium />
      </div>
    </div>
  );
}
