import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";
import { loadSubscriptionsLocal, saveSubscriptionsLocal } from "../utils/mainDB";
import { flushQueue } from "../utils/offlineQueue";
import { persistSubscriptions } from "../utils/persistSubscriptions";

async function kvGet(email) {
  const data = await apiFetch("/api/subscriptions", {
    method: "POST",
    body: { action: "get", email },
  });
  return Array.isArray(data.subscriptions) ? data.subscriptions : [];
}

export function useSubscriptions(user) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;

    (async () => {
      setLoading(true);

      try {
        const local = await loadSubscriptionsLocal();
        if (local.length) setSubscriptions(local);
      } catch (e) {
        console.warn("Local cache read failed", e);
      }

      if (navigator.onLine) {
        try {
          await flushQueue();
          const remote = await kvGet(user.email);
          if (remote?.length) {
            setSubscriptions(remote);
            await saveSubscriptionsLocal(remote);
          }
          // eslint-disable-next-line no-unused-vars
        } catch (err) {
          console.warn("Backend fetch failed, using local cache");
        }
      }

      setLoading(false);
    })();
  }, [user?.email]);

  const persist = async (nextSubs) => {
    setSubscriptions(nextSubs);
    await saveSubscriptionsLocal(nextSubs);

    try {
      await persistSubscriptions({
        email: user.email,
        token: localStorage.getItem("token"),
        subscriptions: nextSubs,
      });
    } catch (err) {
      console.error("Persist failed:", err);
    }
  };

  return { subscriptions, setSubscriptions, loading, persist };
}
