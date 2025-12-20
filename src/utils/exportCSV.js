export function exportPaymentHistoryCSV(subscriptions) {
  const rows = [
    ["name", "paymentDate", "amount", "currency"]
  ];

  subscriptions.forEach((s) => {
    const payments = Array.isArray(s.payments)
      ? s.payments
      : [];

    payments.forEach((p) => {
      rows.push([
        s.name,
        p.date,
        p.amount,
        p.currency || s.currency || "EUR",
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

  URL.revokeObjectURL(url);
}
