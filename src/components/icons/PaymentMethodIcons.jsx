import {
  FaCcVisa,
  FaCcMastercard,
  FaPaypal,
  FaGooglePay,
  FaApplePay,
  FaCcAmex,
} from "react-icons/fa";

export default function PaymentMethodIcon({ method }) {
  switch (method?.toLowerCase()) {
    case "visa":
      return <FaCcVisa className="text-blue-600" />;
    case "mastercard":
      return <FaCcMastercard className="text-red-600" />;
    case "paypal":
      return <FaPaypal className="text-blue-400" />;
    case "google pay":
      return <FaGooglePay className="text-gray-800" />;
    case "apple pay":
      return <FaApplePay className="text-gray-600" />;
    case "amex":
      return <FaCcAmex className="text-indigo-600" />;
    default:
      return null;
  }
}
