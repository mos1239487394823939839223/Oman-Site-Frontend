import { io, Socket } from "socket.io-client";

/**
 * Where the Socket.IO client connects. Socket.IO uses its own /socket.io path
 * and can't go through Next.js rewrites.
 *
 * Resolution order:
 *   1. NEXT_PUBLIC_SOCKET_URL  — explicit override
 *   2. Same origin as the page — in the browser we connect to the site's own
 *      domain and let nginx proxy /socket.io/ to the backend. This keeps the
 *      socket on the one origin that's guaranteed reachable (the app loaded
 *      from it) and avoids depending on a separate api subdomain, which may
 *      not be reachable for WebSocket/polling.
 *   3. NEXT_PUBLIC_API_URL minus /api/v1 — SSR/no-window fallback
 *   4. http://localhost:8000  — dev fallback
 */
function resolveSocketUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SOCKET_URL;
  if (explicit) return explicit.replace(/\/+$/, "");

  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl) {
    try {
      return new URL(apiUrl).origin; // strips /api/v1 and any path
    } catch {
      /* fall through */
    }
  }
  return "http://localhost:8000";
}

let socket: Socket | null = null;

/**
 * Open (or reuse) the shared admin socket connection.
 * Reads the current admin JWT from localStorage at call time so a fresh
 * token is always used in the handshake. Safe to call again after re-login
 * as long as {@link disconnectSocket} runs first.
 */
export function connectSocket(): Socket {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Reuse an already-connected socket only if it carries the same token.
  if (socket && socket.auth && (socket.auth as { token?: string }).token === token) {
    if (!socket.connected) socket.connect();
    return socket;
  }

  // Token changed (re-login) or first connect — tear down any stale socket.
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  socket = io(resolveSocketUrl(), {
    auth: { token },
    autoConnect: true,
    // Poll first, then upgrade to WebSocket. Polling is plain HTTP(S) over the
    // same path the REST API already uses, so it connects even when a proxy
    // (nginx / Cloudflare) doesn't cleanly forward the WebSocket upgrade — a
    // websocket-first client tends to hang there instead of falling back.
    transports: ["polling", "websocket"],
  });

  socket.on("connect", () =>
    console.log("🔌 admin notifications connected")
  );
  socket.on("connect_error", (err) =>
    console.error("socket error:", err.message)
  );

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}
