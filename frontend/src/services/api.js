const API_URL = import.meta.env.VITE_API_URL || "https://gcbackis3-319066395850.southamerica-east1.run.app";

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(errorText || `Request failed with status ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  getHabits: () => request("/habits"),
  getHabit: (id) => request(`/habits/${id}`),
  createHabit: (payload) =>
    request("/habits", { method: "POST", body: JSON.stringify(payload) }),
  updateHabit: (id, payload) =>
    request(`/habits/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteHabit: (id) => request(`/habits/${id}`, { method: "DELETE" }),
  completeHabit: (id) => request(`/habits/${id}/complete`, { method: "POST" }),
};
