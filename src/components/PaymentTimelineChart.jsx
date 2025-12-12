import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

/* -------------------------------------------------------------------------- */
/* Tooltip formatter                                                          */
/* -------------------------------------------------------------------------- */
function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  const { name, label } = payload[0].payload;

  return (
    <div className="px-3 py-2 rounded-lg bg-black/80 text-white text-xs">
      <div className="font-semibold">{name}</div>
      <div>{label}</div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */
export default function PaymentTimelineChart({ subscriptions }) {
  const [filter, setFilter] = useState("all");

  /* ----------------------- Normalize + Sort Data ----------------------- */
  const data = useMemo(() => {
    const rows = [];

    subscriptions.forEach((sub) => {
      const dates = [
        ...(Array.isArray(sub.history) ? sub.history : []),
        sub.datePaid,
      ]
        .filter(Boolean)
        .map((d) => new Date(d))
        .filter((d) => !isNaN(d.getTime()));

      dates.forEach((date) => {
        rows.push({
          id: sub.id,
          name: sub.name,
          timestamp: date.getTime(),
          label: date.toLocaleDateString(),
        });
      });
    });

    return rows.sort((a, b) => a.timestamp - b.timestamp);
  }, [subscriptions]);

  /* ----------------------- Filter Logic ----------------------- */
  const filteredData =
    filter === "all"
      ? data
      : data.filter((d) => d.id === filter);

  if (filteredData.length === 0) return null;

  return (
    <div
      className="
        w-full bg-white dark:bg-gray-900
        rounded-xl shadow-lg
        border border-gray-200 dark:border-gray-800
        p-4 mt-4 mb-10
      "
      style={{ minHeight: "380px" }}
    >
      <h3 className="text-sm mb-3 text-gray-700 dark:text-gray-300 font-medium text-center">
        Payment timeline
      </h3>

      {/* FILTER */}
      <div className="mb-3 flex justify-center">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="
            px-3 py-1.5 text-sm rounded-lg
            bg-white dark:bg-gray-800
            border border-gray-300 dark:border-gray-700
            text-gray-800 dark:text-gray-200
          "
        >
          <option value="all">All subscriptions</option>
          {subscriptions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* CHART */}
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart>
          <XAxis
            type="number"
            dataKey="timestamp"
            domain={["auto", "auto"]}
            tickFormatter={(ts) =>
              new Date(ts).toLocaleDateString()
            }
            name="Date"
          />

          <YAxis
            type="category"
            dataKey="name"
            width={120}
            name="Subscription"
          />

          <Tooltip content={<CustomTooltip />} />
          <Legend />

          <Scatter
            name="Payments"
            data={filteredData}
            fill="#3b82f6"
            onClick={(e) => {
              const id = e?.payload?.id;
              if (id) {
                window.location.href = `/edit/${id}`;
              }
            }}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
