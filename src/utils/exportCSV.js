export function exportPaymentHistoryCSV(subscriptions) {
  const rows = [["Subscription", "Date", "Price", "Currency"]];

  subscriptions.forEach((s) => {
    const payments = [
      ...(s.history || []),
      s.datePaid,
    ].filter(Boolean);

    payments.forEach((d) => {
      rows.push([
        s.name,
        new Date(d).toLocaleDateString(),
        s.price,
        s.currency || "EUR",
      ]);
    });
  });

  const csv = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "payment-history.csv";
  link.click();
}
