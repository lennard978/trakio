import { XMarkIcon, QuestionMarkCircleIcon, EnvelopeIcon } from "@heroicons/react/24/outline";
import HelpAccordion from "./HelpAccordion";
import { HELP_FAQ } from "../../data/helpFaq";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function HelpSupportSheet({ onClose }) {
  const { t } = useTranslation();

  // lock background scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = prev);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-start">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* sheet */}
      <div
        className="
          relative w-full
          bg-white dark:bg-gray-900
          rounded-t-[28px]
          shadow-2xl
          flex flex-col
          mt-2
          animate-sheet-in
        "
        style={{
          height: "calc(100dvh - env(safe-area-inset-bottom))",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {/* handle */}
        <div className="flex justify-center py-2">
          <div className="w-10 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>

        {/* header */}
        <div className="px-5 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{t('help') || "Help & Support"}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('find_answer') || "Find answers or contact us"}
            </p>
          </div>
          <button onClick={onClose}>
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* content */}
        <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-6">
          {/* intro */}
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="w-14 h-14 rounded-full bg-orange-100 dark:bg-orange-900/40
                              flex items-center justify-center">
                <QuestionMarkCircleIcon className="w-7 h-7 text-orange-600" />
              </div>
            </div>

            <h3 className="font-semibold text-lg">
              {t("how_can_we") || "How can we help you?"}
            </h3>

            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("browse") || "Browse common questions or reach out to support."}
            </p>
          </div>

          {/* FAQ */}
          <div className="space-y-3">
            {HELP_FAQ.map((item, i) => (
              <HelpAccordion
                key={i}
                question={t(item.q)}
                answer={t(item.a)}
              />
            ))}
          </div>

          {/* contact */}
          <div className="pt-4 text-center space-y-3">
            <div className="flex justify-center">
              <div className="w-14 h-14 rounded-full bg-orange-100 dark:bg-orange-900/40
                              flex items-center justify-center">
                <EnvelopeIcon className="w-7 h-7 text-orange-600" />
              </div>
            </div>

            <h3 className="font-semibold">
              {t('still_need_help') || "Still need help?"}
            </h3>

            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('our_support') || "Our support team is happy to help you."}
            </p>

            <a
              href="mailto:shparavalo78nenad@yahoo.com"
              className="
                inline-flex items-center justify-center
                bg-orange-600 hover:bg-orange-700
                text-white px-5 py-3 rounded-xl
                font-medium transition
              "
            >
              {t('contact_support') || "Contact Support"}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
