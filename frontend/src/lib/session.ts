// Mock login: we only remember which user id the visitor is "logged in as".
// localStorage keeps it across page reloads. It is wrapped in try/catch because
// some browsers (private mode, blocked storage) throw when it is accessed.

const STORAGE_KEY = "currentUserId";

export function getStoredUserId(): number | null {
  if (typeof window === "undefined") return null; // running on the server: no localStorage
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value ? Number(value) : null;
  } catch {
    return null;
  }
}

export function setStoredUserId(userId: number): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(userId));
  } catch {
    // ignore: the user stays logged in until the page is reloaded
  }
}
