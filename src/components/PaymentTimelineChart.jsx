import React from "react";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

export default function PaymentTimelineChart({ subscriptions }) {
  const data = [];

  subscriptions.forEach((sub) => {
    const name = sub.name;
    const allDates = [
      ...(Array.isArray(sub.history) ? sub.history : []),
      ...(sub.datePaid ? [sub.datePaid] : []),
    ].filter((d) => !isNaN(new Date(d).getTime()));

    allDates.forEach((dateStr) => {
      data.push({
        id: sub.id,           // Include the ID for navigation
        name,
        date: new Date(dateStr),
      });
    });
  });

  // Sort by date
  data.sort((a, b) => a.date - b.date);

  const chartData = data.map((item, index) => ({
    ...item,
    timestamp: item.date.getTime(),
    y: item.name,
  }));

  return (
    <div
      className="w-full bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-4"
      style={{ minHeight: "360px" }}
    >
      <h3 className="text-sm mb-3 text-gray-700 dark:text-gray-300 font-medium text-center">
        Payment Timeline (All Subscriptions)
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart>
          <XAxis
            dataKey="timestamp"
            domain={["auto", "auto"]}
            name="Date"
            type="number"
            tickFormatter={(unixTime) =>
              new Date(unixTime).toLocaleDateString()
            }
          />
          <YAxis
            type="category"
            dataKey="y"
            name="Subscription"
            width={120}
          />
          <Tooltip
            formatter={(value, name, props) => {
              const date = new Date(props.payload.timestamp);
              return [date.toLocaleDateString(), "Payment Date"];
            }}
          />
          <Legend />
          <Scatter
            name="Payments"
            data={chartData}
            fill="#8884d8"
            onClick={(data) => {
              const id = data.payload.id;
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
