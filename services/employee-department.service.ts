import { BASE_URL, getHeaders } from "@/lib/api";
import {
  ApiDepartment,
  ApiUser,
  AddEmployeeFormState,
  Department,
  EditEmployeeFormState,
  Employee,
} from "../models/employee-department.types";

async function parseError(response: Response): Promise<string> {
  const data = await response.json().catch(() => null);
  return Array.isArray(data?.message)
    ? data.message.join(", ")
    : data?.message || `Request failed (${response.status})`;
}

function formatDob(dob?: string): string {
  if (!dob) return "";
  const date = new Date(dob);
  if (isNaN(date.getTime())) return dob;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function normalizeStatus(raw?: string): string {
  if (!raw) return "active";
  const s = raw.toLowerCase();
  if (s.includes("leave")) return "on-leave";
  if (s.includes("inactive")) return "inactive";
  return "active";
}

function getSafeId(user: ApiUser, index: number): string {
  return (
    user?.id ?? user?._id ?? user?.userId ?? user?.email ?? `employee-${index}`
  );
}

function mapApiUserToEmployee(user: ApiUser, index: number): Employee {
  const firstName = user.firstName ?? "";
  const lastName = user.lastName ?? "";
  return {
    id: getSafeId(user, index),
    name: `${firstName} ${lastName}`.trim(),
    avatar: `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase(),
    email: user.email ?? "",
    contact: user.contact ?? "",
    role: user.role ?? "Employee",
    department: user.department?.name ?? user.departmentName ?? "",
    departmentId: user.department?.id ?? user.department?._id ?? "",
    location: user.houseAddress ?? user.address ?? "",
    status: normalizeStatus(user.status),
    dateofbirth: formatDob(user.dateOfBirth ?? user.dateofbirth),
  };
}

function normalizeDepartment(d: ApiDepartment): Department {
  return { id: d.id ?? d._id ?? "", name: d.name ?? "Unnamed" };
}

function extractUsersArray(data: unknown): ApiUser[] {
  if (!data) return [];
  if (Array.isArray(data)) return data as ApiUser[];
  if (typeof data === "object") {
    const record = data as Record<string, unknown>;
    for (const key of ["users", "data", "employees", "items"]) {
      if (Array.isArray(record[key])) return record[key] as ApiUser[];
    }
  }
  return [];
}

export async function fetchEmployees(token: string): Promise<Employee[]> {
  const res = await fetch(`${BASE_URL}/v1/users`, {
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error(await parseError(res));
  const data = await res.json();
  return extractUsersArray(data).map((u, i) => mapApiUserToEmployee(u, i));
}

export async function fetchDepartments(token: string): Promise<Department[]> {
  const res = await fetch(`${BASE_URL}/v1/department`, {
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error(await parseError(res));
  const data = await res.json();
  const raw: ApiDepartment[] = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : [];
  return raw.map(normalizeDepartment);
}

export async function createEmployee(
  token: string,
  form: AddEmployeeFormState,
): Promise<{ id: string }> {
  const res = await fetch(`${BASE_URL}/v1/auth/register`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      contact: form.contact.trim(),
      departmentId: form.departmentId,
      role: form.role,
      houseAddress: form.houseAddress.trim(),
      dateOfBirth: form.dateOfBirth,
      email: form.workEmail.trim(),
    }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function updateEmployee(
  token: string,
  id: string,
  form: EditEmployeeFormState,
): Promise<void> {
  const res = await fetch(`${BASE_URL}/v1/users/${id}`, {
    method: "PATCH",
    headers: getHeaders(token),
    body: JSON.stringify({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      contact: form.contact.trim(),
      departmentId: form.departmentId,
      role: form.role,
      houseAddress: form.houseAddress.trim(),
      dateOfBirth: form.dateOfBirth,
    }),
  });
  if (!res.ok) throw new Error(await parseError(res));
}

export async function deleteEmployee(token: string, id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/v1/users/${id}`, {
    method: "DELETE",
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error(await parseError(res));
}

export async function createDepartment(
  token: string,
  payload: { name: string; description: string },
): Promise<void> {
  const res = await fetch(`${BASE_URL}/v1/department`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await parseError(res));
}
