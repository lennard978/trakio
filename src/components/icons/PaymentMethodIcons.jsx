// src/components/ui/PaymentMethodIcon.jsx
import React from "react";
import PropTypes from "prop-types";
import {
  FaCcVisa,
  FaCcMastercard,
  FaPaypal,
  FaGooglePay,
  FaApplePay,
  FaCcAmex,
} from "react-icons/fa";

/**
 * PaymentMethodIcon
 * Renders a credit/payment method icon based on method string.
 */
export default function PaymentMethodIcon({ method, className = "" }) {
  if (!method) return null;

  const normalized = method.toLowerCase();

  const iconProps = {
    className: `inline-block text-lg ${className}`,
    "aria-hidden": true,
  };

  switch (normalized) {
    case "visa":
      return <FaCcVisa {...iconProps} className={`${iconProps.className} text-blue-600`} />;
    case "mastercard":
      return <FaCcMastercard {...iconProps} className={`${iconProps.className} text-red-600`} />;
    case "paypal":
      return <FaPaypal {...iconProps} className={`${iconProps.className} text-blue-400`} />;
    case "google pay":
    case "googlepay":
      return <FaGooglePay {...iconProps} className={`${iconProps.className} text-gray-800`} />;
    case "apple pay":
    case "applepay":
      return <FaApplePay {...iconProps} className={`${iconProps.className} text-gray-600`} />;
    case "amex":
    case "american express":
      return <FaCcAmex {...iconProps} className={`${iconProps.className} text-indigo-600`} />;
    default:
      return null;
  }
}

/* ------------------------------------------------------------------ */
/* PropTypes                                                          */
/* ------------------------------------------------------------------ */

PaymentMethodIcon.propTypes = {
  method: PropTypes.string,
  className: PropTypes.string,
};
