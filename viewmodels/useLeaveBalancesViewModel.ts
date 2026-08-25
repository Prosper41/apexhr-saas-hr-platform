"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchMyLeaveBalances } from "@/services/leave-balances.service";
import type { LeaveBalance } from "@/services/leave-balances.service";

export function useLeaveBalancesViewModel() {
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadBalances = useCallback(async () => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("Access token not found. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      const data = await fetchMyLeaveBalances(token);
      setBalances(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    loadBalances();
  }, [mounted, loadBalances]);

  useEffect(() => {
    if (!mounted) return;
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") loadBalances();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [mounted, loadBalances]);

  useEffect(() => {
    if (!mounted) return;
    const handleApproval = () => loadBalances();
    window.addEventListener("leave:approved", handleApproval);
    return () => window.removeEventListener("leave:approved", handleApproval);
  }, [mounted, loadBalances]);

  return { balances, loading, error, mounted, refetch: loadBalances };
}
