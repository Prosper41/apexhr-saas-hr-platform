import { BASE_URL, getHeaders } from "@/lib/api";
import type {
  DashboardStats,
  RequestTrendPoint,
  DepartmentAbsence,
  UpcomingAbsence,
  PendingApproval,
} from "@/models/dashboard.types";

async function parseError(response: Response): Promise<string> {
  const data = await response.json().catch(() => null);
  return Array.isArray(data?.message)
    ? data.message.join(", ")
    : data?.message || `Request failed (${response.status})`;
}

async function getJson(url: string, token: string) {
  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders(token),
  });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}

function unwrapArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  const wrapped = data as { data?: T[]; items?: T[] };
  return wrapped?.data ?? wrapped?.items ?? [];
}

export async function fetchDashboardStats(
  token: string,
): Promise<DashboardStats> {
  const data = await getJson(`${BASE_URL}/v1/dashboard/stats`, token);
  return (data?.data ?? data) as DashboardStats;
}

export async function fetchRequestTrends(
  token: string,
): Promise<RequestTrendPoint[]> {
  const data = await getJson(`${BASE_URL}/v1/dashboard/request-trends`, token);
  return unwrapArray<RequestTrendPoint>(data);
}

export async function fetchDepartmentToday(
  token: string,
): Promise<DepartmentAbsence[]> {
  const data = await getJson(
    `${BASE_URL}/v1/dashboard/department-today`,
    token,
  );
  return unwrapArray<DepartmentAbsence>(data);
}

export async function fetchPendingApprovals(
  token: string,
): Promise<PendingApproval[]> {
  const data = await getJson(
    `${BASE_URL}/v1/dashboard/pending-approvals`,
    token,
  );
  return unwrapArray<PendingApproval>(data);
}

export async function fetchUpcomingAbsences(
  token: string,
): Promise<UpcomingAbsence[]> {
  const data = await getJson(
    `${BASE_URL}/v1/dashboard/upcoming-absences`,
    token,
  );
  return unwrapArray<UpcomingAbsence>(data);
}
