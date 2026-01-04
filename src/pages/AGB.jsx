import React from "react";
import { useTranslation } from "react-i18next";

export default function AGB() {
  const { t } = useTranslation();

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 text-sm space-y-6 text-gray-800 dark:text-gray-200">
      <h1 className="text-2xl font-bold">{t("agb.title")}</h1>
      <p className="text-xs text-gray-500">{t("agb.last_updated")}</p>

      {[...Array(13).keys()].map((i) => {
        const section = i + 1;
        return (
          <section key={section}>
            <h2 className="font-semibold text-lg mb-2">{t(`agb.${section}.title`)}</h2>
            <p>{t(`agb.${section}.p1`)}</p>
            {t(`agb.${section}.p2`, { defaultValue: "" }) && (
              <p className="mt-2">{t(`agb.${section}.p2`)}</p>
            )}
            {t(`agb.${section}.p3`, { defaultValue: "" }) && (
              <p className="mt-2">{t(`agb.${section}.p3`)}</p>
            )}
          </section>
        );
      })}
    </div>
  );
}
