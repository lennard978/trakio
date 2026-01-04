import React from "react";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col justify-center items-center h-40">
      <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
