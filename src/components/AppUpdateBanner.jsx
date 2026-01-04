import React from "react";
import { useTranslation } from "react-i18next";
export default function AppUpdateBanner({ onUpdate }) {
  const { t } = useTranslation();

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50">
      <div className="
        flex items-center gap-3
        px-4 py-2 rounded-xl
        bg-[#ED7014] text-white
        shadow-lg
      ">
        <span className="text-sm font-medium">
          {t('new_version') || "New version available"}
        </span>

        <button
          onClick={onUpdate}
          className="text-xs px-3 py-1 rounded-lg bg-white text-[#ED7014] font-semibold"
        >
          {t('update_app') || "Update"}
        </button>
      </div>
    </div>
  );
}
