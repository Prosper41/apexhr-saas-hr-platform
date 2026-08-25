"use client";

import { useEffect, useState, useCallback } from "react";
import { BASE_URL, getHeaders } from "@/lib/api";

const POLL_INTERVAL_MS = 30_000;

export function useUnreadCount() {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const res = await fetch(`${BASE_URL}/v1/notifications/stats`, {
        headers: getHeaders(token),
      });

      if (!res.ok) return;

      const data = await res.json();
      setUnreadCount(data?.unread ?? 0);
    } catch (err) {
      console.error("Failed to fetch unread notification count:", err);
    }
  }, []);

  useEffect(() => {
    void fetchUnreadCount();

    const interval = setInterval(fetchUnreadCount, POLL_INTERVAL_MS);

    const onFocus = () => void fetchUnreadCount();
    window.addEventListener("focus", onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [fetchUnreadCount]);

  return { unreadCount, refetchUnreadCount: fetchUnreadCount };
}
