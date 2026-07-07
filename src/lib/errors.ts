/**
 * Turn any thrown value into a short, user-friendly message.
 *
 * The API layer already surfaces clean operational messages from the backend
 * (e.g. "Duplicate name value: X. Please use another value."). This helper
 * catches the cases that aren't friendly on their own — network failures,
 * timeouts, and raw 5xx/status errors — and falls back to a provided default.
 */
export function getFriendlyError(err: unknown, fallback = "Something went wrong. Please try again."): string {
  const raw =
    err instanceof Error ? err.message : typeof err === "string" ? err : "";

  const message = raw.trim();
  if (!message) return fallback;

  const lower = message.toLowerCase();

  // Network / server-unreachable (fetch throws a TypeError like "Failed to fetch")
  if (
    lower.includes("failed to fetch") ||
    lower.includes("networkerror") ||
    lower.includes("network request failed") ||
    lower.includes("load failed")
  ) {
    return "Can't reach the server. Please check your connection and try again.";
  }

  // Session handling is already user-friendly upstream — pass it through.
  if (lower.includes("session expired")) return message;

  // Generic status-code errors with no useful text
  if (/^request failed:\s*\d+$/.test(lower)) {
    const status = message.match(/\d+/)?.[0];
    if (status && status.startsWith("5")) {
      return "Something went wrong on our side. Please try again in a moment.";
    }
    return fallback;
  }

  // A clean backend message — use it as-is.
  return message;
}
