// Tiny handoff so the session screen can pass its result to the summary screen
// across a route change. Memory first (survives navigation), sessionStorage as a
// refresh-tolerant backup.
let mem = null;
const KEY = "sg_last_session";

export function setLastSession(data) {
  mem = data;
  try { sessionStorage.setItem(KEY, JSON.stringify(data)); } catch {}
}

export function getLastSession() {
  if (mem) return mem;
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
