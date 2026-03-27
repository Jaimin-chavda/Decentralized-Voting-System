const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

export async function apiRequest(path, options = {}) {
  const safePath = path.startsWith("/") ? path : `/${path}`;
  
  // Retrieve token from local storage session
  let token = null;
  try {
    const session = localStorage.getItem("votechain_auth");
    if (session) {
      const parsed = JSON.parse(session);
      token = parsed.token;
    }
  } catch (e) {
    // Ignore error
  }

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${safePath}`, {
    headers,
    ...options,
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(payload?.message || "Request failed");
  }

  return payload;
}
