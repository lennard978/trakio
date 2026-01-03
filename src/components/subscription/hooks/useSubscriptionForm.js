import { useState, useEffect, useMemo } from "react";
import { loadSubscriptionsLocal } from "../../../utils/mainDB";
import { persistSubscriptions } from "../../../utils/persistSubscriptions";
import { setPremiumIntent } from "../../../utils/premiumIntent";
import { CATEGORY_INTENSITY_DEFAULT } from "../constants";

/* -------------------- Utilities -------------------- */

function normalizeDateString(d) {
  if (!d) return null;
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return null;
  return dt.toISOString().slice(0, 10);
}

const uuid = () => crypto.randomUUID();

/* -------------------- Hook -------------------- */

export function useSubscriptionForm({
  id,
  email,
  user,
  premium,
  navigate,
  showToast,
  t
}) {
  /* ---------- State ---------- */

  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  const [category, setCategory] = useState("other");
  const [method, setMethod] = useState("");
  const [datePaid, setDatePaid] = useState("");
  const [notify, setNotify] = useState(true);
  const [currency, setCurrency] = useState("EUR");
  const [color, setColor] = useState(null);
  const [icon, setIcon] = useState(null);
  const [gradientIntensity, setGradientIntensity] = useState(
    CATEGORY_INTENSITY_DEFAULT.other
  );

  const [originalSnapshot, setOriginalSnapshot] = useState(null);

  const token = localStorage.getItem("token");

  const advancedFrequencies = useMemo(
    () => ["quarterly", "semiannual", "nine_months", "biennial", "triennial"],
    []
  );

  const limitReached =
    !id && !premium.isPremium && subscriptions.length >= 5;

  const requiresPremiumInterval =
    !premium.isPremium && advancedFrequencies.includes(frequency);

  /* ---------- Backend ---------- */

  const kvGet = async () => {
    const res = await fetch("/api/subscriptions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ action: "get", email }),
    });
    const data = await res.json();
    return Array.isArray(data.subscriptions) ? data.subscriptions : [];
  };

  /* ---------- Load Data ---------- */

  useEffect(() => {
    if (!email) return;

    let cancelled = false;

    (async () => {
      setLoading(true);

      try {
        let list = [];

        // 1️⃣ Local first
        const local = await loadSubscriptionsLocal();
        if (local.length) list = local;

        // 2️⃣ Backend if online
        if (navigator.onLine) {
          try {
            const remote = await kvGet();
            if (remote.length) list = remote;
          } catch { }
        }

        if (cancelled) return;

        const migrated = list.map((s) => ({
          ...s,
          gradientIntensity:
            typeof s.gradientIntensity === "number"
              ? s.gradientIntensity
              : CATEGORY_INTENSITY_DEFAULT[s.category] ??
              CATEGORY_INTENSITY_DEFAULT.other,
        }));

        setSubscriptions(migrated);

        /* ---------- Edit Mode ---------- */
        if (id) {
          const existing = migrated.find(
            (s) => String(s.id) === String(id)
          );

          if (!existing) {
            showToast(t("error_not_found"), "error");
            navigate("/dashboard");
            return;
          }

          setOriginalSnapshot(JSON.parse(JSON.stringify(existing)));

          setName(existing.name ?? "");
          setPrice(existing.price != null ? String(existing.price) : "");
          setFrequency(existing.frequency ?? "monthly");
          setCategory(existing.category ?? "other");
          setCurrency(existing.currency ?? "EUR");
          setMethod(existing.method ?? "");
          setNotify(existing.notify ?? true);
          setColor(existing.color ?? null);
          setIcon(existing.icon ?? null);
          setGradientIntensity(
            typeof existing.gradientIntensity === "number"
              ? existing.gradientIntensity
              : CATEGORY_INTENSITY_DEFAULT[existing.category] ??
              CATEGORY_INTENSITY_DEFAULT.other
          );

          const lastPayment =
            Array.isArray(existing.payments) && existing.payments.length
              ? [...existing.payments]
                .map((p) => normalizeDateString(p.date))
                .filter(Boolean)
                .sort()
                .at(-1)
              : normalizeDateString(existing.datePaid);

          setDatePaid(lastPayment ?? "");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [email, id]);

  /* ---------- Submit ---------- */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      showToast(t("error_not_authenticated"), "error");
      return;
    }

    if (limitReached) {
      setPremiumIntent("limit");
      navigate("/settings");
      return;
    }

    if (!name.trim()) {
      showToast(t("error_required"), "error");
      return;
    }

    const priceNum = Number(price);
    if (!price || isNaN(priceNum) || priceNum <= 0) {
      showToast(t("error_price_invalid"), "error");
      return;
    }

    if (!datePaid) {
      showToast(t("error_paid_date_required"), "error");
      return;
    }

    if (requiresPremiumInterval) {
      setPremiumIntent("interval");
      navigate("/settings");
      return;
    }

    const paidRaw = normalizeDateString(datePaid);
    if (!paidRaw) {
      showToast(t("error_paid_date_required"), "error");
      return;
    }

    const today = normalizeDateString(new Date());
    const paid = paidRaw > today ? today : paidRaw;

    try {
      let updated;

      /* ---------- EDIT ---------- */
      if (id) {
        updated = subscriptions.map((s) => {
          if (String(s.id) !== String(id)) return s;

          const existingPayments = Array.isArray(s.payments)
            ? [...s.payments]
            : [];

          const lastPaid =
            existingPayments.length
              ? [...existingPayments]
                .map((p) => p?.date)
                .filter(Boolean)
                .sort()
                .at(-1)
              : s.datePaid;

          if (paid && normalizeDateString(lastPaid) !== paid) {
            existingPayments.push({
              id: uuid(),
              date: paid,
              amount: priceNum,
              currency,
            });
          }

          // de-dup
          const uniq = new Map();
          for (const p of existingPayments) {
            if (!p?.date) continue;
            const key = `${normalizeDateString(p.date)}|${Number(
              p.amount
            ).toFixed(2)}|${p.currency || currency}`;
            uniq.set(key, p);
          }

          const nextPayments = Array.from(uniq.values()).sort((a, b) =>
            String(a.date).localeCompare(String(b.date))
          );

          return {
            ...s,
            name: name.trim(),
            icon,
            price: priceNum,
            frequency,
            category,
            currency,
            method: method.trim(),
            notify,
            color,
            gradientIntensity,
            payments: nextPayments,
            datePaid: nextPayments.at(-1)?.date ?? paid,
          };
        });

        showToast(t("toast_updated"), "success");
      }

      /* ---------- ADD ---------- */
      else {
        updated = [
          ...subscriptions,
          {
            id: uuid(),
            name: name.trim(),
            icon,
            price: priceNum,
            frequency,
            category,
            datePaid: paid,
            notify,
            currency,
            method: method.trim(),
            color,
            gradientIntensity,
            payments: [
              {
                id: uuid(),
                date: paid,
                amount: priceNum,
                currency,
              },
            ],
          },
        ];

        showToast(t("toast_added"), "success");
      }

      await persistSubscriptions({
        email,
        token,
        subscriptions: updated,
      });

      navigate("/dashboard");
    } catch (err) {
      console.error("Save failed:", err);
      showToast(t("error_save_failed"), "error");
    }
  };

  /* ---------- Delete ---------- */

  const handleDelete = async () => {
    if (!id) return;

    if (!confirm(t("confirm_delete_subscription"))) return;

    try {
      const updated = subscriptions.filter(
        (s) => String(s.id) !== String(id)
      );

      await persistSubscriptions({
        email,
        token,
        subscriptions: updated,
      });

      showToast(t("toast_deleted"), "success");
      navigate("/dashboard");
    } catch (err) {
      console.error("Delete failed:", err);
      showToast(t("error_delete_failed"), "error");
    }
  };

  /* ---------- Undo ---------- */

  const handleUndo = async () => {
    if (!originalSnapshot) return;

    try {
      const updated = subscriptions.map((s) =>
        String(s.id) === String(id) ? originalSnapshot : s
      );

      await persistSubscriptions({
        email,
        token,
        subscriptions: updated,
      });

      showToast(t("toast_undo_success"), "success");
      navigate("/dashboard");
    } catch (err) {
      console.error("Undo failed:", err);
      showToast(t("error_undo_failed"), "error");
    }
  };

  /* ---------- Exposed API ---------- */
  /* ---------- Change detection ---------- */

  const hasChanges = useMemo(() => {
    if (!originalSnapshot) return false;

    const normalize = (s) => ({
      name: s.name ?? "",
      price: Number(s.price) || 0,
      frequency: s.frequency ?? "",
      category: s.category ?? "",
      currency: s.currency ?? "",
      method: s.method ?? "",
      notify: Boolean(s.notify),
      color: s.color ?? "",
      gradientIntensity: Number(s.gradientIntensity) || 0,
      datePaid: normalizeDateString(s.datePaid),
      payments: Array.isArray(s.payments)
        ? s.payments.map((p) => ({
          date: normalizeDateString(p.date),
          amount: Number(p.amount) || 0,
          currency: p.currency ?? "",
        }))
        : [],
    });

    const current = normalize({
      name,
      price,
      frequency,
      category,
      currency,
      method,
      notify,
      color,
      gradientIntensity,
      datePaid,
      payments: originalSnapshot.payments,
    });

    const original = normalize(originalSnapshot);

    return JSON.stringify(current) !== JSON.stringify(original);
  }, [
    originalSnapshot,
    name,
    price,
    frequency,
    category,
    currency,
    method,
    notify,
    color,
    gradientIntensity,
    datePaid,
  ]);

  return {
    loading,
    subscriptions,

    name,
    setName,
    price,
    setPrice,
    frequency,
    setFrequency,
    category,
    setCategory,
    method,
    setMethod,
    datePaid,
    setDatePaid,
    notify,
    setNotify,
    currency,
    setCurrency,
    color,
    setColor,
    icon,
    setIcon,
    gradientIntensity,
    setGradientIntensity,
    originalSnapshot, // ✅ ADD THIS LINE
    hasChanges, // ✅ NEW

    handleSubmit,
    handleDelete,
    handleUndo,
  };
}
