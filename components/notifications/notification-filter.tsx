"use client";

import * as React from "react";
import {
  Bell,
  AlertTriangle,
  Calendar,
  Check,
  CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BASE_URL, getHeaders } from "@/lib/api";

type Priority = "LOW" | "MEDIUM" | "HIGH";
type SourceType = "LEAVE_REQUEST" | "LEAVE_BALANCE" | "SYSTEM";
type Tab = "all" | "unread" | "high";

interface ApiNotification {
  id: string;
  title: string;
  message: string;
  priority: Priority;
  isRead: boolean;
  sourceType: SourceType;
  sourceId: string | null;
  createdAt: string;
}

interface NotificationStats {
  total: number;
  unread: number;
  highPriority: number;
  thisWeek: number;
}

function getIcon(sourceType: SourceType) {
  if (sourceType === "LEAVE_REQUEST") {
    return <CalendarDays className="size-4 text-blue-500" />;
  }

  return <Bell className="size-4 text-blue-500" />;
}

function getDotColor(priority: Priority): "orange" | "blue" {
  return priority === "HIGH" || priority === "MEDIUM" ? "orange" : "blue";
}

function getSourceTag(sourceType: SourceType): string {
  if (sourceType === "LEAVE_REQUEST") return "leave request";
  if (sourceType === "LEAVE_BALANCE") return "balance";

  return "system";
}

function NotificationTag({ tag }: { tag: string }) {
  if (tag === "medium") {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
        {tag}
      </span>
    );
  }

  if (tag === "high") {
    return (
      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
        {tag}
      </span>
    );
  }

  if (tag === "low") {
    return (
      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
        {tag}
      </span>
    );
  }

  return (
    <span className="border-border text-muted-foreground inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium">
      {tag}
    </span>
  );
}

interface NotificationRowProps {
  notification: ApiNotification;
  onMarkRead: (id: string) => void;
}

function NotificationRow({ notification, onMarkRead }: NotificationRowProps) {
  const tags = [
    getSourceTag(notification.sourceType),
    notification.priority.toLowerCase(),
  ];

  return (
    <div
      className={cn(
        "border-border flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
        !notification.isRead
          ? "bg-blue-50 hover:border-blue-200 dark:bg-blue-950/20"
          : "bg-card hover:border-border/80",
      )}
      onClick={() => {
        if (!notification.isRead) {
          onMarkRead(notification.id);
        }
      }}
    >
      <span
        className={cn(
          "mt-1.5 size-2 shrink-0 rounded-full",
          getDotColor(notification.priority) === "orange"
            ? "bg-amber-400"
            : "bg-blue-500",
        )}
      />

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          {getIcon(notification.sourceType)}
          <span className="text-foreground text-sm font-medium">
            {notification.title}
          </span>
        </div>

        <p className="text-muted-foreground mb-1.5 text-sm leading-relaxed">
          {notification.message}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground/70 text-xs">
            {new Date(notification.createdAt).toLocaleString()}
          </span>

          {tags.map((tag) => (
            <NotificationTag key={tag} tag={tag} />
          ))}
        </div>
      </div>

      {!notification.isRead && (
        <span className="mt-1.5 size-2 shrink-0 rounded-full bg-blue-500" />
      )}
    </div>
  );
}

const DEFAULT_STATS: NotificationStats = {
  total: 0,
  unread: 0,
  highPriority: 0,
  thisWeek: 0,
};

