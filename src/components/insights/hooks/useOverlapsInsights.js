import { useEffect, useMemo, useState } from "react";

/**
 * useOverlapsInsights
 * ------------------------------------------------------------
 * Centralizes:
 * - fetching overlap groups from /api/overlaps
 * - loading state + result storage
 * - aggregated savings (monthly + annual)
 * - chart-friendly savings data
 *
 * This hook is UI-agnostic: it does not render anything.
 * BudgetOverviewChart remains responsible for:
 * - premium gating (blur/overlay)
 * - modal handling
 * - rendering charts/components
 *
 * Expected API response shape:
 * { overlaps: Array<{
 *    group: string,
 *    currency?: string,
 *    potentialSavings?: number
 * }> }
 */
export default function useOverlapsInsights({ subscriptions }) {
  const [overlaps, setOverlaps] = useState([]);
  const [overlapsLoading, setOverlapsLoading] = useState(false);

  // Fetch overlapping services + savings when subscriptions change
  useEffect(() => {
    if (!Array.isArray(subscriptions) || subscriptions.length === 0) {
      setOverlaps([]);
      return;
    }

    // prevents state updates after unmount / quick subscription changes
    const controller = new AbortController();

    const run = async () => {
      try {
        setOverlapsLoading(true);

        const res = await fetch("/api/overlaps", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subscriptions }),
          signal: controller.signal,
        });

        if (!res.ok) throw new Error("Overlap fetch failed");

        const data = await res.json();
        setOverlaps(Array.isArray(data?.overlaps) ? data.overlaps : []);
      } catch (err) {
        // Abort is not a real "failure" we want to log as an error
        if (err?.name !== "AbortError") {
          console.error("Overlap detection failed", err);
        }
        setOverlaps([]);
      } finally {
        // Avoid flipping loading false after abort on unmount
        if (!controller.signal.aborted) setOverlapsLoading(false);
      }
    };

    run();

    return () => controller.abort();
  }, [subscriptions]);

  // Total monthly savings (aggregated)
  const totalMonthlySavings = useMemo(() => {
    if (!Array.isArray(overlaps) || overlaps.length === 0) return 0;

    return overlaps.reduce((sum, group) => {
      const s = Number(group?.potentialSavings) || 0;
      return s > 0 ? sum + s : sum;
    }, 0);
  }, [overlaps]);

  // Total annual savings (aggregated)
  const totalAnnualSavings = useMemo(() => {
    // keep consistent with existing behavior: annual = monthly * 12
    return totalMonthlySavings * 12;
  }, [totalMonthlySavings]);

  // Chart data for "savings per group" bar chart
  const savingsChartData = useMemo(() => {
    if (!Array.isArray(overlaps)) return [];

    return overlaps
      .filter((g) => (Number(g?.potentialSavings) || 0) > 0)
      .map((g) => ({
        name: g.group,
        value: Number((Number(g.potentialSavings) || 0).toFixed(2)),
      }));
  }, [overlaps]);

  // convenience: currency if provided by the API
  const overlapCurrency = overlaps?.[0]?.currency || "EUR";

  return {
    overlaps,
    overlapsLoading,
    totalMonthlySavings,
    totalAnnualSavings,
    savingsChartData,
    overlapCurrency,
  };
}
