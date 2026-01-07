import React from "react";
import PropTypes from "prop-types";

/**
 * ColorPickerField
 * - Displays color presets
 * - Handles custom picker
 * - Calls setColor with selected RGBA
 */

export default function ColorPickerField({ color, setColor, presetColors, t }) {
  return (
    <div>
      <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
        {t("label_color")} ({t("common.optional")})
      </label>

      <div className="flex flex-wrap gap-3 mb-3">
        {presetColors.map((c) => {
          const isSelected = color === c;
          return (
            <button
              key={c}
              type="button"
              title={c}
              onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-full transition-transform duration-150 border-2 ${isSelected
                  ? "border-black dark:border-white scale-110"
                  : "border-gray-300 dark:border-gray-600 hover:scale-105"
                }`}
              style={{ backgroundColor: c }}
            />
          );
        })}

        {!presetColors.includes(color) && color && (
          <div
            className="w-8 h-8 rounded-full border-2 border-dashed border-gray-400"
            style={{ backgroundColor: color }}
          />
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="color"
          value={
            "#" +
            (color
              ?.match(/\d+/g)
              ?.slice(0, 3)
              ?.map((v) =>
                parseInt(v).toString(16).padStart(2, "0")
              )
              .join("") || "ffffff")
          }
          onChange={(e) => {
            const hex = e.target.value;
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            setColor(`rgba(${r}, ${g}, ${b}, 0.75)`);
          }}
          className="w-10 h-8 p-0 border border-gray-400 rounded cursor-pointer"
        />
        <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[160px]">
          {color || t("no_color_selected")}
        </span>
      </div>
    </div>
  );
}


ColorPickerField.propTypes = {
  color: PropTypes.string,
  setColor: PropTypes.func.isRequired,
  presetColors: PropTypes.array.isRequired,
  t: PropTypes.func.isRequired,
};
