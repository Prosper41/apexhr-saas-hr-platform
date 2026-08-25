"use client";

import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { fetchPolicies, deletePolicy } from "@/services/policy.service";
import type { Policy } from "@/models/policy.types";
import { ADMIN_ROLES } from "@/models/policy.types";
import { useConfirm } from "@/components/providers/confirm-dialog-provider";

export function useLeavePoliciesViewModel() {
  const confirm = useConfirm();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loadingPolicies, setLoadingPolicies] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [canManagePolicies, setCanManagePolicies] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      const decoded = jwtDecode<{ role: string }>(token);
      setUserRole(decoded?.role ?? null);
      setCanManagePolicies(ADMIN_ROLES.includes(decoded?.role));
    } catch {
      setCanManagePolicies(false);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    async function loadPolicies() {
      setLoadingPolicies(true);
      setFetchError(null);

      const token = localStorage.getItem("accessToken");
      if (!token) {
        setFetchError("Access token not found. Please log in again.");
        setLoadingPolicies(false);
        return;
      }

      try {
        const data = await fetchPolicies(token, userRole);
        setPolicies(data);
      } catch (err) {
        setFetchError(
          err instanceof Error ? err.message : "Something went wrong.",
        );
      } finally {
        setLoadingPolicies(false);
      }
    }

    loadPolicies();
  }, [mounted, userRole]);

  function handlePolicyCreated(newPolicy: Policy) {
    setPolicies((prev) => [...prev, newPolicy]);
  }

  function handlePolicyUpdated(updatedPolicy: Policy) {
    setPolicies((prev) =>
      prev.map((p) => (p.id === updatedPolicy.id ? { ...updatedPolicy } : p)),
    );
  }

  async function handleDeletePolicy(policyId: string) {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("Access token not found. Please log in again.");
      return;
    }

    const ok = await confirm({
      title: "Delete leave policy",
      description:
        "Are you sure you want to delete this policy? This action can't be undone.",
      confirmLabel: "Delete",
      variant: "destructive",
    });
    if (!ok) return;

    try {
      await deletePolicy(token, policyId);
      setPolicies((prev) => prev.filter((p) => p.id !== policyId));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return {
    policies,
    loadingPolicies,
    fetchError,
    mounted,
    canManagePolicies,
    handlePolicyCreated,
    handlePolicyUpdated,
    handleDeletePolicy,
  };
}
