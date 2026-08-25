import { BASE_URL, getHeaders } from "@/lib/api";

export interface LeaveBalance {
  leaveType: string;
  policyMax: number;
  accrued: number;
  used: number;
  pending: number;
  remaining: number;
}

async function parseError(response: Response): Promise<string> {
  const data = await response.json().catch(() => null);
  return Array.isArray(data?.message)
    ? data.message.join(", ")
    : data?.message || `Request failed (${response.status})`;
}

export async function fetchMyLeaveBalances(
  token: string,
): Promise<LeaveBalance[]> {
  const response = await fetch(`${BASE_URL}/v1/leave-balance/my-balances`, {
    method: "GET",
    headers: getHeaders(token),
  });

  if (!response.ok) throw new Error(await parseError(response));

  const data = await response.json();

  const raw: LeaveBalance[] = Array.isArray(data)
    ? data
    : Array.isArray(data?.balances)
      ? data.balances
      : Array.isArray(data?.data)
        ? data.data
        : [];

  return raw.map((b) => ({
    ...b,
    remaining: Math.max(0, b.policyMax - b.used),
  }));
}
