import React from "react";

export default function DashboardFilterUI({
  year,
  category,
  paymentMethod,
  currency,
  sortBy,
  onChange,
}) {
  return (
    <div className="flex flex-wrap gap-2 items-center mb-4">
      {/* Year */}
      <select
        value={year}
        onChange={(e) => onChange("year", e.target.value)}
        className="mt-2 px-2 py-1 rounded-xl shadow-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs"
      >
        <option value="">All Years</option>
        {[2025, 2024, 2023, 2022].map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>

      {/* Category */}
      <select
        value={category}
        onChange={(e) => onChange("category", e.target.value)}
        className="mt-2 px-2 py-1 rounded-xl shadow-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs"
      >
        <option value="">All Categories</option>
        <option value="entertainment">Entertainment</option>
        <option value="productivity">Productivity</option>
        <option value="business">Business</option>
        <option value="education">Education</option>
      </select>

      {/* Payment Method */}
      <select
        value={paymentMethod}
        onChange={(e) => onChange("paymentMethod", e.target.value)}
        className="mt-2 px-2 py-1 rounded-xl shadow-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs"
      >
        <option value="">All Payment Methods</option>
        <option value="visa">Visa</option>
        <option value="mastercard">Mastercard</option>
        <option value="paypal">PayPal</option>
        <option value="google pay">Google Pay</option>
        <option value="apple pay">Apple Pay</option>
      </select>

      {/* Sort By */}
      <select
        value={sortBy}
        onChange={(e) => onChange("sortBy", e.target.value)}
        className="mt-2 px-2 py-1 rounded-xl shadow-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs"
      >
        <option value="next">Next Payment</option>
        <option value="price">Price</option>
        <option value="name">Name</option>
        <option value="progress">Progress</option>
      </select>
    </div>
  );
}
