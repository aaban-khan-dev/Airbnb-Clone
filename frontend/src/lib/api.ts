import { API_URL } from "@/lib/config";
import { getStoredUserId } from "@/lib/session";

// Thrown for any non-2xx response, carrying the backend's error message
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {};

  // Mock auth: tell the backend which user we are
  const userId = getStoredUserId();
  if (userId !== null) headers["X-User-Id"] = String(userId);

  if (body !== undefined) headers["Content-Type"] = "application/json";

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new ApiError(res.status, errorMessage(data?.detail, res.status));
  }

  if (res.status === 204) return undefined as T; // "No Content" responses have no body
  return res.json() as Promise<T>;
}

type ValidationError = { loc: (string | number)[]; msg: string };

// FastAPI sends { "detail": "message" } for our own errors, and
// { "detail": [{ loc: ["body", "title"], msg: "..." }, ...] } when validation fails
function errorMessage(detail: unknown, status: number): string {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return (detail as ValidationError[])
      .map((error) => {
        const field = error.loc.filter((part) => typeof part === "string" && part !== "body").at(-1);
        const text = error.msg.replace(/^Value error, /, "");
        return field ? `${String(field).replaceAll("_", " ")}: ${text}` : text;
      })
      .join(" · ");
  }
  return `Request failed (${status})`;
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  put: <T>(path: string, body?: unknown) => request<T>("PUT", path, body),
  delete: <T>(path: string) => request<T>("DELETE", path),
};
