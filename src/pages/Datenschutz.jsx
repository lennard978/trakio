import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import Card from "../components/ui/Card";

/**
 * PrivacyPolicy
 * - GDPR-compliant privacy policy page
 * - Fully i18n-aware
 * - Accessible & semantic
 */
export default function PrivacyPolicy() {
  const { t, i18n } = useTranslation();

  const name = t("privacy.1.name");
  const street = t("privacy.1.street");
  const city = t("privacy.1.city");
  const email = t("privacy.1.email");

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
      className="max-w-3xl mx-auto p-4 space-y-6"
      aria-labelledby="privacy-policy-title"
    >
      <header className="px-1 space-y-1">
        <h1
          id="privacy-policy-title"
          className="text-2xl font-bold text-gray-900 dark:text-gray-100"
        >
          {t("privacy.title")}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t("privacy.subtitle")}
        </p>
      </header>

      <Card className="space-y-8">
        {/* Controller */}
        <section>
          <h2 className="text-lg font-semibold">
            {t("privacy.1.title")}
          </h2>
          <address className="not-italic text-sm text-gray-700 dark:text-gray-300 leading-6">
            <div>{name}</div>
            <div>{street}</div>
            <div>{city}</div>
            <div>
              {t("privacy.email_label", { defaultValue: "Email:" })}{" "}
              <a
                className="underline"
                href={`mailto:${email}`}
              >
                {email}
              </a>
            </div>
          </address>
        </section>

        {/* Data processed */}
        <section>
          <h2 className="text-lg font-semibold">
            {t("privacy.2.title")}
          </h2>
          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
            <p>{t("privacy.2.p1")}</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>{t("privacy.2.li1")}</li>
              <li>{t("privacy.2.li2")}</li>
              <li>{t("privacy.2.li3")}</li>
            </ul>
          </div>
        </section>

        {/* Legal basis */}
        <section>
          <h2 className="text-lg font-semibold">
            {t("privacy.3.title")}
          </h2>
          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
            <p>{t("privacy.3.p1")}</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>{t("privacy.3.li1")}</li>
              <li>{t("privacy.3.li2")}</li>
              <li>{t("privacy.3.li3")}</li>
              <li>{t("privacy.3.li4")}</li>
            </ul>
            <p className="text-xs text-gray-500">
              {t("privacy.3.legal")}
            </p>
          </div>
        </section>

        {/* Third-party services */}
        <section>
          <h2 className="text-lg font-semibold">
            {t("privacy.4.title")}
          </h2>
          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
            <p>{t("privacy.4.p1")}</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>{t("privacy.4.li1")}</li>
              <li>{t("privacy.4.li2")}</li>
              <li>{t("privacy.4.li3")}</li>
            </ul>
            <p className="text-xs text-gray-500">
              {t("privacy.4.note")}{" "}
              <a
                className="underline"
                href="https://vercel.com/legal/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Vercel Privacy Policy"
              >
                Vercel
              </a>
              ,{" "}
              <a
                className="underline"
                href="https://upstash.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Upstash Privacy Policy"
              >
                Upstash
              </a>
              ,{" "}
              <a
                className="underline"
                href="https://stripe.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Stripe Privacy Policy"
              >
                Stripe
              </a>
              .
            </p>
          </div>
        </section>

        {/* Storage duration */}
        <section>
          <h2 className="text-lg font-semibold">
            {t("privacy.5.title")}
          </h2>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {t("privacy.5.p1")}
          </p>
        </section>

        {/* User rights */}
        <section>
          <h2 className="text-lg font-semibold">
            {t("privacy.6.title")}
          </h2>
          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
            <p>{t("privacy.6.p1")}</p>
            <p>{t("privacy.6.p2")}</p>
          </div>
        </section>

        {/* Contact */}
        <section>
          <h2 className="text-lg font-semibold">
            {t("privacy.7.title")}
          </h2>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {t("privacy.7.p1")}{" "}
            <a
              className="underline"
              href={`mailto:${email}`}
            >
              {email}
            </a>
            .
          </p>
        </section>

        {/* Last updated */}
        <footer>
          <p className="text-xs text-gray-500">
            {t("privacy.last_updated", {
              date: lastUpdated,
            })}
          </p>
        </footer>
      </Card>
    </article>
  );
}
