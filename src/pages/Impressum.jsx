import React from "react";
import { useTranslation } from "react-i18next";
import Card from "../components/ui/Card";

/**
 * Impressum
 * - Germany (§5 TMG) compliant
 * - Fully i18n-driven
 * - Semantic & accessible
 */
export default function Impressum() {
  const { t } = useTranslation();

  const name = t("impressum.address.name");
  const streetAndNo = t("impressum.address.street");
  const zipCity = t("impressum.address.zip");
  const country = t("impressum.address.country");
  const email = t("impressum.contact.email");

  return (
    <article
      className="max-w-3xl mx-auto p-4 space-y-6"
      aria-labelledby="impressum-title"
    >
      <header className="px-1 space-y-1">
        <h1
          id="impressum-title"
          className="text-2xl font-bold text-gray-900 dark:text-gray-100"
        >
          {t("impressum.title")}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t("impressum.subtitle")}
        </p>
      </header>

      <Card className="space-y-6">
        {/* Service provider */}
        <section>
          <h2 className="text-lg font-semibold">
            {t("impressum.provider.title")}
          </h2>
          <address className="not-italic text-sm text-gray-700 dark:text-gray-300 leading-6">
            <div>{name}</div>
            <div>{streetAndNo}</div>
            <div>{zipCity}</div>
            <div>{country}</div>
            <div>{t("impressum.provider.business_type")}</div>
          </address>
        </section>

        {/* Contact */}
        <section>
          <h2 className="text-lg font-semibold">
            {t("impressum.contact.title")}
          </h2>
          <div className="text-sm text-gray-700 dark:text-gray-300 leading-6">
            <div>
              {t("impressum.contact.email_label")}:{" "}
              <a
                className="underline"
                href={`mailto:${email}`}
              >
                {email}
              </a>
            </div>
          </div>
        </section>

        {/* VAT */}
        <section>
          <h2 className="text-lg font-semibold">
            {t("impressum.vat.title")}
          </h2>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {t("impressum.vat.text")}
          </p>
        </section>

        {/* Disclaimer */}
        <section>
          <h2 className="text-lg font-semibold">
            {t("impressum.disclaimer.title")}
          </h2>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {t("impressum.disclaimer.text")}
          </p>
        </section>
      </Card>
    </article>
  );
}
