import { useEffect, useState } from "react";
import { updatePolicy } from "@/services/policy.service";
import type { Policy, FormState } from "@/models/policy.types";

type Props = {
  policy: Policy;
  onUpdated: (policy: Policy) => void;
};

type FieldChangeEvent = React.ChangeEvent<
  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
>;

function policyToForm(policy: Policy): FormState {
  return {
    name: policy.name,
    description: policy.description ?? "",
    type: policy.type,
    accrual: policy.accrual,
    accrualRate: String(policy.accrualRate ?? ""),
    maxBalance: String(policy.maxBalance ?? ""),
    carryOverPolicy: policy.carryOverPolicy,
    carryOverLimit:
      policy.carryOverLimit != null ? String(policy.carryOverLimit) : "",
    waitingPeriodDays:
      policy.waitingPeriodDays != null ? String(policy.waitingPeriodDays) : "",
    isActive: policy.isActive,
  };
}

export function useEditPolicyViewModel({ policy, onUpdated }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FormState>(policyToForm(policy));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (dialogOpen) {
      setForm(policyToForm(policy));
      setError(null);
      setSuccess(false);
    }
  }, [dialogOpen, policy]);

  function setField(key: keyof FormState) {
    return function handleChange(e: FieldChangeEvent) {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
    };
  }

  function setIsActive(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, isActive: e.target.checked }));
  }

  function handleOpenChange(open: boolean) {
    setDialogOpen(open);
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
      const updated = await updatePolicy(token, policy.id, form);
      onUpdated(updated);
      setSuccess(true);
      setDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
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
