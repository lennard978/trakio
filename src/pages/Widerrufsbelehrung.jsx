import { useTranslation } from "react-i18next";

export default function RightOfWithdrawal() {
  const { t } = useTranslation();
  const today = new Date().toLocaleDateString("en-US");

  return (
    <div className="max-w-3xl mx-auto p-4 text-sm space-y-4">
      <h1 className="text-xl font-semibold">{t("widerruf.title")}</h1>

      <h2 className="font-semibold">{t("widerruf.right.title")}</h2>
      <p>{t("widerruf.right.text1")}</p>
      <p>{t("widerruf.right.text2")}</p>

      <h2 className="font-semibold">{t("widerruf.exercise.title")}</h2>
      <p>{t("widerruf.exercise.text")}</p>

      <h2 className="font-semibold">{t("widerruf.exclusion.title")}</h2>
      <p>{t("widerruf.exclusion.text")}</p>

      <p className="text-gray-500">
        {t("widerruf.date_label", { date: today })}
      </p>
    </div>
  );
}
