import React from "react";
import { useTranslation } from "react-i18next";
import Card from "../components/ui/Card";

export default function Impressum() {
  const { t } = useTranslation();

  const name = t("impressum.address.name");
  const streetAndNo = t("impressum.address.street");
  const zipCity = t("impressum.address.zip");
  const country = t("impressum.address.country");
  const email = "shparavalo78nenad@yahoo.com";

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <div className="px-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {t("impressum.title")}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {t("impressum.subtitle")}
        </p>
      </div>

      <Card className="space-y-4">
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">{t("impressum.provider.title")}</h2>
          <div className="text-sm text-gray-700 dark:text-gray-300 leading-6">
            <div>{name}</div>
            <div>{streetAndNo}</div>
            <div>{zipCity}</div>
            <div>{country}</div>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">{t("impressum.contact.title")}</h2>
          <div className="text-sm text-gray-700 dark:text-gray-300 leading-6">
            <div>
              {t("impressum.contact.email_label")}:{" "}
              <a className="underline" href={`mailto:${email}`}>
                {email}
              </a>
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">{t("impressum.vat.title")}</h2>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {t("impressum.vat.text")}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">{t("impressum.disclaimer.title")}</h2>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {t("impressum.disclaimer.text")}
          </p>
        </section>
      </Card>
    </div>
  );
}
