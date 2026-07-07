import { io, Socket } from "socket.io-client";

/**
 * Socket.IO connects to the SERVER ORIGIN (e.g. http://localhost:8000),
 * NOT the REST base (which includes the /api/v1 suffix). Socket.IO uses
 * its own /socket.io path and can't go through Next.js rewrites, so we
 * always point at the real backend origin.
 *
 * Resolution order:
 *   1. NEXT_PUBLIC_SOCKET_URL           — explicit override
 *   2. NEXT_PUBLIC_API_URL minus /api/v1 — derive origin from the REST base
 *   3. http://localhost:8000            — dev fallback
 */
function resolveSocketUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SOCKET_URL;
  if (explicit) return explicit.replace(/\/+$/, "");

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

const SOCKET_URL = resolveSocketUrl();

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

  socket = io(SOCKET_URL, {
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
