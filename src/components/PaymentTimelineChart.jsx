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

function normalizeHistory(sub) {
  const raw = Array.isArray(sub.history) ? sub.history : [];
  return raw
    .map((h) => {
      if (typeof h === "string") {
        const d = new Date(h);
        if (Number.isNaN(d.getTime())) return null;
        return { date: h, amount: Number(sub.price) || 0, currency: sub.currency || "EUR" };
      }
      if (h && typeof h === "object") {
        const date = typeof h.date === "string" ? h.date : "";
        const d = new Date(date);
        if (!date || Number.isNaN(d.getTime())) return null;
        return {
          date,
          amount: typeof h.amount === "number" ? h.amount : Number(h.amount) || Number(sub.price) || 0,
          currency: h.currency || sub.currency || "EUR",
        };
      }
      return null;
    })
    .filter(Boolean);
}

function getAllPaymentEvents(sub) {
  const events = normalizeHistory(sub);
  if (sub.datePaid) {
    const d = new Date(sub.datePaid);
    if (!Number.isNaN(d.getTime())) {
      events.push({
        date: sub.datePaid,
        amount: Number(sub.price) || 0,
        currency: sub.currency || "EUR",
      });
    }
  }

  // Sort ascending for timeline
  events.sort((a, b) => new Date(a.date) - new Date(b.date));

  // De-dupe
  const seen = new Set();
  const deduped = [];
  for (const e of events) {
    const key = `${e.date}|${e.amount}|${e.currency}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(e);
  }
  return deduped;
}

export default function PaymentTimelineChart({ subscriptions }) {
  const data = [];

  subscriptions.forEach((sub) => {
    const events = getAllPaymentEvents(sub);

    events.forEach((e) => {
      data.push({
        id: sub.id, // Include the ID for navigation
        name: sub.name,
        dateISO: e.date,
        timestamp: new Date(e.date).getTime(),
        y: sub.name,
        amount: e.amount,
        currency: e.currency || sub.currency || "EUR",
      });
    });
  });

  // Sort by timestamp
  data.sort((a, b) => a.timestamp - b.timestamp);

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
            tickFormatter={(unixTime) => new Date(unixTime).toLocaleDateString()}
          />
          <YAxis type="category" dataKey="y" name="Subscription" width={120} />

          <Tooltip
            formatter={(value, name, props) => {
              const p = props?.payload;
              if (!p) return ["", ""];
              const date = new Date(p.timestamp).toLocaleDateString();
              const amount = `${p.currency} ${Number(p.amount || 0).toFixed(2)}`;
              return [`${date} • ${amount}`, "Payment"];
            }}
          />

          <Legend />
          <Scatter
            name="Payments"
            data={data}
            fill="#8884d8"
            onClick={(d) => {
              const id = d?.payload?.id;
              if (id) window.location.href = `/edit/${id}`;
            }}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
