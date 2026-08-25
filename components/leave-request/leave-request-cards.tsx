"use client";

import {
  CheckCircle2,
  Clock,
  Eye,
  Loader2,
  MessageSquare,
  X,
  XCircle,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { useEffect, useMemo, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { BASE_URL, getHeaders } from "@/lib/api";
import { ADMIN_ROLES } from "@/models/policy.types";
import type { RequestFilterValues } from "./requests-filters";

const statusConfig: Record<
  string,
  { label: string; icon: React.ElementType; className: string }
> = {
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-[#d97706]/35 text-[#d97706] border-0",
  },
  approved: {
    label: "Approved",
    icon: CheckCircle2,
    className: "bg-[#1d9c32]/35 text-[#1d9c32] border-0",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    className: "bg-destructive/15 text-destructive border-0",
  },
  commented: {
    label: "Commented",
    icon: MessageSquare,
    className: "bg-blue-500/15 text-blue-600 border-0",
  },
};

const typeColors: Record<string, string> = {
  Annual: "bg-chart-1/10 text-chart-1",
  Sick: "bg-chart-2/10 text-chart-2",
  Personal: "bg-chart-3/10 text-chart-3",
  Unpaid: "bg-muted text-muted-foreground",
  Custom: "bg-chart-4/10 text-chart-4",
};

interface ApprovalStep {
  id?: string;
  order?: number;
  level?: number;
  step?: number;
  approverId?: string;
  approverName?: string;
  approverRole?: string;
  approverDepartment?: string;
  approver?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    role?: string;
    jobTitle?: string;
    department?: string;
  };
  status?: string;
  actedAt?: string;
  updatedAt?: string;
  reviewedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  respondedAt?: string;
  comment?: string;
  note?: string;
  remarks?: string;
}

interface LeaveRequest {
  id: string;
  startDate: string;
  endDate: string;
  isHalfDay: boolean;
  reason?: string;
  totalDays?: number;
  days?: number;
  status: string;
  createdAt?: string;
  submittedAt?: string;
  userId?: string;
  leavePolicyId?: string;
  departmentId?: string;
  tenantId?: string;
  user?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
    name?: string;
  };
  leavePolicy?: {
    id?: string;
    name?: string;
    type?: string;
  };
  comments?: unknown[];
  approvalChain?: ApprovalStep[];
  approvals?: ApprovalStep[];
  approvers?: ApprovalStep[];
  steps?: ApprovalStep[];
  leaveApprovals?: ApprovalStep[];
  approvalSteps?: ApprovalStep[];
  approvalFlow?: ApprovalStep[];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateShort(dateStr: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
}

function formatDateTime(dateStr: string): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  if (date >= startOfToday) return `Today at ${time}`;
  if (date >= startOfYesterday) return `Yesterday at ${time}`;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatActionTime(status: string, dateStr?: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const verb =
    status === "approved"
      ? "Approved"
      : status === "rejected"
        ? "Rejected"
        : status === "commented"
          ? "Commented"
          : "Updated";

  if (date >= startOfToday) return `${verb} today at ${time}`;
  if (date >= startOfYesterday) return `${verb} yesterday at ${time}`;
  return `${verb} on ${date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })} at ${time}`;
}

function extractChain(r: LeaveRequest): ApprovalStep[] {
  return (
    r.approvalChain ??
    r.approvals ??
    r.approvers ??
    r.leaveApprovals ??
    r.approvalSteps ??
    r.approvalFlow ??
    r.steps ??
    []
  );
}

function resolveActedAt(step: ApprovalStep): string | undefined {
  return (
    step.actedAt ??
    step.approvedAt ??
    step.rejectedAt ??
    step.reviewedAt ??
    step.respondedAt ??
    (step.status && step.status !== "pending" ? step.updatedAt : undefined)
  );
}

function resolveApproverName(step: ApprovalStep): string {
  if (step.approver) {
    const { firstName, lastName, name } = step.approver;
    if (firstName || lastName)
      return `${firstName ?? ""} ${lastName ?? ""}`.trim();
    if (name) return name;
  }
  if (step.approverName) return step.approverName;
  return "Unknown";
}

function resolveApproverRole(step: ApprovalStep): string {
  if (step.approver) {
    return (
      step.approver.jobTitle ??
      step.approver.role ??
      step.approver.department ??
      ""
    );
  }
  return step.approverRole ?? step.approverDepartment ?? "—";
}

function resolveComment(step: ApprovalStep): string | undefined {
  return step.comment ?? step.note ?? step.remarks;
}

function normalizeRequest(r: LeaveRequest) {
  const firstName = r.user?.firstName ?? "";
  const lastName = r.user?.lastName ?? "";
  const fullName =
    firstName || lastName
      ? `${firstName} ${lastName}`.trim()
      : (r.user?.name ?? "Unknown");

  const type = r.leavePolicy?.type ?? "—";
  const policyName = r.leavePolicy?.name ?? type;
  const days = r.totalDays ?? r.days ?? 1;
  const submittedAt = r.createdAt ?? r.submittedAt ?? "";
  const commentCount = Array.isArray(r.comments) ? r.comments.length : 0;

  const rawChain = extractChain(r);

  return {
    id: r.id,
    employee: fullName,
    avatar: getInitials(fullName),
    role: r.user?.role ?? "—",
    type,
    policyName,
    leavePolicyId: r.leavePolicyId ?? r.leavePolicy?.id ?? "",
    departmentId: r.departmentId ?? "",
    startDate: formatDate(r.startDate),
    endDate: formatDate(r.endDate),
    startDateShort: formatDateShort(r.startDate),
    endDateShort: formatDateShort(r.endDate),
    rawStartDate: r.startDate ? new Date(r.startDate) : null,
    rawSubmittedAt: submittedAt ? new Date(submittedAt) : null,
    days,
    status: r.status?.toLowerCase() ?? "pending",
    submittedAt: formatDateTime(submittedAt),
    appliedDateShort: formatDateShort(submittedAt),
    reason: r.reason ?? "—",
    comments: commentCount,
    approvalChain: rawChain.map((step, i) => ({
      step: step.order ?? step.level ?? step.step ?? i + 1,
      name: resolveApproverName(step),
      role: resolveApproverRole(step),
      status: (step.status ?? "pending").toLowerCase(),
      actedAt: resolveActedAt(step),
      comment: resolveComment(step),
    })),
  };
}

type NormalizedRequest = ReturnType<typeof normalizeRequest>;

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function applyRequestFilters(
  requests: NormalizedRequest[],
  filters?: RequestFilterValues,
): NormalizedRequest[] {
  if (!filters) return requests;

  const search = filters.search.trim().toLowerCase();

  return requests.filter((r) => {
    if (filters.leavePolicyId && r.leavePolicyId !== filters.leavePolicyId) {
      return false;
    }

    if (filters.month) {
      if (!r.rawStartDate) return false;
      if (String(r.rawStartDate.getMonth() + 1) !== filters.month) {
        return false;
      }
    }

    if (filters.dateRequested) {
      if (!r.rawSubmittedAt) return false;
      if (!isSameDay(r.rawSubmittedAt, filters.dateRequested)) return false;
    }

    if (search) {
      const haystack = `${r.type} ${r.policyName} ${r.reason}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }

    return true;
  });
}

const stepVisual: Record<
  string,
  {
    icon: React.ElementType;
    connectorColor: string;
    avatarClass: string;
    badgeClass: string;
    label: string;
  }
> = {
  approved: {
    icon: CheckCircle2,
    connectorColor: "bg-emerald-400",
    avatarClass:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
    badgeClass: "bg-[#1d9c32]/20 text-[#1d9c32] border-0",
    label: "Approved",
  },
  rejected: {
    icon: XCircle,
    connectorColor: "bg-red-400",
    avatarClass: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
    badgeClass: "bg-destructive/15 text-destructive border-0",
    label: "Rejected",
  },
  commented: {
    icon: MessageSquare,
    connectorColor: "bg-blue-400",
    avatarClass:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
    badgeClass: "bg-blue-500/15 text-blue-600 border-0",
    label: "Commented",
  },
  pending: {
    icon: Clock,
    connectorColor: "bg-border",
    avatarClass: "bg-muted text-muted-foreground",
    badgeClass: "bg-[#d97706]/20 text-[#d97706] border-0",
    label: "Pending",
  },
};

function getStepVisual(status: string) {
  return stepVisual[status] ?? stepVisual["pending"];
}

function ApprovalTimeline({
  chain,
}: {
  chain: NormalizedRequest["approvalChain"];
}) {
  if (chain.length === 0) {
    return (
      <p className="text-muted-foreground py-4 text-center text-xs">
        No approvers assigned to this request.
      </p>
    );
  }

  return (
    <div className="relative">
      {chain.map((step, idx) => {
        const visual = getStepVisual(step.status);
        const StepIcon = visual.icon;
        const isLast = idx === chain.length - 1;
        const actionTime =
          step.status !== "pending"
            ? formatActionTime(step.status, step.actedAt)
            : null;

        const narrativeLine = actionTime ?? "Awaiting action";

        return (
          <div key={step.step} className="relative flex gap-3">
            {/* Vertical connector line */}
            {!isLast && (
              <div
                className={`absolute top-8 left-[15px] h-full w-0.5 ${visual.connectorColor} opacity-40`}
              />
            )}

            {/* Step number / icon avatar */}
            <div className="relative z-10 shrink-0">
              <div
                className={`flex size-8 items-center justify-center rounded-full text-xs font-bold ${visual.avatarClass}`}
              >
                {step.status !== "pending" ? (
                  <StepIcon className="size-3.5" />
                ) : (
                  <span>{step.step}</span>
                )}
              </div>
            </div>

            {/* Content */}
            <div className={`min-w-0 flex-1 pb-5 ${isLast ? "pb-0" : ""}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  {/* Approver name + role */}
                  <p className="text-foreground truncate text-sm leading-tight font-semibold">
                    {step.name}
                  </p>
                  {step.role && step.role !== "—" && (
                    <p className="text-muted-foreground text-[11px]">
                      {step.role}
                    </p>
                  )}

                  {/* Narrative action line */}
                  <p
                    className={`mt-0.5 text-[11px] font-medium ${
                      step.status === "approved"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : step.status === "rejected"
                          ? "text-red-500"
                          : step.status === "commented"
                            ? "text-blue-500"
                            : "text-muted-foreground"
                    }`}
                  >
                    {narrativeLine}
                  </p>
                </div>

                {/* Status badge */}
                <Badge
                  variant="outline"
                  className={`mt-0.5 shrink-0 gap-1 text-[10px] ${visual.badgeClass}`}
                >
                  <StepIcon className="size-3" />
                  {visual.label}
                </Badge>
              </div>

              {/* Comment bubble */}
              {step.comment && (
                <div className="mt-2 flex items-start gap-1.5 rounded-md border border-blue-100 bg-blue-50/60 px-2.5 py-2 dark:border-blue-900/40 dark:bg-blue-950/20">
                  <MessageSquare className="mt-0.5 size-3 shrink-0 text-blue-400" />
                  <p className="text-foreground/80 text-[11px] leading-relaxed">
                    {step.comment}
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LeaveDetailsDialog({
  requestId,
  baseReq,
  open,
  onClose,
}: {
  requestId: string | null;
  baseReq: NormalizedRequest | null;
  open: boolean;
  onClose: () => void;
}) {
  const [detail, setDetail] = useState<NormalizedRequest | null>(null);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!open || !requestId) {
      setDetail(null);
      return;
    }

    const fetchDetail = async () => {
      setFetching(true);
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setFetching(false);
        return;
      }

      try {
        const res = await fetch(`${BASE_URL}/v1/leave-requests/${requestId}`, {
          method: "GET",
          headers: getHeaders(token),
        });
        if (!res.ok) throw new Error("Failed to fetch details");
        const data = await res.json();
        const raw: LeaveRequest =
          data?.data ?? data?.request ?? data?.leaveRequest ?? data;
        setDetail(normalizeRequest(raw));
      } catch {
        setDetail(baseReq);
      } finally {
        setFetching(false);
      }
    };

    fetchDetail();
  }, [open, requestId, baseReq]);

  const req = detail ?? baseReq;
  if (!req) return null;

  const statusInfo = statusConfig[req.status] ?? statusConfig["pending"];
  const StatusIcon = statusInfo.icon;

  const chainSummary = req.approvalChain
    .filter((s) => s.status !== "pending")
    .map((s) => {
      const verb =
        s.status === "approved"
          ? "Approved"
          : s.status === "rejected"
            ? "Rejected"
            : "Commented";
      return `${verb} by ${s.name}`;
    })
    .join(" · ");

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-md gap-0 overflow-y-auto p-0">
        {/* Header */}
        <DialogHeader className="bg-background sticky top-0 z-10 flex flex-row items-center justify-between border-b px-5 py-4">
          <DialogTitle className="text-base font-semibold">
            Leave Request Details
          </DialogTitle>
          <Button
            size="sm"
            variant="ghost"
            className="text-muted-foreground h-7 w-7 p-0"
            onClick={onClose}
          >
            <X className="size-4" />
          </Button>
        </DialogHeader>

        {fetching ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="text-muted-foreground size-5 animate-spin" />
          </div>
        ) : (
          <div className="space-y-5 px-5 py-5">
            {/* Leave info grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground mb-1 text-xs">Leave Type</p>
                <p className="text-foreground text-sm font-semibold">
                  {req.policyName}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1 text-xs">Status</p>
                <Badge
                  variant="outline"
                  className={`gap-1 text-[11px] ${statusInfo.className}`}
                >
                  <StatusIcon className="size-3" />
                  {statusInfo.label}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground mb-1 text-xs">Start Date</p>
                <p className="text-foreground text-sm font-semibold">
                  {req.startDateShort}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1 text-xs">End Date</p>
                <p className="text-foreground text-sm font-semibold">
                  {req.endDateShort}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground mb-1 text-xs">Duration</p>
                <p className="text-foreground text-sm font-semibold">
                  {req.days} day{req.days !== 1 ? "s" : ""}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1 text-xs">
                  Applied Date
                </p>
                <p className="text-foreground text-sm font-semibold">
                  {req.appliedDateShort}
                </p>
              </div>
            </div>

            <div>
              <p className="text-muted-foreground mb-1.5 text-xs">Reason</p>
              <div className="bg-muted/40 rounded-md px-3 py-2.5">
                <p className="text-foreground text-sm">{req.reason}</p>
              </div>
            </div>

            {/* Approval chain */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-foreground text-sm font-semibold">
                  Approval Chain
                </p>
                {req.approvalChain.length > 0 && (
                  <span className="text-muted-foreground text-[10px]">
                    {
                      req.approvalChain.filter((s) => s.status !== "pending")
                        .length
                    }
                    /{req.approvalChain.length} actioned
                  </span>
                )}
              </div>

              {chainSummary && (
                <div className="border-border bg-muted/30 mb-4 rounded-md border px-3 py-2">
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    {chainSummary}
                  </p>
                </div>
              )}

              <ApprovalTimeline chain={req.approvalChain} />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function LeaveRequestTable({
  refresh,
  filters,
}: {
  refresh?: number;
  filters?: RequestFilterValues;
}) {
  const [mounted, setMounted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [requests, setRequests] = useState<NormalizedRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedBase, setSelectedBase] = useState<NormalizedRequest | null>(
    null,
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const loadRequests = async () => {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("Access token not found. Please log in again.");
        setLoading(false);
        return;
      }

      let userRole: string | null = null;
      try {
        const decoded = jwtDecode<{ role: string }>(token);
        userRole = decoded?.role ?? null;
      } catch {
        userRole = null;
      }

      const adminUser = ADMIN_ROLES.includes(userRole ?? "");
      setIsAdmin(adminUser);

      const endpoint = `${BASE_URL}/v1/leave-requests/my`;

      try {
        const res = await fetch(endpoint, {
          method: "GET",
          headers: getHeaders(token),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => null);
          throw new Error(
            Array.isArray(err?.message)
              ? err.message.join(", ")
              : (err?.message ?? `Failed to fetch requests (${res.status})`),
          );
        }
        const data = await res.json();
        const raw: LeaveRequest[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.requests)
              ? data.requests
              : Array.isArray(data?.items)
                ? data.items
                : [];

        setRequests(raw.map(normalizeRequest));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, [mounted, refresh]);

  const filteredRequests = useMemo(
    () => applyRequestFilters(requests, filters),
    [requests, filters],
  );

  if (!mounted) return null;

  const openDetail = (req: NormalizedRequest) => {
    setSelectedId(req.id);
    setSelectedBase(req);
  };

  const closeDetail = () => {
    setSelectedId(null);
    setSelectedBase(null);
  };

  const renderTable = (
    rows: NormalizedRequest[],
    showApproveReject = false,
  ) => (
    <Card>
      <CardContent className="p-4">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-foreground px-5 py-3.5 text-sm font-bold">
                Leave Type
              </TableHead>
              <TableHead className="text-foreground px-5 py-3.5 text-sm font-bold">
                Duration
              </TableHead>
              <TableHead className="text-foreground px-5 py-3.5 text-sm font-bold">
                Start Date
              </TableHead>
              <TableHead className="text-foreground px-5 py-3.5 text-sm font-bold">
                End Date
              </TableHead>
              <TableHead className="text-foreground px-5 py-3.5 text-sm font-bold">
                Applied
              </TableHead>
              <TableHead className="text-foreground px-5 py-3.5 text-sm font-bold">
                Status
              </TableHead>
              <TableHead className="text-foreground px-5 py-3.5 text-right text-sm font-bold">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-muted-foreground px-5 py-12 text-center text-sm"
                >
                  No leave requests found.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((req) => {
                const statusInfo =
                  statusConfig[req.status] ?? statusConfig["pending"];
                const StatusIcon = statusInfo.icon;
                const canApprove =
                  showApproveReject && isAdmin && req.status === "pending";

                return (
                  <TableRow key={req.id}>
                    <TableCell className="px-5 py-4">
                      <Badge
                        variant="outline"
                        className={`border-0 text-[10px] ${typeColors[req.type] || "bg-muted text-muted-foreground"}`}
                      >
                        {req.type}
                      </Badge>
                    </TableCell>

                    <TableCell className="px-5 py-4">
                      <span className="text-foreground text-xs">
                        {req.days} day{req.days !== 1 ? "s" : ""}
                      </span>
                    </TableCell>

                    <TableCell className="px-5 py-4">
                      <span className="text-foreground text-xs">
                        {req.startDate}
                      </span>
                    </TableCell>

                    <TableCell className="px-5 py-4">
                      <span className="text-foreground text-xs">
                        {req.endDate}
                      </span>
                    </TableCell>

                    <TableCell className="px-5 py-4">
                      <span className="text-muted-foreground text-xs">
                        {req.submittedAt}
                      </span>
                    </TableCell>

                    <TableCell className="px-5 py-4">
                      <Badge
                        variant="outline"
                        className={`gap-1 text-[10px] ${statusInfo.className}`}
                      >
                        <StatusIcon className="size-3" />
                        {statusInfo.label}
                      </Badge>
                    </TableCell>

                    <TableCell className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {canApprove && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 border-green-500/30 px-2.5 text-xs text-[#1d9c32] hover:bg-green-500/10 hover:text-green-500"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive h-7 px-2.5 text-xs"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-muted-foreground hover:text-foreground h-7 w-7 cursor-pointer p-0"
                          title="View details"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDetail(req);
                          }}
                        >
                          <Eye className="size-4" />
                        </Button>
                        <span className="text-foreground text-xs">Details</span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <p className="text-muted-foreground py-6 text-sm">
        Loading leave requests…
      </p>
    );
  }

  if (error) {
    return <p className="text-destructive py-6 text-sm">{error}</p>;
  }

  const pending = filteredRequests.filter((r) => r.status === "pending");
  const approved = filteredRequests.filter((r) => r.status === "approved");
  const rejected = filteredRequests.filter((r) => r.status === "rejected");

  return (
    <>
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">
            All
            <Badge variant="secondary" className="ml-1.5 h-5 text-[10px]">
              {filteredRequests.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending
            <Badge
              variant="secondary"
              className="bg-warning/15 text-warning-foreground ml-1.5 h-5 text-[10px]"
            >
              {pending.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {renderTable(filteredRequests, isAdmin)}
        </TabsContent>
        <TabsContent value="pending">
          {renderTable(pending, isAdmin)}
        </TabsContent>
        <TabsContent value="approved">{renderTable(approved)}</TabsContent>
        <TabsContent value="rejected">{renderTable(rejected)}</TabsContent>
      </Tabs>

      <LeaveDetailsDialog
        requestId={selectedId}
        baseReq={selectedBase}
        open={!!selectedId}
        onClose={closeDetail}
      />
    </>
  );
}
