export function setPremiumIntent(reason = "feature") {
  try {
    localStorage.setItem("premium_intent", reason);
    localStorage.setItem("premium_intent_ts", String(Date.now()));
  } catch { }
}

export function consumePremiumIntent() {
  try {
    const reason = localStorage.getItem("premium_intent");
    localStorage.removeItem("premium_intent");
    localStorage.removeItem("premium_intent_ts");
    return reason;
  } catch {
    return null;
  }
}
