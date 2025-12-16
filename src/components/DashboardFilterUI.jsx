import React from "react";

export default function DashboardFilterUI({
  year,
  category,
  paymentMethod,
  currency,
  onChange,
}) {
  return (
    <div className="flex flex-wrap gap-3 items-center mb-4">
      <select
        value={year}
        onChange={(e) => onChange("year", e.target.value)}
        className="px-3 py-2 border rounded-md"
      >
        <option value="">All Years</option>
        {[2025, 2024, 2023, 2022].map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>

      <select
        value={category}
        onChange={(e) => onChange("category", e.target.value)}
        className="px-3 py-2 border rounded-md"
      >
        <option value="">All Categories</option>
        <option value="entertainment">Entertainment</option>
        <option value="productivity">Productivity</option>
        <option value="business">Business</option>
        <option value="education">Education</option>
      </select>

      <select
        value={paymentMethod}
        onChange={(e) => onChange("paymentMethod", e.target.value)}
        className="px-3 py-2 border rounded-md"
      >
        <option value="">All Payment Methods</option>
        <option value="visa">Visa</option>
        <option value="mastercard">Mastercard</option>
        <option value="paypal">PayPal</option>
        <option value="google pay">Google Pay</option>
        <option value="apple pay">Apple Pay</option>
      </select>

      <select
        value={currency}
        onChange={(e) => onChange("currency", e.target.value)}
        className="px-3 py-2 border rounded-md"
      >
        <option value="">All Currencies</option>
        <option value="EUR">EUR</option>
        <option value="USD">USD</option>
        <option value="GBP">GBP</option>
        <option value="JPY">JPY</option>
      </select>
    </div>
  );
}
