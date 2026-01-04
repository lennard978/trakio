import React from "react";
import { useTranslation } from "react-i18next";
import Card from "../components/ui/Card";

export default function PrivacyPolicy() {
  const { t } = useTranslation();

  const name = t("privacy.1.name");
  const street = t("privacy.1.street");
  const city = t("privacy.1.city");
  const email = t("privacy.1.email");

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <div className="px-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {t("privacy.title")}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {t("privacy.subtitle")}
        </p>
      </div>

      <Card className="space-y-6">
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">{t("privacy.1.title")}</h2>
          <div className="text-sm text-gray-700 dark:text-gray-300 leading-6">
            <div>{name}</div>
            <div>{street}</div>
            <div>{city}</div>
            <div>
              Email:{" "}
              <a className="underline" href={`mailto:${email}`}>
                {email}
              </a>
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">{t("privacy.2.title")}</h2>
          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
            <p>{t("privacy.2.p1")}</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>{t("privacy.2.li1")}</li>
              <li>{t("privacy.2.li2")}</li>
              <li>{t("privacy.2.li3")}</li>
            </ul>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">{t("privacy.3.title")}</h2>
          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
            <p>{t("privacy.3.p1")}</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>{t("privacy.3.li1")}</li>
              <li>{t("privacy.3.li2")}</li>
              <li>{t("privacy.3.li3")}</li>
              <li>{t("privacy.3.li4")}</li>
            </ul>
            <p className="text-xs text-gray-500">{t("privacy.3.legal")}</p>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">{t("privacy.4.title")}</h2>
          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
            <p>{t("privacy.4.p1")}</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>{t("privacy.4.li1")}</li>
              <li>{t("privacy.4.li2")}</li>
              <li>{t("privacy.4.li3")}</li>
            </ul>
            <p className="text-xs text-gray-500">
              {t("privacy.4.note")}
              <a className="underline" href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noreferrer">
                Vercel
              </a>
              ,{" "}
              <a className="underline" href="https://upstash.com/privacy" target="_blank" rel="noreferrer">
                Upstash
              </a>
              ,{" "}
              <a className="underline" href="https://stripe.com/privacy" target="_blank" rel="noreferrer">
                Stripe
              </a>.
            </p>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">{t("privacy.5.title")}</h2>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {t("privacy.5.p1")}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">{t("privacy.6.title")}</h2>
          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
            <p>{t("privacy.6.p1")}</p>
            <p>{t("privacy.6.p2")}</p>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">{t("privacy.7.title")}</h2>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {t("privacy.7.p1")}
            <a className="underline" href={`mailto:${email}`}>
              {email}
            </a>.
          </p>
        </section>
      </Card>
    </div>
  );
}
