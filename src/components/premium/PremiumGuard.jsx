import React from "react";
import PropTypes from "prop-types";
import { usePremium } from "../../hooks/usePremium";

/**
 * PremiumGuard
 * - Conditionally renders children if user has premium
 * - Shows fallback otherwise
 * - Suppresses rendering while premium status is loading
 */
export default function PremiumGuard({ children, fallback }) {
  const { isPremium, loading } = usePremium();

  // Avoid UI flicker while checking premium status
  if (loading) return null;

  if (!isPremium) {
    return (
      fallback || (
        <div className="text-xs text-gray-400 italic">
          Premium feature
        </div>
      )
    );
  }

  return <>{children}</>;
}

/* ------------------------------------
   PropTypes
------------------------------------ */

PremiumGuard.propTypes = {
  /** Content to render when user IS premium */
  children: PropTypes.node.isRequired,

  /** Optional fallback when user is NOT premium */
  fallback: PropTypes.node,
};

/* ------------------------------------
   Default Props
------------------------------------ */

