import React from "react";
import PropTypes from "prop-types";
import LoadingSpinner from "../LoadingSpinner";

export default function DashboardLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      className="flex flex-col items-center justify-center h-screen text-center px-4"
    >
      <LoadingSpinner size="lg" />
      <p className="text-gray-600 dark:text-gray-300 text-sm mt-4">
        Loading dashboard...
      </p>
    </div>
  );
}

DashboardLoading.propTypes = {
  size: PropTypes.oneOfType([
    PropTypes.oneOf(["sm", "md", "lg"]),
    PropTypes.number,
  ]),
  fullScreen: PropTypes.bool,
};