function deriveStats(notifications: ApiNotification[]): NotificationStats {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  return {
    total: notifications.length,
    unread: notifications.filter((n) => !n.isRead).length,
    highPriority: notifications.filter((n) => n.priority === "HIGH").length,
    thisWeek: notifications.filter((n) => new Date(n.createdAt) >= weekAgo)
      .length,
  };
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

export default function NotificationsPage() {
  const [notifications, setNotifications] = React.useState<ApiNotification[]>(
    [],
  );
  const [stats, setStats] = React.useState<NotificationStats>(DEFAULT_STATS);
  const [activeTab, setActiveTab] = React.useState<Tab>("all");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadData = React.useCallback(async () => {
    setError(null);

    try {
      const headers = buildHeaders();

      const [listRes, statsRes] = await Promise.all([
        fetch(`${BASE_URL}/v1/notifications`, { headers }),
        fetch(`${BASE_URL}/v1/notifications/stats`, { headers }),
      ]);

      if (!listRes.ok) {
        const body = await listRes.text().catch(() => "");

        if (listRes.status === 401 || listRes.status === 403) {
          throw new Error(
            `Authentication failed (${listRes.status}). ` +
              `Make sure a valid token is stored and getHeaders() returns an ` +
              `Authorization header. Server said: ${body || listRes.statusText}`,
          );
        }

        throw new Error(
          `GET /notifications failed with ${listRes.status} ${listRes.statusText}${body ? `: ${body}` : ""}`,
        );
      }

      const listData = await listRes.json();
      const list: ApiNotification[] = Array.isArray(listData)
        ? listData
        : (listData.data ?? []);

      setNotifications(list);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData ?? deriveStats(list));
      } else {
        console.warn(
          `GET /notifications/stats failed with ${statsRes.status} ${statsRes.statusText} — deriving stats from list`,
        );
        setStats(deriveStats(list));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("Failed to load notifications:", message);
      setError(message);
      setStats(DEFAULT_STATS);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredNotifications = React.useMemo(() => {
    if (activeTab === "unread") {
      return notifications.filter((n) => !n.isRead);
    }

    if (activeTab === "high") {
      return notifications.filter((n) => n.priority === "HIGH");
    }

    return notifications;
  }, [notifications, activeTab]);

  const markRead = async (id: string) => {
    const target = notifications.find((n) => n.id === id);

    if (!target || target.isRead) return;

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );

    setStats((prev) => ({
      ...prev,
      unread: Math.max(0, prev.unread - 1),
    }));

    try {
      const res = await fetch(`${BASE_URL}/v1/notifications/${id}/read`, {
        method: "PATCH",
        headers: buildHeaders(),
      });

      if (!res.ok) {
        throw new Error(
          `PATCH /notifications/${id}/read failed: ${res.status}`,
        );
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
      void loadData();
    }
  };

  const markAllRead = async () => {
    const hasUnread = notifications.some((n) => !n.isRead);

    if (!hasUnread) return;

    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setStats((prev) => ({ ...prev, unread: 0 }));

    try {
      const res = await fetch(`${BASE_URL}/v1/notifications/read-all`, {
        method: "PATCH",
        headers: buildHeaders(),
      });

      if (!res.ok) {
        throw new Error(`PATCH /notifications/read-all failed: ${res.status}`);
      }
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
      void loadData();
    }
  };

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "all", label: "All", count: stats.total },
    { key: "unread", label: "Unread", count: stats.unread },
    { key: "high", label: "High Priority", count: stats.highPriority },
  ];

  return (
    <div>
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h1 className="text-foreground text-lg font-semibold">
            Notifications
          </h1>

          <p className="text-muted-foreground text-sm">
            Stay updated with important HR notifications and reminders
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1.5 text-sm"
          onClick={markAllRead}
          disabled={stats.unread === 0}
        >
          <Check className="size-3.5" />
          Mark all as read
        </Button>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="bg-primary/10 flex size-11 items-center justify-center rounded-xl">
              <Bell className="text-primary size-5" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-muted-foreground text-sm">Total</p>
              <p className="text-foreground text-2xl font-semibold">
                {stats.total}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="bg-destructive/15 flex size-11 items-center justify-center rounded-xl">
              <Bell className="text-destructive size-5" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-muted-foreground text-sm">Unread</p>
              <p className="text-foreground text-2xl font-semibold">
                {stats.unread}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-11 items-center justify-center rounded-xl bg-amber-400/30">
              <AlertTriangle className="size-5 text-amber-600" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-muted-foreground text-sm">High Priority</p>

              <div className="flex items-baseline gap-2">
                <p className="text-foreground text-2xl font-semibold">
                  {stats.highPriority}
                </p>

                {stats.highPriority > 0 && (
                  <span className="text-xs font-medium text-amber-600">
                    Needs review
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-11 items-center justify-center rounded-xl bg-green-500/20">
              <Calendar className="size-5 text-green-600" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-muted-foreground text-sm">This Week</p>
              <p className="text-foreground text-2xl font-semibold">
                {stats.thisWeek}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-5">
          <p className="text-foreground mb-4 text-sm font-medium">
            All notifications
          </p>

          <div className="bg-muted mb-4 flex gap-1 rounded-lg p-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  activeTab === tab.key
                    ? "border-border bg-background text-foreground border shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2.5">
            {loading ? (
              <p className="text-muted-foreground py-8 text-center text-sm">
                Loading notifications...
              </p>
            ) : error ? (
              <div className="py-8 text-center">
                <p className="text-destructive text-sm font-medium">
                  Failed to load notifications
                </p>
                <p className="text-muted-foreground mt-1 text-xs">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => {
                    setLoading(true);
                    void loadData();
                  }}
                >
                  Retry
                </Button>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">
                No notifications
              </p>
            ) : (
              filteredNotifications.map((notification) => (
                <NotificationRow
                  key={notification.id}
                  notification={notification}
                  onMarkRead={markRead}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
