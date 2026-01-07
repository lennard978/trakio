import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

/**
 * RightOfWithdrawal
 * - EU / Germany compliant legal page
 * - Fully i18n-aware
 * - Accessible & SEO-friendly
 */
export default function RightOfWithdrawal() {
  const { t, i18n } = useTranslation();

  const today = useMemo(() => {
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
      className="max-w-3xl mx-auto p-4 text-sm space-y-6"
      aria-labelledby="right-of-withdrawal-title"
    >
      <header>
        <h1
          id="right-of-withdrawal-title"
          className="text-xl font-semibold"
        >
          {t("widerruf.title")}
        </h1>
      </header>

      <section>
        <h2 className="font-semibold">
          {t("widerruf.right.title")}
        </h2>
        <p>{t("widerruf.right.text1")}</p>
        <p>{t("widerruf.right.text2")}</p>
      </section>

      <section>
        <h2 className="font-semibold">
          {t("widerruf.exercise.title")}
        </h2>
        <p>{t("widerruf.exercise.text")}</p>
      </section>

      <section>
        <h2 className="font-semibold">
          {t("widerruf.exclusion.title")}
        </h2>
        <p>{t("widerruf.exclusion.text")}</p>
      </section>

      <footer>
        <p className="text-gray-500">
          {t("widerruf.date_label", { date: today })}
        </p>
      </footer>
    </article>
  );
}
