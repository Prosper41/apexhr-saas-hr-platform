"use client";

import { useEffect, useState, useCallback } from "react";
import {
  fetchDashboardStats,
  fetchRequestTrends,
  fetchDepartmentToday,
  fetchUpcomingAbsences,
  fetchPendingApprovals,
} from "@/services/dashboard.services";
import type {
  DashboardStats,
  RequestTrendPoint,
  DepartmentAbsence,
  UpcomingAbsence,
  PendingApproval,
} from "@/models/dashboard.types";

function useDashboardResource<T>(
  fetcher: (token: string) => Promise<T>,
  emptyValue: T,
  listenForApprovals = true,
) {
  const [data, setData] = useState<T>(emptyValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("Access token not found. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      const result = await fetcher(token);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    if (!mounted) return;
    load();
  }, [mounted, load]);

  useEffect(() => {
    if (!mounted) return;
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [mounted, load]);

  useEffect(() => {
    if (!mounted || !listenForApprovals) return;
    const handleApproval = () => load();
    window.addEventListener("leave:approved", handleApproval);
    return () => window.removeEventListener("leave:approved", handleApproval);
  }, [mounted, load, listenForApprovals]);

  return { data, loading, error, mounted, refetch: load };
}

export function useDashboardStatsViewModel() {
  const { data, loading, error, mounted, refetch } =
    useDashboardResource<DashboardStats | null>(fetchDashboardStats, null);
  return { stats: data, loading, error, mounted, refetch };
}

export function useRequestTrendsViewModel() {
  const { data, loading, error, mounted, refetch } = useDashboardResource<
    RequestTrendPoint[]
  >(fetchRequestTrends, [], false);
  return { trends: data, loading, error, mounted, refetch };
}

export function useDepartmentTodayViewModel() {
  const { data, loading, error, mounted, refetch } = useDashboardResource<
    DepartmentAbsence[]
  >(fetchDepartmentToday, [], true);
  return { departments: data, loading, error, mounted, refetch };
}

export function usePendingApprovalsViewModel() {
  const { data, loading, error, mounted, refetch } = useDashboardResource<
    PendingApproval[]
  >(fetchPendingApprovals, [], true);
  return { pending: data, loading, error, mounted, refetch };
}

export function useUpcomingAbsencesViewModel() {
  const { data, loading, error, mounted, refetch } = useDashboardResource<
    UpcomingAbsence[]
  >(fetchUpcomingAbsences, [], true);
  return { absences: data, loading, error, mounted, refetch };
}
