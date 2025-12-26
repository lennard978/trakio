import { Link } from "react-router-dom";
import { useCurrency } from "../../context/CurrencyContext";
import { usePremium } from "../../hooks/usePremium";
import { useTranslation, Trans } from "react-i18next";

export default function EmptyDashboardState() {
  const { currency } = useCurrency();
  const { isPremium } = usePremium();
  const { t } = useTranslation();

  return (
    <div className="mt-12 mb-8 text-center px-4">
      {/* Title */}
      <h1 className="text-3xl font-bold tracking-tight mb-3">
        {t("insights_no_subscriptions")}
      </h1>

      {/* Description */}
      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
        <Trans i18nKey="dashboard_intro_text" values={{ currency }} components={{ 1: <strong /> }} />

      </p>

      {/* CTA */}
      <Link to="/add">
        <button
          className="
            relative inline-flex items-center justify-center gap-2
            px-7 py-4 rounded-2xl
            bg-orange-500 hover:bg-orange-600
            text-white font-semibold text-base
            shadow-lg shadow-orange-500/30
            transition-all duration-200
            hover:scale-[1.03]
            active:scale-[0.97]
          "
        >
          {/* Glow animation */}
          <span
            className="
              absolute inset-0 rounded-2xl
              bg-orange-400 opacity-30 blur-xl
              animate-pulse
            "
          />

          <span className="relative text-xl leading-none">＋</span>
          <span className="relative">{t("add_first")}</span>
        </button>
      </Link>

      {/* Premium teaser */}
      {!isPremium && (
        <div className="mt-4 text-xs text-orange-600 dark:text-orange-400">
          {t("premium_unlock")}
        </div>
      )}

      {/* Feature bullets */}
      <div className="mt-10 space-y-4 text-left max-w-sm mx-auto">
        <Feature icon="👁️" text={t("track")} />
        <Feature icon="🔔" text={t("get")} />
        <Feature icon="📈" text={t("analyze")} />
      </div>
    </div>
  );
}

function Feature({ icon, text }) {
  return (
    <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
      <div
        className="
          flex items-center justify-center
          w-9 h-9 rounded-full
          bg-orange-100 dark:bg-orange-900/30
          text-orange-600 dark:text-orange-400
        "
      >
        {icon}
      </div>
      <span className="text-sm">{text}</span>
    </div>
  );
}