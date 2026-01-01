export async function apiFetch(path, { method = "POST", body, headers = {}, timeoutMs = 15000 } = {}) {
  const token = localStorage.getItem("token");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

    const finalHeaders = {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    };

    const res = await fetch(path, {
      method,
      headers: finalHeaders,
      body: isFormData ? body : body != null ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text || null;
    }

    if (!res.ok) {
      const message = (data && data.error) ? data.error : `Request failed (${res.status})`;
      const err = new Error(message);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  } finally {
    clearTimeout(timeout);
  }
}
