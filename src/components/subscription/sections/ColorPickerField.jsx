import React from "react";

/**
 * ColorPickerField
 * - Preset color buttons
 * - Custom color picker
 *
 * PURE UI COMPONENT
 */
export default function ColorPickerField({
  color,
  setColor,
  presetColors,
  t
}) {
  function hexToRgba(hex, alpha = 0.85) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  return (
    <div>
      <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
        {t("label_color")} ({t("common.optional")})
      </label>

      {/* Preset colors */}
      <div className="flex flex-wrap gap-2 mb-2">
        {presetColors.map((c) => (
          <button
            key={c}
            type="button"
            className={`
              w-8 h-8 rounded-full border-2 transition-transform duration-150
              ${color === c
                ? "border-black dark:border-white scale-110"
                : "border-gray-300 hover:scale-105"}
            `}
            style={{ backgroundColor: c }}
            onClick={() => setColor(c)}
            title={c}
          />
        ))}

        {/* Current / custom color */}
        {!presetColors.includes(color) && color && (
          <div
            className="w-8 h-8 rounded-full border-2 border-dashed border-gray-400"
            style={{ backgroundColor: color }}
            title={t("current_color")}
          />
        )}
      </div>

      {/* Custom color input */}
      <div className="flex items-center gap-2 mt-2">
        <input
          type="color"
          value={`#${(color?.match(/\d+/g) || [])
            .slice(0, 3)
            .map((v) => parseInt(v).toString(16).padStart(2, "0"))
            .join("")}`}
          onChange={(e) => setColor(hexToRgba(e.target.value))}
          className="w-10 h-8 p-0 border border-gray-400 rounded cursor-pointer"
          title={t("pick_custom_color")}
        />

        <span className="text-xs text-gray-500 dark:text-gray-400">
          {color}
        </span>
      </div>
    </div>
  );
}
