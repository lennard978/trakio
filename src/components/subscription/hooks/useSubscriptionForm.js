import { useState, useEffect, useMemo } from "react";
import { loadSubscriptionsLocal } from "../../../utils/mainDB";
import { persistSubscriptions } from "../../../utils/persistSubscriptions";
import { setPremiumIntent } from "../../../utils/premiumIntent";
import { CATEGORY_INTENSITY_DEFAULT } from "../constants";
import { subscriptionCatalog } from "../../../data/subscriptionCatalog";

/* -------------------- Utilities -------------------- */

function normalizeDateString(d) {
  if (!d) return null;
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return null;
  return dt.toISOString().slice(0, 10);
}

function uuid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isBrowser() {
  return typeof window !== "undefined";
}

/**
 * Normalize user-entered subscription name for matching.
 * - lowercase
 * - trim
 * - collapse whitespace
 * - remove common punctuation
 */
function normalizeName(input) {
  return String(input || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[()[\]{}.,!?:;"'`~]/g, "");
}

/**
 * Deterministic catalog matcher.
 * Returns best match or null.
 */
function matchCatalog(nameRaw) {
  const q = normalizeName(nameRaw);
  if (!q) return null;

  let best = null;

  for (const entry of subscriptionCatalog) {
    const matchList = Array.isArray(entry.match) ? entry.match : [];
    const name = normalizeName(entry.name);

    // direct contains checks
    const candidates = [
      name,
      ...matchList.map((m) => normalizeName(m)),
    ].filter(Boolean);

    let hit = false;

    for (const c of candidates) {
      // exact
      if (q === c) {
        hit = true;
        break;
      }
      // substring (e.g. "spotify family" should match "spotify")
      if (q.includes(c) || c.includes(q)) {
        hit = true;
        break;
      }
    }

    if (!hit) continue;

    const score = Number(entry.confidence) || 0;

    if (!best || score > best.confidence) {
      best = {
        name: entry.name,
        icon: entry.icon || null,
        category: entry.category || "other",
        confidence: score,
      };
    }
  }

  return best;
}

/* -------------------- Hook -------------------- */

export function useSubscriptionForm({
  id,
  email,
  premium,
  navigate,
  showToast,
  t,
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

  // 🔒 Manual override locks (prevents smart engine from overwriting user intent)
  const [categoryLocked, setCategoryLocked] = useState(false);
  const [iconLocked, setIconLocked] = useState(false);

  const token = isBrowser() ? localStorage.getItem("token") : null;

  const advancedFrequencies = useMemo(
    () => ["quarterly", "semiannual", "nine_months", "biennial", "triennial"],
    []
  );

  const limitReached = !id && !premium.isPremium && subscriptions.length >= 5;

  const requiresPremiumInterval =
    !premium.isPremium && advancedFrequencies.includes(frequency);

  /* ---------- Backend ---------- */

  const kvGet = async () => {
    const res = await fetch("/api/subscriptions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({ action: "get", email }),
    });

    if (!res.ok) {
      throw new Error(`Fetch failed (${res.status})`);
    }

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
        if (isBrowser() && navigator.onLine) {
          try {
            const remote = await kvGet();
            if (remote.length) list = remote;
          } catch {
            // silent fallback to local
          }
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
          const existing = migrated.find((s) => String(s.id) === String(id));

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

          // In edit mode, lock smart changes by default
          setCategoryLocked(true);
          setIconLocked(true);

          const lastPayment =
            Array.isArray(existing.payments) && existing.payments.length
              ? [...existing.payments]
                .map((p) => normalizeDateString(p.date))
                .filter(Boolean)
                .sort()
                .at(-1)
              : normalizeDateString(existing.datePaid);

          setDatePaid(lastPayment ?? "");
        } else {
          // In add mode, allow smart suggestions initially
          setCategoryLocked(false);
          setIconLocked(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [email, id]);

  /* ---------- Smart Categorization (Add Mode Only) ---------- */

  useEffect(() => {
    if (id) return; // never auto-change in edit mode

    const trimmed = name.trim();
    if (!trimmed) return;

    const match = matchCatalog(trimmed);
    if (!match) return;

    // Confidence thresholds:
    // - >= 90 => safe to auto-apply category + icon
    // - 80-89 => apply only if fields are still default/empty and not locked
    const conf = match.confidence || 0;

    // category
    if (!categoryLocked) {
      const canApplyCategory =
        conf >= 90 || (conf >= 80 && (category === "other" || !category));

      if (canApplyCategory && match.category) {
        setCategory(match.category);
        setGradientIntensity(
          CATEGORY_INTENSITY_DEFAULT[match.category] ??
          CATEGORY_INTENSITY_DEFAULT.other
        );
      }
    }

    // icon
    if (!iconLocked) {
      const canApplyIcon =
        conf >= 90 || (conf >= 80 && (!icon || icon === null));

      if (canApplyIcon && match.icon) {
        setIcon(match.icon);
      }
    }
  }, [id, name, category, icon, categoryLocked, iconLocked]);

  /* ---------- Wrap setters to detect manual overrides ---------- */

  const setCategoryWithLock = (next) => {
    setCategoryLocked(true);
    setCategory(next);
  };

  const setIconWithLock = (next) => {
    setIconLocked(true);
    setIcon(next);
  };

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
    if (!price || Number.isNaN(priceNum) || priceNum <= 0) {
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

          const lastPaymentIndex = existingPayments.length
            ? existingPayments
              .map((p, i) => ({ p, i }))
              .filter(({ p }) => p?.date)
              .sort((a, b) =>
                String(a.p.date).localeCompare(String(b.p.date))
              )
              .at(-1)?.i
            : null;

          const lastPayment =
            lastPaymentIndex != null ? existingPayments[lastPaymentIndex] : null;

          if (paid && normalizeDateString(lastPayment?.date) !== paid) {
            existingPayments.push({
              id: uuid(),
              date: paid,
              amount: priceNum,
              currency,
            });
          } else if (lastPayment && Number(lastPayment.amount) !== priceNum) {
            existingPayments[lastPaymentIndex] = {
              ...lastPayment,
              amount: priceNum,
              currency,
            };
          }

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

    if (isBrowser() && !confirm(t("confirm_delete_subscription"))) return;

    try {
      const updated = subscriptions.filter((s) => String(s.id) !== String(id));

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

  /* ---------- Change Detection ---------- */

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
        ? [...s.payments]
          .map((p) => ({
            date: normalizeDateString(p.date),
            amount: Number(p.amount) || 0,
            currency: p.currency ?? "",
          }))
          .sort((a, b) => String(a.date).localeCompare(String(b.date)))
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
    // ✅ use locked setter to respect manual overrides
    setCategory: setCategoryWithLock,

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
    // ✅ use locked setter to respect manual overrides
    setIcon: setIconWithLock,

    gradientIntensity,
    setGradientIntensity,

    // Expose locks if you want to debug later (safe to keep)
    categoryLocked,
    iconLocked,

    originalSnapshot,
    hasChanges,

    handleSubmit,
    handleDelete,
    handleUndo,
  };
}
