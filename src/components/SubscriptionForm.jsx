import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth";
import { usePremium } from "../hooks/usePremium";
import { useCurrency } from "../context/CurrencyContext";

// UI
import CategorySelector from "../components/CategorySelector";
import FrequencySelector from "../components/FrequencySelector";
import Card from "../components/ui/Card";
import SettingButton from "../components/ui/SettingButton";
import PaymentMethodIcon from "./icons/PaymentMethodIcons";
import { subscriptionCatalog } from "../data/subscriptionCatalog";
import { setPremiumIntent } from "../utils/premiumIntent";

/* -------------------- Utility -------------------- */
function normalizeDateString(d) {
  if (!d) return null;
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return null;
  return dt.toISOString().slice(0, 10);
}

const MONTHLY_FACTOR = {
  weekly: 4.345,
  biweekly: 2.1725,
  monthly: 1,
  quarterly: 1 / 3,
  semiannual: 1 / 6,
  nine_months: 1 / 9,
  yearly: 1 / 12,
  biennial: 1 / 24,
  triennial: 1 / 36,
};

function uniqDates(list) {
  const out = [];
  const seen = new Set();
  for (const d of list) {
    const nd = normalizeDateString(d);
    if (!nd || seen.has(nd)) continue;
    seen.add(nd);
    out.push(nd);
  }
  return out;
}

/* 🔹 ADD: category default gradient intensity */
const CATEGORY_INTENSITY_DEFAULT = {
  bills: 0.18,
  utilities: 0.18,
  streaming: 0.32,
  entertainment: 0.34,
  fitness: 0.28,
  software: 0.26,
  gaming: 0.34,
  other: 0.25,
};

function hexToRgba(hex, alpha = 0.85) {
  if (!hex || typeof hex !== "string" || !hex.startsWith("#") || hex.length !== 7) {
    // console.warn("Invalid hex color:", hex);
    return "rgba(255,255,255,0.9)"; // fallback
  }

  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}


function toRgba(color, alpha) {
  if (!color) return `rgba(255,255,255,${alpha})`;
  if (color.startsWith("rgba")) {
    return color.replace(/rgba\(([^)]+),[^)]+\)/, `rgba($1, ${alpha})`);
  }
  if (color.startsWith("#")) return hexToRgba(color, alpha);
  return color;
}

