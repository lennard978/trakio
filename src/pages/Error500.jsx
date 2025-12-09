// src/pages/Error500.jsx
import React from "react";

export default function Error500() {
  return (
    <div className="flex justify-center mt-16 px-4">
      <div className="max-w-md w-full p-8 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 text-center">
        <h1 className="text-4xl font-bold mb-3">500</h1>
        <p className="text-sm mb-4 text-gray-700 dark:text-gray-200">
          Something went wrong.
        </p>
        <a href="/" className="text-blue-600 dark:text-blue-300 hover:underline text-sm">
          Go Home
        </a>
      </div>
    </div>
  );
}
