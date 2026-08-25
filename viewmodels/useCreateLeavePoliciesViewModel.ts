"use client";

import { useState } from "react";
import { createPolicy } from "@/services/policy.service";
import type { FormState, Policy } from "@/models/policy.types";
import { EMPTY_FORM } from "@/models/policy.types";

type Props = {
  onCreated: (policy: Policy) => void;
};

export function useCreatePolicyViewModel({ onCreated }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const setField =
    (key: keyof FormState) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  function setIsActive(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((f) => ({ ...f, isActive: e.target.checked }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("Access token not found. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      const newPolicy = await createPolicy(token, form);
      onCreated(newPolicy);
      setSuccess(true);
      setTimeout(() => handleOpenChange(false), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function handleOpenChange(open: boolean) {
    setDialogOpen(open);

    if (!open) {
      setForm(EMPTY_FORM);
      setError(null);
      setSuccess(false);
    }
  }

  return {
    dialogOpen,
    form,
    loading,
    error,
    success,
    setField,
    setIsActive,
    handleSubmit,
    handleOpenChange,
  };
}
