import { jwtDecode } from "jwt-decode";
import { BASE_URL, getHeaders } from "@/lib/api";
import {
  ApprovalRequest,
  LeaveRequest,
  WorkflowStep,
  ACTIONABLE_STATUSES,
} from "@/models/approval.types";

export function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function approverFullName(
  approvedBy?: { firstName?: string; lastName?: string } | null,
): string {
  if (!approvedBy) return "";
  return `${approvedBy.firstName ?? ""} ${approvedBy.lastName ?? ""}`.trim();
}

export function buildWorkflow(
  r: LeaveRequest,
  currentStage: string | null,
): WorkflowStep[] {
  const tlStatus = r.teamLeadApproval?.status;
  const dhStatus = r.deptHeadApproval?.status;
  const hrStatus = r.hrApproval?.status;

  const resolveStep = (
    stageKey: string,
    stageStatus: string | undefined,
  ): "completed" | "current" | "pending" | "rejected" | "commented" => {
    if (stageStatus === "approved") return "completed";
    if (stageStatus === "commented") return "commented";
    if (stageStatus === "rejected") return "rejected";
    return currentStage === stageKey ? "current" : "pending";
  };

  return [
    {
      step: "team_lead",
      label: "Team Lead",
      status: resolveStep("team_lead", tlStatus),
      approvedBy: approverFullName(r.teamLeadApproval?.approvedBy),
      approvedAt: r.teamLeadApproval?.approvedAt
        ? formatDate(r.teamLeadApproval.approvedAt)
        : undefined,
    },
    {
      step: "dept_head",
      label: "Dept Head",
      status: resolveStep("dept_head", dhStatus),
      approvedBy: approverFullName(r.deptHeadApproval?.approvedBy),
      approvedAt: r.deptHeadApproval?.approvedAt
        ? formatDate(r.deptHeadApproval.approvedAt)
        : undefined,
    },
    {
      step: "hr",
      label: "HR Admin",
      status: resolveStep("hr", hrStatus),
      approvedBy: approverFullName(r.hrApproval?.approvedBy),
      approvedAt: r.hrApproval?.approvedAt
        ? formatDate(r.hrApproval.approvedAt)
        : undefined,
    },
  ];
}

export function normalizeToApproval(r: LeaveRequest): ApprovalRequest {
  const firstName = r.user?.firstName ?? "";
  const lastName = r.user?.lastName ?? "";
  const fullName = `${firstName} ${lastName}`.trim() || "Unknown";
  const currentStage = r.currentStage ?? null;

  return {
    rawId: r.id,
    id: r.id.slice(0, 12).toUpperCase(),
    employee: fullName,
    avatar: getInitials(fullName),
    role: r.user?.role ?? "—",
    department: r.department?.name ?? "—",
    departmentId: r.department?.id ?? "",
    type: r.leavePolicy?.type ?? "—",
    startDate: formatDate(r.startDate),
    endDate: formatDate(r.endDate),
    days: r.totalDays ?? r.days ?? 1,
    reason: r.reason ?? "—",
    submittedAt: formatDate(r.createdAt ?? ""),
    status: r.status?.toLowerCase() ?? "pending",
    currentStage,
    workflow: buildWorkflow(r, currentStage),
    conflict: false,
    existingComments: Array.isArray(r.comments) ? r.comments : [],
  };
}

export function filterQueueForRole(
  all: ApprovalRequest[],
  resolvedRole: string,
  resolvedDeptId: string,
): ApprovalRequest[] {
  return all.filter((r) => {
    if (
      !ACTIONABLE_STATUSES.includes(
        r.status.toLowerCase() as (typeof ACTIONABLE_STATUSES)[number],
      )
    )
      return false;

    if (resolvedRole === "TEAM_LEAD") {
      return (
        r.currentStage === "team_lead" &&
        (resolvedDeptId === "" || r.departmentId === resolvedDeptId)
      );
    }
    if (resolvedRole === "DEPT_HEAD") {
      return (
        r.currentStage === "dept_head" &&
        (resolvedDeptId === "" || r.departmentId === resolvedDeptId)
      );
    }
    if (resolvedRole === "HR_ADMIN" || resolvedRole === "TENANT_ADMIN") {
      return r.currentStage === "hr";
    }
    return true;
  });
}

export interface DecodedToken {
  role?: string;
  departmentId?: string;
  deptId?: string;
}

export function decodeToken(token: string): DecodedToken {
  try {
    return jwtDecode<DecodedToken>(token);
  } catch {
    return {};
  }
}

export function approveEndpoint(requestId: string, userRole: string): string {
  if (userRole === "DEPT_HEAD") {
    return `${BASE_URL}/v1/leave-requests/${requestId}/dept-approve`;
  }
  return `${BASE_URL}/v1/leave-requests/${requestId}/hr-approve`;
}

export async function fetchLeaveRequests(
  token: string,
): Promise<LeaveRequest[]> {
  const res = await fetch(`${BASE_URL}/v1/leave-requests`, {
    method: "GET",
    headers: getHeaders(token),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message ?? `Failed to fetch requests (${res.status})`);
  }

  const data = await res.json();
  return Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.requests)
        ? data.requests
        : [];
}

export async function submitTeamLeadComment(
  requestId: string,
  comment: string,
  token: string,
): Promise<void> {
  const res = await fetch(
    `${BASE_URL}/v1/leave-requests/${requestId}/team-lead-comment`,
    {
      method: "PATCH",
      headers: { ...getHeaders(token), "Content-Type": "application/json" },
      body: JSON.stringify({ comment: comment.trim() }),
    },
  );

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(
      Array.isArray(err?.message)
        ? err.message.join(", ")
        : (err?.message ?? `Failed to submit comment (${res.status})`),
    );
  }
}

export async function submitApprovalAction(
  requestId: string,
  action: "approve" | "reject",
  userRole: string,
  token: string,
): Promise<void> {
  const endpoint =
    action === "approve"
      ? approveEndpoint(requestId, userRole)
      : `${BASE_URL}/v1/leave-requests/${requestId}/reject`;

  const res = await fetch(endpoint, {
    method: "PATCH",
    headers: getHeaders(token),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(
      Array.isArray(err?.message)
        ? err.message.join(", ")
        : (err?.message ?? `Action failed (${res.status})`),
    );
  }
}

export async function submitComment(
  requestId: string,
  comment: string,
  token: string,
): Promise<{ id?: string }> {
  const res = await fetch(
    `${BASE_URL}/v1/leave-requests/${requestId}/comment`,
    {
      method: "POST",
      headers: { ...getHeaders(token), "Content-Type": "application/json" },
      body: JSON.stringify({ comment: comment.trim() }),
    },
  );
  if (!res.ok) throw new Error("Failed to submit comment");
  return res.json();
}
