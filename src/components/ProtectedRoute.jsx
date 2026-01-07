// /src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import DashboardLoading from "./dasboard/DashboardLoading";
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <DashboardLoading fullScreen />;
  if (!user) return <Navigate to={`/?redirect=${location.pathname}`} replace />;
  return children;
}

import PropTypes from "prop-types";

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};
