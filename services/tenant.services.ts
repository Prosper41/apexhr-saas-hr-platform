import type { RegisterTenantPayload } from "@/models/tenant.types";
import { BASE_URL, getHeaders } from "@/lib/api";

export async function registerTenant(
  payload: RegisterTenantPayload,
): Promise<void> {
  const response = await fetch(`${BASE_URL}/v1/auth/register-tenant`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.message || "Failed to create account");
  }
}
