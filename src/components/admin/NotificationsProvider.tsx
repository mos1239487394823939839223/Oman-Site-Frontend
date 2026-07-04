"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/admin/ToastProvider";
import { connectSocket, disconnectSocket } from "@/lib/socket";

/**
 * Lean payload emitted by the backend on `order:new`.
 * `user` is just an ID — fetch GET /orders/:id for full details.
 */
export interface OrderNotification {
  id: string;
  user: string;
  totalOrderPrice: number;
  itemCount: number;
  paymentMethod: string;
  isPaid: boolean;
  createdAt: string;
}

interface NotificationsContextType {
  notifications: OrderNotification[];
  unreadCount: number;
  markAllRead: () => void;
  clear: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | null>(null);

const MAX_KEPT = 30;

/** Short WebAudio beep so we need no bundled audio asset. */
function playChime() {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1175, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
    osc.onended = () => ctx.close();
  } catch {
    /* browsers block audio until the user interacts with the page */
  }
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const toast = useToast();

  const [notifications, setNotifications] = useState<OrderNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Keep the latest toast fn in a ref so the socket effect doesn't re-run
  // (and re-handshake) every render.
  const toastRef = useRef(toast);
  toastRef.current = toast;

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    // Only admins/managers may connect; a user token is rejected by the server.
    if (!isAdmin) {
      disconnectSocket();
      return;
    }

    const socket = connectSocket();

    const handleNewOrder = (order: OrderNotification) => {
      console.log("🛎️ New order!", order);
      setNotifications((prev) => [order, ...prev].slice(0, MAX_KEPT));
      setUnreadCount((c) => c + 1);
      playChime();
      toastRef.current.success(
        "New order received",
        `${order.paymentMethod} · ${order.totalOrderPrice} EGP · ${order.itemCount} item(s)`
      );
    };

    socket.on("order:new", handleNewOrder);

    return () => {
      socket.off("order:new", handleNewOrder);
      // Full teardown happens on logout (isAdmin flips false) via the branch above.
    };
    // Re-run when the logged-in identity changes so a re-login re-handshakes
    // with the fresh token.
  }, [isAdmin, user?._id]);

  const markAllRead = useCallback(() => setUnreadCount(0), []);
  const clear = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return (
    <NotificationsContext.Provider
      value={{ notifications, unreadCount, markAllRead, clear }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx)
    throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
}