/* -------------------- Component -------------------- */
export default function SubscriptionForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { user } = useAuth();
  const premium = usePremium();
  const { currency: mainCurrency } = useCurrency();
  const [method, setMethod] = useState("");
  const [methodOpen, setMethodOpen] = useState(false);


  const PAYMENT_METHODS = [
    { value: "visa", label: "Visa", icon: "💳", logo: "/icons/visa.svg" },
    { value: "mastercard", label: "Mastercard", icon: "💳", logo: "/icons/mastercard.svg" },
    { value: "paypal", label: "PayPal", icon: "🅿️", logo: "/icons/paypal.svg" },
    { value: "klarna", label: "Klarna", icon: "🅺", logo: "/icons/klarna.svg" },
    { value: "bank", label: "Bank Transfer", icon: "🏦" },
    { value: "cash", label: "Cash", icon: "💵" },
  ];
  const methodRef = React.useRef(null);

  const selectedMethod =
    PAYMENT_METHODS.find((m) => m.value === method) || {
      label: "Select method", // Default label
      icon: "💳",              // Optional: generic icon
    };

  useEffect(() => {
    const handler = (e) => {
      if (methodRef.current && !methodRef.current.contains(e.target)) {
        setMethodOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);



  const PRESET_COLORS = [
    "rgba(248, 113, 113, 0.75)", // red
    "rgba(250, 204, 21, 0.75)",  // yellow
    "rgba(74, 222, 128, 0.75)",  // green
    "rgba(96, 165, 250, 0.75)",  // blue
    "rgba(167, 139, 250, 0.75)", // purple
    "rgba(244, 114, 182, 0.75)", // pink
    "rgba(52, 211, 153, 0.75)",  // teal
    "rgba(249, 115, 22, 0.75)",  // orange
  ];


  const getRandomColor = () =>
    PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)];

  const email = user?.email;
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  const [category, setCategory] = useState("other");
  const [datePaid, setDatePaid] = useState("");
  const [notify, setNotify] = useState(true);
  const [currency, setCurrency] = useState("EUR");
  const [color, setColor] = useState(getRandomColor());
  const [icon, setIcon] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  /* 🔹 ADD: gradient intensity */
  const [gradientIntensity, setGradientIntensity] = useState(
    CATEGORY_INTENSITY_DEFAULT.other
  );

  /* 🔹 ADD: low-power detection */
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ||
      navigator.connection?.saveData === true
    );
  }, []);

  const advancedFrequencies = useMemo(
    () => ["quarterly", "semiannual", "nine_months", "biennial", "triennial"],
    []
  );

  const limitReached = !id && !premium.isPremium && subscriptions.length >= 5;
  const requiresPremiumInterval = !premium.isPremium && advancedFrequencies.includes(frequency);
  const token = localStorage.getItem("token");

  /* ------------------ Load Subscriptions ------------------ */
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

  const kvSave = async (updated) => {
    const res = await fetch("/api/subscriptions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ action: "save", email, subscriptions: updated }),
    });

    if (!res.ok) {
      let msg = "Failed to save subscriptions";
      try {
        const data = await res.json();
        msg = data?.error || msg;
      } catch { }
      throw new Error(msg);
    }
  };

  const suggestions = useMemo(() => {
    if (!name.trim()) return [];
    const q = name.toLowerCase();
    return subscriptionCatalog
      .filter(s => s.name.toLowerCase().includes(q))
      .slice(0, 6);
  }, [name]);

  /* ------------------ Load Data ------------------ */
  useEffect(() => {
    if (!email) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const list = await kvGet();
        if (cancelled) return;

        setSubscriptions(list);

        if (id) {
          const existing = list.find((s) => String(s.id) === String(id));
          if (!existing) {
            showToast("Subscription not found", "error");
            navigate("/dashboard");
            return;
          }

          setName(existing.name || "");
          setPrice(String(existing.price || ""));
          setFrequency(existing.frequency || "monthly");
          setCategory(existing.category || "other");
          setDatePaid(existing.datePaid || "");
          setNotify(existing.notify !== false);
          setCurrency(existing.currency || "EUR");
          setMethod(existing.method || "");
        }
      } catch (err) {
        console.error("SubscriptionForm load error:", err);
        showToast("Failed to load subscription data", "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [email, id, navigate, showToast]);


  /* ------------------ Load + MIGRATION ------------------ */
  useEffect(() => {
    if (!email) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const list = await kvGet();
        if (cancelled) return;
        /* 🔹 ADD: migrate old subscriptions */
        const migrated = list.map((s) => ({
          ...s,
          gradientIntensity:
            typeof s.gradientIntensity === "number"
              ? s.gradientIntensity
              : CATEGORY_INTENSITY_DEFAULT[s.category] ??
              CATEGORY_INTENSITY_DEFAULT.other,
        }));

        setSubscriptions(migrated);

        if (id) {
          const existing = migrated.find((s) => String(s.id) === String(id));
          if (!existing) {
            showToast("Subscription not found", "error");
            navigate("/dashboard");
            return;
          }

          setName(existing.name || "");
          setPrice(String(existing.price || ""));
          setFrequency(existing.frequency || "monthly");
          setCategory(existing.category || "other");
          setDatePaid(existing.datePaid || "");
          setNotify(existing.notify !== false);
          setCurrency(existing.currency || "EUR");
          setMethod(existing.method || "");
          setColor(existing.color || getRandomColor());
          setGradientIntensity(existing.gradientIntensity);
        }
      } catch (err) {
        console.error(err);
        showToast("Failed to load subscription data", "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [email, id, navigate, showToast]);
  /* ------------------ Submit ------------------ */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) return showToast("Not authenticated", "error");
    if (limitReached) {
      setPremiumIntent("limit");
      return navigate("/settings");
    }
    if (!name.trim()) return showToast(t("error_required"), "error");

    const priceNum = Number(price);
    if (!price || isNaN(priceNum) || priceNum <= 0) {
      return showToast(t("error_price_invalid"), "error");
    }

    if (!datePaid) return showToast(t("error_paid_date_required"), "error");
    if (requiresPremiumInterval) {
      setPremiumIntent("interval");
      return navigate("/settings");
    }
    const paidRaw = normalizeDateString(datePaid);
    if (!paidRaw) return showToast(t("error_paid_date_required"), "error");

    const today = normalizeDateString(new Date());
    const paid = paidRaw > today ? today : paidRaw;

    try {
      let updated;
      if (id) {
        updated = subscriptions.map((s) => {
          if (String(s.id) !== String(id)) return s;
          const prevPaid = normalizeDateString(s.datePaid);
          const nextHistory = uniqDates([
            ...(Array.isArray(s.history) ? s.history : []),
            ...(prevPaid && prevPaid !== paid ? [prevPaid] : []),
          ]);

          return {
            ...s,
            name: name.trim(),
            price: priceNum,
            frequency,
            category,
            datePaid: paid,
            notify,
            currency,
            method: method.trim(),
            color,
            history: nextHistory,
          };
        });
        showToast(t("toast_updated"), "success");
      } else {
        updated = [
          ...subscriptions,
          {
            id: crypto.randomUUID(),
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
            payments: [
              {
                id: crypto.randomUUID(),
                date: paid,
                amount: priceNum,
                currency,
              },
            ],
            history: [], // optional UI use only
          },
        ];

        showToast(t("toast_added"), "success");
      }


      await kvSave(updated);
      navigate("/dashboard");
    } catch (err) {
      console.error("Save failed:", err);
      showToast(err.message || "Failed to save subscription", "error");
    }
  };

  /* 🔹 ADD: gradient style */
  const gradientStyle =
    premium.isPremium && !prefersReducedMotion
      ? {
        background: `linear-gradient(
            120deg,
            ${toRgba(color, gradientIntensity + 0.15)},
            ${toRgba(color, gradientIntensity)},
            transparent
          )`,
        backgroundSize: "200% 200%",
        animation: "trakioGradient 6s ease infinite",
      }
      : {
        background: `linear-gradient(
            135deg,
            ${toRgba(color, gradientIntensity)},
            transparent
          )`,
      };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto mt-4 px-4 pb-2">
        <Card>
          <div className="py-8 text-center text-sm">Loading…</div>
        </Card>
      </div>
    );
  }
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto mt-4 px-4 pb-2">
        <Card className="relative overflow-hidden">
          <div className="py-8 text-center text-sm text-gray-600 dark:text-gray-300">
            Loading…
          </div>
        </Card>
      </div>
    );
  }

  function hexToRgba(hex, alpha = 0.85) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  /* ------------------ JSX ------------------ */
  return (
    <div className="max-w-2xl mx-auto pb-2">
      <Card className="relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={gradientStyle}
        />
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-2 py-4 text-gray-900 dark:text-white">
            {id ? t("edit_title") : t("add_title")}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div className="relative">
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("form_name")}
              </label>

              <input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setShowSuggestions(true);
                  setIcon(null);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder={t("placeholder_examples")}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-900/60"
              />

              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
                  {suggestions.map((s) => (
                    <button
                      key={s.name}
                      type="button"
                      onClick={() => {
                        setName(s.name);
                        setIcon(s.icon);
                        setCategory(s.category || "other");
                        setShowSuggestions(false);
                      }}
                      className="flex items-center gap-3 w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <img
                        src={`/icons/${s.icon}.svg`}
                        alt=""
                        className="w-5 h-5"
                      />
                      <span>{s.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>


            {/* Price */}
            <div>
              <label className=" mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("form_price")} ({currency})
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-900/60"
                />
              </div>
            </div>

            {/* Frequency */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("form_frequency")}
              </label>
              <FrequencySelector
                value={frequency}
                onChange={setFrequency}
                isPremium={premium.isPremium}
                onRequirePremium={() => navigate("/premium?reason=intervals")}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("form_category")}
              </label>
              <CategorySelector value={category} onChange={setCategory} />
            </div>

            {/* Payment Method */}
            <div ref={methodRef} className="relative">
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Payment Method
              </label>

              {/* BUTTON */}
              <button
                type="button"
                onClick={() => setMethodOpen((p) => !p)}
                className="form-field"
              >
                <span className="flex items-center gap-2">
                  {selectedMethod.logo ? (
                    <img
                      src={selectedMethod.logo}
                      alt=""
                      className="w-5 h-5 object-contain"
                    />
                  ) : (
                    <span className="text-lg">{selectedMethod.icon}</span>
                  )}
                  <span>{selectedMethod.label}</span>
                </span>

                <span className="form-arrow">▾</span>
              </button>

              {/* DROPDOWN */}
              {methodOpen && (
                <div
                  className="
        absolute left-0 right-0 mt-2 rounded-xl shadow-xl z-40
        bg-white dark:bg-gray-900
        border border-gray-200 dark:border-gray-700
        max-h-64 overflow-y-auto
      "
                >
                  {PAYMENT_METHODS.map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => {
                        setMethod(m.value);
                        setMethodOpen(false);
                      }}
                      className="
            w-full flex items-center gap-3 px-4 py-3 text-left
            hover:bg-gray-100 dark:hover:bg-gray-800
            transition
          "
                    >
                      {m.logo ? (
                        <img
                          src={m.logo}
                          alt=""
                          className="w-5 h-5 object-contain"
                        />
                      ) : (
                        <span className="text-lg">{m.icon}</span>
                      )}
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>


            {/* Color Picker */}
            {/* Color Picker */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("label_color")} (optional)
              </label>

              {/* Color Choices */}
              <div className="flex flex-wrap gap-2 mb-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`
          w-8 h-8 rounded-full border-2 transition-transform duration-150
          ${color === c ? "border-black dark:border-white scale-110" : "border-gray-300 hover:scale-105"}
        `}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                    title={c}
                  />
                ))}

                {/* Current / Custom color (if different) */}
                {!PRESET_COLORS.includes(color) && (
                  <div
                    className="w-8 h-8 rounded-full border-2 border-dashed border-gray-400"
                    style={{ backgroundColor: color }}
                    title="Current saved color"
                  />
                )}
              </div>

              {/* Custom color input */}
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="color"
                  value={`#${(color.match(/\d+/g) || [])
                    .slice(0, 3)
                    .map((v) => parseInt(v).toString(16).padStart(2, "0"))
                    .join("")}`}
                  onChange={(e) => setColor(hexToRgba(e.target.value))}
                  className="w-10 h-8 p-0 border border-gray-400 rounded cursor-pointer"
                  title="Pick custom color"
                />

                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {color}
                </span>
              </div>
            </div>



            {/* Date Paid */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("label_select_paid_date")}
              </label>
              <input
                type="date"
                value={datePaid}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => setDatePaid(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-900/60"
              />
            </div>

            {/* Notify */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={notify}
                onChange={(e) => setNotify(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label className="text-sm text-gray-700 dark:text-gray-300">
                {t("settings_notifications_info")}
              </label>
            </div>

            {/* Submit / Cancel */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <SettingButton type="submit" variant="primary">
                {id ? t("form_save") : t("add_subscription")}
              </SettingButton>
              <SettingButton
                type="button"
                variant="neutral"
                onClick={() => navigate("/dashboard")}
              >
                {t("button_cancel")}
              </SettingButton>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}

/* 🔹 ADD: global keyframes once */
if (typeof document !== "undefined") {
  const styleId = "trakio-gradient-keyframes";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.innerHTML = `
      @keyframes trakioGradient {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
    `;
    document.head.appendChild(style);
  }
}