import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

/**
 * AGB (Allgemeine Geschäftsbedingungen)
 * - Germany / EU compliant structure
 * - Fully i18n-aware
 * - Semantic & accessible
 */
export default function AGB() {
  const { t, i18n } = useTranslation();

  const lastUpdated = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(i18n.language || "en", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date());
    } catch {
      return new Date().toISOString().slice(0, 10);
    }
  }, [i18n.language]);

  return (
    <article
      className="max-w-3xl mx-auto px-4 py-6 text-sm space-y-6 text-gray-800 dark:text-gray-200"
      aria-labelledby="agb-title"
    >
      <header className="space-y-1">
        <h1
          id="agb-title"
          className="text-2xl font-bold"
        >
          {t("agb.title")}
        </h1>
        <p className="text-xs text-gray-500">
          {t("agb.last_updated", { date: lastUpdated })}
        </p>
      </header>

      {[...Array(13).keys()].map((i) => {
        const section = i + 1;
        return (
          <section key={section} aria-labelledby={`agb-section-${section}`}>
            <h2
              id={`agb-section-${section}`}
              className="font-semibold text-lg mb-2"
            >
              {t(`agb.${section}.title`)}
            </h2>

            <p>{t(`agb.${section}.p1`)}</p>

            {t(`agb.${section}.p2`, { defaultValue: "" }) && (
              <p className="mt-2">
                {t(`agb.${section}.p2`)}
              </p>
            )}

            {t(`agb.${section}.p3`, { defaultValue: "" }) && (
              <p className="mt-2">
                {t(`agb.${section}.p3`)}
              </p>
            )}
          </section>
        );
      })}
    </article>
  );
}
