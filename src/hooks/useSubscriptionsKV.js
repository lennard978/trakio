import { useEffect, useState } from "react";

export default function useSubscriptionsKV() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/subscriptions", {
        credentials: "include" // 🔴 REQUIRED
      });

      if (!res.ok) {
        setLoading(false);
        return;
      }


      const data = await res.json();
      setSubscriptions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("KV fetch failed:", err);
      setError(err.message);
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const create = async (sub) => {
    await fetch("/api/subscriptions", {
      method: "POST",
      credentials: "include", // 🔴 REQUIRED
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sub),
    });
    fetchAll();
  };

  const update = async (sub) => {
    await fetch(`/api/subscriptions/${sub.id}`, {
      method: "PUT",
      credentials: "include", // 🔴 REQUIRED
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sub),
    });
    fetchAll();
  };

  const remove = async (id) => {
    await fetch(`/api/subscriptions/${id}`, {
      method: "DELETE",
      credentials: "include", // 🔴 REQUIRED
    });
    fetchAll();
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return {
    subscriptions,
    loading,
    error,
    refetch: fetchAll,
    create,
    update,
    remove,
  };
}
