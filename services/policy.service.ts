import type { Policy, FormState } from "@/models/policy.types";
import { ADMIN_ROLES } from "@/models/policy.types";
import { BASE_URL, getHeaders } from "@/lib/api";

async function parseError(response: Response): Promise<string> {
  const data = await response.json().catch(() => null);
  return Array.isArray(data?.message)
    ? data.message.join(", ")
    : data?.message || `Request failed (${response.status})`;
}

export async function fetchPolicies(
  token: string,
  userRole: string | null,
): Promise<Policy[]> {
  const endpoint = ADMIN_ROLES.includes(userRole ?? "")
    ? `${BASE_URL}/v1/leave-policies`
    : `${BASE_URL}/v1/leave-policies/my-policies`;

  const response = await fetch(endpoint, {
    method: "GET",
    headers: getHeaders(token),
    cache: "no-store",
  });

  if (!response.ok) throw new Error(await parseError(response));

  const data = await response.json();

  return Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.policies)
        ? data.policies
        : Array.isArray(data?.items)
          ? data.items
          : [];
}

export async function createPolicy(
  token: string,
  form: FormState,
): Promise<Policy> {
  const payload: Record<string, unknown> = {
    name: form.name,
    description: form.description || undefined,
    type: form.type,
    accrual: form.accrual,
    accrualRate: parseFloat(form.accrualRate),
    maxBalance: parseFloat(form.maxBalance),
    carryOverPolicy: form.carryOverPolicy,
    isActive: form.isActive,
  };

  if (form.carryOverPolicy === "Limited" && form.carryOverLimit) {
    payload.carryOverLimit = parseFloat(form.carryOverLimit);
  }

  if (form.waitingPeriodDays) {
    payload.waitingPeriodDays = parseInt(form.waitingPeriodDays, 10);
  }

  const response = await fetch(`${BASE_URL}/v1/leave-policies`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      Array.isArray(data?.message)
        ? data.message.join(", ")
        : data?.message || "Failed to create policy.",
    );
  }

  return data;
}

export async function updatePolicy(
  token: string,
  policyId: string,
  form: FormState,
): Promise<Policy> {
  const payload: Record<string, unknown> = {
    name: form.name,
    description: form.description || undefined,
    type: form.type,
    accrual: form.accrual,
    accrualRate: parseFloat(form.accrualRate),
    maxBalance: parseFloat(form.maxBalance),
    carryOverPolicy: form.carryOverPolicy,
    isActive: form.isActive,
  };

  if (form.carryOverPolicy === "Limited" && form.carryOverLimit) {
    payload.carryOverLimit = parseFloat(form.carryOverLimit);
  }

  if (form.waitingPeriodDays) {
    payload.waitingPeriodDays = parseInt(form.waitingPeriodDays, 10);
  }

  const response = await fetch(`${BASE_URL}/v1/leave-policies/${policyId}`, {
    method: "PATCH",
    headers: getHeaders(token),
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      Array.isArray(data?.message)
        ? data.message.join(", ")
        : data?.message || "Failed to update policy.",
    );
  }

  return data;
}

export async function deletePolicy(
  token: string,
  policyId: string,
): Promise<void> {
  const response = await fetch(`${BASE_URL}/v1/leave-policies/${policyId}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });

  if (!response.ok) throw new Error(await parseError(response));
}
