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
  } = usePremium();

  const navigate = useNavigate();

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString() : null;

  const openBillingPortal = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("/api/stripe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: "portal" }),
      });

      if (!res.ok) throw new Error("Portal error");

      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      console.error("Billing portal error:", err);
      alert("Unable to open billing settings. Please try again.");
    }
  };

  return (
    <Card>
      <h3 className="text-sm font-semibold mb-2">
        Subscription
      </h3>

      {/* LOADING */}
      {loading && (
        <p className="text-sm text-gray-400">
          Checking subscription status…
        </p>
      )}

      {/* PREMIUM ACTIVE */}
      {!loading && status === "active" && (
        <div className="space-y-2 text-sm">
          <p className="font-medium text-green-600">
            Premium active
          </p>

          {cancelAtPeriodEnd ? (
            <p className="text-gray-500">
              Access ends on{" "}
              <strong>{formatDate(premiumEndsAt)}</strong>
            </p>
          ) : (
            <p className="text-gray-500">
              Next billing date:{" "}
              <strong>{formatDate(premiumEndsAt)}</strong>
            </p>
          )}

          <SettingButton onClick={openBillingPortal}>
            Manage subscription
          </SettingButton>
        </div>
      )}

      {/* TRIAL */}
      {!loading && status === "trialing" && (
        <div className="space-y-2 text-sm">
          <p className="font-medium text-blue-600">
            Free trial active
          </p>

          {trialEndsAt && (
            <p className="text-gray-500">
              Trial ends on{" "}
              <strong>{formatDate(trialEndsAt)}</strong>
              {typeof trialDaysLeft === "number" && (
                <>
                  {" "}({trialDaysLeft} day
                  {trialDaysLeft === 1 ? "" : "s"} left)
                </>
              )}
            </p>
          )}

          <SettingButton onClick={() => navigate("/premium")}>
            Upgrade to Premium
          </SettingButton>
        </div>
      )}

      {/* PAYMENT ISSUE */}
      {!loading && status === "past_due" && (
        <div className="space-y-2 text-sm">
          <p className="font-medium text-red-600">
            Payment issue
          </p>
          <p className="text-gray-500">
            Please update your billing details to keep Premium access.
          </p>

          <SettingButton onClick={openBillingPortal}>
            Fix payment
          </SettingButton>
        </div>
      )}

      {/* FREE PLAN */}
      {!loading && status === "canceled" && (
        <div className="space-y-2 text-sm">
          <p className="font-medium text-gray-700 dark:text-gray-300">
            Free plan
          </p>
          <p className="text-gray-500">
            You are currently using the free version.
          </p>

          <SettingButton onClick={() => navigate("/premium")}>
            Upgrade to Premium
          </SettingButton>
        </div>
      )}

      {/* FALLBACK */}
      {!loading &&
        status &&
        !["active", "trialing", "past_due", "canceled"].includes(status) && (
          <div className="space-y-2 text-sm">
            <p className="text-gray-500">
              Subscription status: <strong>{status}</strong>
            </p>

            <SettingButton onClick={() => navigate("/premium")}>
              View plans
            </SettingButton>
          </div>
        )}
    </Card>
  );
}
