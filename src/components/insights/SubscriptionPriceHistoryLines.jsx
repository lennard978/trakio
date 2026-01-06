import { usePriceHistoryData } from "../../utils/usePriceHistoryData";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine
} from "recharts";
import React, { useMemo } from "react";

function getPriceIncreases(data, subscriptionName) {
  const increases = [];

  for (let i = 1; i < data.length; i++) {
    const prev = data[i - 1]?.[subscriptionName];
    const curr = data[i]?.[subscriptionName];

    if (
      typeof prev === "number" &&
      typeof curr === "number" &&
      curr > prev
    ) {
      increases.push({
        month: data[i].month,
        from: prev,
        to: curr,
      });
    }
  }

  return increases;
}

export default function SubscriptionPriceHistoryLines({
  subscriptions = [],
  keepName,
  currency = "EUR",
}) {
  const data = usePriceHistoryData(subscriptions);

  const priceIncreases = useMemo(() => {
    const map = {};
    subscriptions.forEach((sub) => {
      map[sub.name] = getPriceIncreases(data, sub.name);
    });
    return map;
  }, [data, subscriptions]);

  const maxPrice = Math.max(
    ...subscriptions.map((s) => s.price || 0),
    1
  );
  const paddedData = useMemo(() => {
    if (data.length < 2) return data;

    return [
      {
        month: data[0].month,
        ...Object.fromEntries(
          subscriptions.map(s => [s.name, data[0][s.name]])
        ),
      },
      ...data,
    ];
  }, [data, subscriptions]);


  return (
    <div className="mt-4">
      <div className="h-44">
        {data.length < 2 && (
          <>
            <div className="text-xs text-gray-500 italic mb-2">
              Price history will appear after at least two payments.
            </div>
            <div className="text-xs text-gray-500 italic mb-2">
              Showing last {data.length} months based on recorded payments.
            </div>
          </>
        )}

        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={paddedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <ReferenceLine
              y={priceIncreases[keepName]?.[0]?.from}
              stroke="rgba(239,68,68,0.25)"
              strokeDasharray="4 4"
            />

            <XAxis
              dataKey="month"
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => {
                const [y, m] = v.split("-");
                return new Date(y, m - 1).toLocaleString("default", { month: "short" });
              }}
            />

            <YAxis
              domain={[0, Math.ceil(maxPrice + 1)]}
              tick={{ fontSize: 11 }}
              width={28}
            />
            <Tooltip
              formatter={(value, name, props) => {
                const month = props?.payload?.month;
                const inc = priceIncreases[name]?.find(i => i.month === month);

                if (inc) {
                  return [
                    `${value.toFixed(2)} ${currency} (↑ from ${inc.from.toFixed(2)})`,
                    name,
                  ];
                }

                return [`${value.toFixed(2)} ${currency}`, name];
              }}
            />

            {subscriptions.map((sub) => {
              const isCheapest = sub.name === keepName;
              const isExpensive = sub.price === maxPrice;

              return (
                <Line
                  key={sub.name}
                  type="stepAfter"
                  dataKey={sub.name}
                  stroke={
                    isCheapest
                      ? "#22c55e"
                      : isExpensive
                        ? "#fb923c"
                        : "#9ca3af"
                  }
                  strokeWidth={isCheapest ? 3 : 2}
                  dot={false}
                />

              );
            })}
            {subscriptions.map((sub) =>
              priceIncreases[sub.name]?.map((inc) => (
                <Line
                  key={`${sub.name}-${inc.month}-increase`}
                  data={[
                    {
                      month: inc.month,
                      [sub.name]: inc.to,
                    },
                  ]}
                  dataKey={sub.name}
                  stroke="transparent"
                  dot={{
                    r: 6,
                    fill: "#f97316",
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                  activeDot={{
                    r: 7,
                    fill: "#f97316",
                  }}
                />
              ))
            )}

          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
