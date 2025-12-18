import Card from "../ui/Card";
import SettingButton from "../ui/SettingButton";
import { usePremium } from "../../hooks/usePremium";
import { useNavigate } from "react-router-dom";

export default function SubscriptionStatusCard() {
  const {
    loading,
    status,
    premiumEndsAt,
    trialEndsAt,
    cancelAtPeriodEnd,
    trialDaysLeft,
    startCheckout,
  } = usePremium();

  const navigate = useNavigate();

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString() : null;

  const goPortal = () => {
    const token = localStorage.getItem("token");
    window.location.href = `/api/stripe/portal?token=${token}`;
  };

  return (
    <Card>
      <h3 className="text-sm font-semibold mb-2">
        Subscription status
      </h3>

      {/* LOADING */}
      {loading && (
        <p className="text-sm text-gray-400">
          Checking subscription status…
        </p>
      )}

      {/* UNKNOWN */}
      {!loading && !status && (
        <div className="text-sm space-y-2">
          <p className="text-gray-400">
            Subscription status is syncing…
          </p>
        </div>
      )}

      {/* ACTIVE */}
      {!loading && status === "active" && (
        <div className="text-sm space-y-2">
          <p className="text-green-600">Premium active</p>

          {cancelAtPeriodEnd ? (
            <p className="text-yellow-600">
              Subscription will end on{" "}
              <strong>{formatDate(premiumEndsAt)}</strong>
            </p>
          ) : (
            <p className="text-gray-500">
              Next billing date:{" "}
              <strong>{formatDate(premiumEndsAt)}</strong>
            </p>
          )}

          <SettingButton onClick={goPortal}>
            Manage subscription
          </SettingButton>
        </div>
      )}

      {/* TRIALING */}
      {!loading && status === "trialing" && (
        <div className="text-sm space-y-2">
          <p className="text-blue-600">Free trial active</p>

          {trialEndsAt ? (
            <p className="text-gray-500">
              Ends on <strong>{formatDate(trialEndsAt)}</strong>
              {typeof trialDaysLeft === "number" ? (
                <>
                  {" "}({trialDaysLeft} day
                  {trialDaysLeft === 1 ? "" : "s"} left)
                </>
              ) : null}
            </p>
          ) : (
            <p className="text-gray-500">
              Trial is active.
            </p>
          )}

          <SettingButton onClick={() => navigate("/premium")}>
            Upgrade to Premium
          </SettingButton>
        </div>
      )}

      {/* PAST DUE */}
      {!loading && status === "past_due" && (
        <div className="text-sm space-y-2">
          <p className="text-red-600">Payment failed</p>
          <p className="text-gray-500">
            Please update your billing details to keep Premium access.
          </p>

          <SettingButton onClick={goPortal}>
            Fix payment
          </SettingButton>
        </div>
      )}

      {/* CANCELED / EXPIRED */}
      {!loading && status === "canceled" && (
        <div className="text-sm space-y-2">
          <p className="text-gray-500">Free plan</p>
          <p className="text-gray-400">
            Premium is not active.
          </p>

          <SettingButton onClick={() => navigate("/premium")}>
            Upgrade to Premium
          </SettingButton>
        </div>
      )}

      {/* FALLBACK FOR ANY OTHER STATUS */}
      {!loading &&
        status &&
        !["active", "trialing", "past_due", "canceled"].includes(status) && (
          <div className="text-sm space-y-2">
            <p className="text-gray-400">
              Status: <strong>{status}</strong>
            </p>
            <SettingButton onClick={() => navigate("/premium")}>
              Upgrade to Premium
            </SettingButton>
          </div>
        )}
    </Card>
  );
}
