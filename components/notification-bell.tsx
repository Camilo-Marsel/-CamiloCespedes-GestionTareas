"use client";

import { useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { BellRingIcon, Tick01Icon } from "@hugeicons/core-free-icons";

type Notification = {
  id: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
  taskId?: string;
};

const TYPE_LABEL: Record<string, string> = {
  TASK_ASSIGNED: "Tarea asignada",
  COMPLETION_REQUESTED: "Solicitud de completado",
  TASK_APPROVED: "Tarea aprobada",
  TASK_REJECTED: "Tarea rechazada",
};

const TYPE_COLOR: Record<string, string> = {
  TASK_ASSIGNED: "text-blue-600",
  COMPLETION_REQUESTED: "text-amber-600",
  TASK_APPROVED: "text-emerald-600",
  TASK_REJECTED: "text-red-500",
};

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unread = notifications.filter((n) => !n.read).length;

  async function fetchNotifications() {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch {}
  }

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}`, { method: "PUT" });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  async function markAllRead() {
    await fetch("/api/notifications", { method: "PUT" });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        aria-label="Notificaciones"
      >
        <HugeiconsIcon icon={BellRingIcon} strokeWidth={2} className="size-4.5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-10 z-50 w-80 rounded-xl border bg-popover shadow-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <span className="text-sm font-semibold">Notificaciones</span>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <HugeiconsIcon icon={Tick01Icon} strokeWidth={2} className="size-3" />
                Marcar todas como leídas
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto divide-y">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
                <HugeiconsIcon icon={BellRingIcon} strokeWidth={1.5} className="size-8 opacity-30" />
                <p className="text-xs">Sin notificaciones</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={`px-4 py-3 cursor-pointer hover:bg-accent/60 transition-colors ${
                    !n.read ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!n.read && (
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    )}
                    <div className={n.read ? "ml-3.5" : ""}>
                      <p className={`text-xs font-semibold ${TYPE_COLOR[n.type] ?? "text-foreground"}`}>
                        {TYPE_LABEL[n.type] ?? n.type}
                      </p>
                      <p className="text-xs text-foreground mt-0.5 leading-relaxed">{n.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {new Date(n.createdAt).toLocaleString("es-CO", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}