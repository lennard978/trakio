import React from "react";
import { useNavigate } from "react-router-dom";
import { FiAlertTriangle } from "react-icons/fi";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center px-6">
      <FiAlertTriangle className="text-6xl text-orange-500 mb-4" />
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
        Page Not Found
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mt-2 mb-6 max-w-sm">
        The page you’re looking for doesn’t exist or may have been moved.
      </p>

      <button
        onClick={() => navigate("/dashboard")}
        className="px-6 py-2 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-all"
      >
        Back to Dashboard
      </button>
    </div>
  );
}
