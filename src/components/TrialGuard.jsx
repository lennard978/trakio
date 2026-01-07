import React from "react";
import { usePremium } from "../hooks/usePremium";
import TrialExpired from "../pages/TrialExpired";
import DashboardLoading from "./dasboard/DashboardLoading";
export default function TrialGuard({ children }) {
  const premium = usePremium();

  if (premium.loading) return <DashboardLoading fullScreen />;
  if (premium.trialExpired && !premium.isPremium) return <TrialExpired />;
  return children;
}

import PropTypes from "prop-types";

TrialGuard.propTypes = {
  children: PropTypes.node.isRequired,
};
