// src/components/insights/PieCenterLabel.jsx
import React from "react";
import PropTypes from "prop-types";

/**
 * PieCenterLabel
 * ------------------------------------------------------------------
 * Custom SVG label renderer for Recharts Pie charts.
 *
 * PURPOSE
 * - Displays a title and value in the center of a donut chart
 * - Used via <Label content={<PieCenterLabel />} />
 *
 * IMPORTANT
 * - Must remain a pure function
 * - Recharts injects `viewBox` automatically
 * - Do NOT add hooks or state here
 */
export default function PieCenterLabel({ viewBox, title, value }) {
  const { cx, cy } = viewBox;

  return (
    <>
      <text
        x={cx}
        y={cy - 6}
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-gray-600 dark:fill-gray-400 text-xs"
      >
        {title}
      </text>

      <text
        x={cx}
        y={cy + 12}
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-gray-900 dark:fill-gray-100 text-base font-semibold"
      >
        {value}
      </text>
    </>
  );
}

PieCenterLabel.propTypes = {
  /** Provided by Recharts: center position of the Pie */
  viewBox: PropTypes.shape({
    cx: PropTypes.number.isRequired,
    cy: PropTypes.number.isRequired,
  }).isRequired,

  /** Title text rendered above the value */
  title: PropTypes.string.isRequired,

  /** Main value rendered in the center */
  value: PropTypes.string.isRequired,
};
