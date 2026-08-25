"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { BASE_URL, getHeaders } from "@/lib/api";
import { useUnreadCount } from "@/hooks/useUnreadCount";

interface ApiNotification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

function buildHeaders(): HeadersInit {
  const base: Record<string, string> = {
    "Content-Type": "application/json",
    ...(getHeaders() as Record<string, string>),
  };

  if (
    base["Authorization"] &&
    base["Authorization"] !== "Bearer null" &&
    base["Authorization"] !== "Bearer undefined"
  ) {
    return base;
  }

  if (typeof window !== "undefined") {
    const token =
      localStorage.getItem("token") ??
      localStorage.getItem("accessToken") ??
      localStorage.getItem("access_token") ??
      localStorage.getItem("authToken") ??
      sessionStorage.getItem("token") ??
      sessionStorage.getItem("accessToken") ??
      sessionStorage.getItem("access_token") ??
      sessionStorage.getItem("authToken");

    if (token) {
      base["Authorization"] = `Bearer ${token}`;
    }
  }

  return base;
}

export function NotificationBell() {
  const router = useRouter();
  const { unreadCount, refetchUnreadCount } = useUnreadCount();
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState<ApiNotification[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadRecent = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/v1/notifications`, {
        headers: buildHeaders(),
      });
      if (!res.ok) {
        throw new Error(`GET /notifications failed: ${res.status}`);
      }
      const data = await res.json();
      const list: ApiNotification[] = Array.isArray(data)
        ? data
        : (data.data ?? []);
      setItems(list.slice(0, 5));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (open) void loadRecent();
  }, [open, loadRecent]);

  const markAllRead = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await fetch(`${BASE_URL}/v1/notifications/read-all`, {
        method: "PATCH",
        headers: buildHeaders(),
      });
      void refetchUnreadCount();
    } catch {
      void loadRecent();
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-muted relative size-10 rounded-full"
          aria-label="Notifications"
        >
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span className="ring-background absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white ring-2">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={10}
        className="w-96 p-0 shadow-lg"
      >
        <div className="flex items-center justify-between border-b px-4 py-3.5">
          <span className="text-base font-semibold">Notifications</span>
          <button
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className="text-primary text-xs font-medium disabled:opacity-40"
          >
            Mark all read
          </button>
        </div>

        <div className="max-h-96 overflow-auto">
          {loading ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              Loading…
            </p>
          ) : error ? (
            <div className="py-8 text-center">
              <p className="text-destructive text-sm font-medium">
                Couldn&apos;t load notifications
              </p>
              <p className="text-muted-foreground mt-1 px-4 text-xs break-words">
                {error}
              </p>
              <button
                onClick={() => void loadRecent()}
                className="text-primary mt-2 text-xs font-medium"
              >
                Retry
              </button>
            </div>
          ) : items.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              No notifications
            </p>
          ) : (
            items.map((n) => (
              <div
                key={n.id}
                className={cn(
                  "flex items-start gap-3 border-b px-4 py-3.5 last:border-b-0",
                  !n.isRead && "bg-blue-50 dark:bg-blue-950/20",
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs">
                    {n.message}
                  </p>
                  <p className="text-muted-foreground/70 mt-1 text-[11px]">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                {!n.isRead && (
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-blue-500" />
                )}
              </div>
            ))
          )}
        </div>

        <button
          onClick={() => {
            setOpen(false);
            router.push("/notifications");
          }}
          className="text-primary w-full border-t px-4 py-3 text-center text-sm font-medium"
        >
          View all activity
        </button>
      </PopoverContent>
    </Popover>
  );
}
