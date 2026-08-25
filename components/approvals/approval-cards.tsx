"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Clock,
  Check,
  X,
  MessageSquare,
  Calendar,
  Building2,
  User,
  Loader2,
  CheckCircle2,
  XCircle,
  PartyPopper,
  ShieldX,
  HelpCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  ActionModal,
  STAGE_LABELS,
  STEP_STATUS_STYLES,
  TYPE_COLORS,
} from "@/models/approval.types";
import { useApprovalViewModel } from "@/viewmodels/useApprovalViewModel";

const MODAL_STYLES = `
  @keyframes modalPop {
    from { opacity: 0; transform: scale(0.85) translateY(16px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes iconBounce {
    from { opacity: 0; transform: scale(0.4); }
    to   { opacity: 1; transform: scale(1); }
  }
`;

interface ActionResultModalProps {
  modal: ActionModal;
  onClose: () => void;
}

interface ConfirmActionModalProps {
  type: "approve" | "reject";
  employeeName: string;
  leaveDays: number;
  leaveType: string;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmActionModal({
  type,
  employeeName,
  leaveDays,
  leaveType,
  loading,
  onConfirm,
  onCancel,
}: ConfirmActionModalProps) {
  const isApprove = type === "approve";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(4px)",
      }}
      onClick={loading ? undefined : onCancel}
    >
      <div
        className="bg-background relative w-full max-w-sm overflow-hidden rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: "modalPop 0.28s cubic-bezier(0.34,1.56,0.64,1) both",
        }}
      >
        <div
          className={`h-1.5 w-full ${isApprove ? "bg-gradient-to-r from-emerald-400 to-green-500" : "bg-gradient-to-r from-red-400 to-rose-500"}`}
        />
        <div className="flex flex-col items-center gap-4 px-8 py-8 text-center">
          <div
            className={`flex size-20 items-center justify-center rounded-full ${
              isApprove
                ? "bg-emerald-50 dark:bg-emerald-950/40"
                : "bg-red-50 dark:bg-red-950/40"
            }`}
          >
            <HelpCircle
              className={`size-9 ${isApprove ? "text-emerald-500" : "text-red-500"}`}
              strokeWidth={1.5}
            />
          </div>
          <div className="space-y-1">
            <h3 className="text-foreground text-xl font-bold tracking-tight">
              {isApprove ? "Approve this request?" : "Reject this request?"}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {isApprove
                ? `You're about to approve ${employeeName}'s ${leaveDays}-day ${leaveType} leave request.`
                : `You're about to reject ${employeeName}'s ${leaveDays}-day ${leaveType} leave request. This action cannot be undone.`}
            </p>
          </div>
          <div className="mt-2 flex w-full items-center gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              className={`flex-1 font-semibold ${
                isApprove
                  ? "bg-emerald-500 text-white hover:bg-emerald-600"
                  : "bg-red-500 text-white hover:bg-red-600"
              }`}
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : isApprove ? (
                "Yes, Approve"
              ) : (
                "Yes, Reject"
              )}
            </Button>
          </div>
        </div>
      </div>
      <style>{MODAL_STYLES}</style>
    </div>
  );
}

interface ConfirmCommentModalProps {
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmCommentModal({
  loading,
  onConfirm,
  onCancel,
}: ConfirmCommentModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(4px)",
      }}
      onClick={loading ? undefined : onCancel}
    >
      <div
        className="bg-background relative w-full max-w-sm overflow-hidden rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: "modalPop 0.28s cubic-bezier(0.34,1.56,0.64,1) both",
        }}
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-green-400 to-green-600" />
        <div className="flex flex-col items-center gap-4 px-8 py-8 text-center">
          <div className="flex size-20 items-center justify-center rounded-full bg-green-50 dark:bg-green-950/40">
            <HelpCircle className="size-9 text-green-500" strokeWidth={1.5} />
          </div>
          <div className="space-y-1">
            <h3 className="text-foreground text-xl font-bold tracking-tight">
              Submit this comment?
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              This will forward the request to the Department Head for review.
              You won&apos;t be able to edit your comment afterward.
            </p>
          </div>
          <div className="mt-2 flex w-full items-center gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-green-600 font-semibold text-white hover:bg-green-700"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Yes, Submit"
              )}
            </Button>
          </div>
        </div>
      </div>
      <style>{MODAL_STYLES}</style>
    </div>
  );
}

function ActionResultModal({ modal, onClose }: ActionResultModalProps) {
  const isApproved = modal.type === "approve";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        className="bg-background relative w-full max-w-sm overflow-hidden rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: "modalPop 0.28s cubic-bezier(0.34,1.56,0.64,1) both",
        }}
      >
        <div
          className={`h-1.5 w-full ${isApproved ? "bg-gradient-to-r from-emerald-400 to-green-500" : "bg-gradient-to-r from-red-400 to-rose-500"}`}
        />
        <div className="flex flex-col items-center gap-4 px-8 py-8 text-center">
          <div
            className={`flex size-20 items-center justify-center rounded-full ${
              isApproved
                ? "bg-emerald-50 dark:bg-emerald-950/40"
                : "bg-red-50 dark:bg-red-950/40"
            }`}
            style={{
              animation:
                "iconBounce 0.5s 0.15s cubic-bezier(0.34,1.56,0.64,1) both",
            }}
          >
            {isApproved ? (
              <PartyPopper
                className="size-9 text-emerald-500"
                strokeWidth={1.5}
              />
            ) : (
              <ShieldX className="size-9 text-red-500" strokeWidth={1.5} />
            )}
          </div>
          <div className="space-y-1">
            <h3 className="text-foreground text-xl font-bold tracking-tight">
              {isApproved ? "Leave Approved!" : "Leave Rejected"}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {isApproved
                ? `You've approved ${modal.employeeName}'s ${modal.leaveDays}-day ${modal.leaveType} leave request.`
                : `You've rejected ${modal.employeeName}'s ${modal.leaveDays}-day ${modal.leaveType} leave request.`}
            </p>
          </div>
          <div
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold ${
              isApproved
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
            }`}
          >
            {isApproved ? (
              <>
                <CheckCircle2 className="size-3.5" />
                Action Completed
              </>
            ) : (
              <>
                <XCircle className="size-3.5" />
                Request Declined
              </>
            )}
          </div>
          <Button
            className={`mt-2 w-full font-semibold ${
              isApproved
                ? "bg-emerald-500 text-white hover:bg-emerald-600"
                : "bg-red-500 text-white hover:bg-red-600"
            }`}
            onClick={onClose}
          >
            Done
          </Button>
        </div>
      </div>
      <style>{MODAL_STYLES}</style>
    </div>
  );
}

function CommentSuccessModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        className="bg-background relative w-full max-w-sm overflow-hidden rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: "modalPop 0.28s cubic-bezier(0.34,1.56,0.64,1) both",
        }}
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-green-400 to-green-600" />
        <div className="flex flex-col items-center gap-4 px-8 py-8 text-center">
          <div
            className="flex size-20 items-center justify-center rounded-full bg-green-50 dark:bg-green-950/40"
            style={{
              animation:
                "iconBounce 0.5s 0.15s cubic-bezier(0.34,1.56,0.64,1) both",
            }}
          >
            <MessageSquare
              className="size-9 text-green-500"
              strokeWidth={1.5}
            />
          </div>
          <div className="space-y-1">
            <h3 className="text-foreground text-xl font-bold tracking-tight">
              Comment Submitted!
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Your comment on this leave request was successful. The request has
              been forwarded to the Department Head for review.
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-4 py-1.5 text-xs font-semibold text-green-700 dark:bg-green-900/40 dark:text-green-400">
            <CheckCircle2 className="size-3.5" />
            Forwarded to Dept Head
          </div>
          <Button
            className="mt-2 w-full bg-green-600 font-semibold text-white hover:bg-green-700"
            onClick={onClose}
          >
            Done
          </Button>
        </div>
      </div>
      <style>{MODAL_STYLES}</style>
    </div>
  );
}

export default function ApprovalsPage() {
  const vm = useApprovalViewModel();

  const [pendingAction, setPendingAction] = useState<
    "approve" | "reject" | null
  >(null);
  const [pendingComment, setPendingComment] = useState(false);

  const statusLabel = vm.statusLabel;

  const requestAction = (type: "approve" | "reject") => {
    setPendingAction(type);
  };

  const cancelPendingAction = () => {
    if (vm.actionLoading) return;
    setPendingAction(null);
  };

  const confirmPendingAction = async () => {
    if (!pendingAction) return;
    await vm.handleAction(pendingAction);
    setPendingAction(null);
  };

  const requestComment = () => {
    setPendingComment(true);
  };

  const cancelPendingComment = () => {
    if (vm.tlCommentLoading) return;
    setPendingComment(false);
  };

  const confirmPendingComment = async () => {
    await vm.handleTeamLeadComment();
    setPendingComment(false);
  };

  return (
    <>
      {pendingAction && vm.selectedRequest && (
        <ConfirmActionModal
          type={pendingAction}
          employeeName={vm.selectedRequest.employee}
          leaveDays={vm.selectedRequest.days}
          leaveType={vm.selectedRequest.type}
          loading={vm.actionLoading}
          onConfirm={confirmPendingAction}
          onCancel={cancelPendingAction}
        />
      )}
      {pendingComment && (
        <ConfirmCommentModal
          loading={vm.tlCommentLoading}
          onConfirm={confirmPendingComment}
          onCancel={cancelPendingComment}
        />
      )}
      {vm.actionModal && (
        <ActionResultModal
          modal={vm.actionModal}
          onClose={vm.handleActionModalClose}
        />
      )}
      {vm.commentSuccessModal && (
        <CommentSuccessModal onClose={vm.handleCommentSuccessModalClose} />
      )}

      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-foreground text-lg font-semibold">Approvals</h2>
          <p className="text-muted-foreground text-sm">
            Review and action pending leave requests
          </p>
        </div>

        {/* Summary cards */}
        <div className="mt-5 grid grid-cols-3 gap-4">
          <Card className="p-5 text-center">
            <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-xl bg-[#eab308]/30">
              <Clock className="h-4 w-4 text-[#d97706]" />
            </div>
            <p className="text-foreground text-2xl font-semibold">
              {vm.queue.length}
            </p>
            <p className="text-muted-foreground text-sm">
              Awaiting your review
            </p>
          </Card>
          <Card className="p-5 text-center">
            <div className="bg-destructive/10 mx-auto mb-2 flex size-10 items-center justify-center rounded-xl">
              <AlertTriangle className="text-destructive h-4 w-4" />
            </div>
            <p className="text-foreground text-2xl font-semibold">
              {vm.queue.filter((r) => r.conflict).length}
            </p>
            <p className="text-muted-foreground text-sm">Conflict Warnings</p>
          </Card>
          <Card className="p-5 text-center">
            <div className="bg-primary/10 mx-auto mb-2 flex size-10 items-center justify-center rounded-xl">
              <Clock className="text-primary h-4 w-4" />
            </div>
            <p className="text-foreground text-2xl font-semibold">—</p>
            <p className="text-muted-foreground text-sm">Avg Response Time</p>
          </Card>
        </div>

        {vm.loading && (
          <div className="text-muted-foreground flex items-center justify-center gap-2 py-10 text-sm">
            <Loader2 className="size-4 animate-spin" />
            Loading requests...
          </div>
        )}

        {!vm.loading && vm.error && (
          <p className="text-destructive text-sm">{vm.error}</p>
        )}

        {!vm.loading && !vm.error && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-5 lg:items-start">
            {/* Queue list */}
            <div className="flex flex-col gap-2 lg:col-span-2">
              <h3 className="text-muted-foreground mb-1 px-1 text-sm font-medium">
                Queue ({vm.queue.length})
              </h3>
              {vm.queue.length === 0 && (
                <p className="text-muted-foreground px-1 text-sm">
                  No pending requests.
                </p>
              )}
              {vm.queue.map((req) => (
                <Card
                  key={req.rawId}
                  className={`hover:border-primary/30 cursor-pointer transition-all ${
                    vm.selectedRequest?.rawId === req.rawId
                      ? "border-primary ring-primary/20 ring-1"
                      : ""
                  }`}
                  onClick={() => vm.setSelectedRequest(req)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="mt-0.5 size-9">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {req.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-foreground text-sm font-semibold">
                            {req.employee}
                          </p>
                          {req.conflict && (
                            <AlertTriangle className="text-destructive size-4" />
                          )}
                        </div>
                        <p className="text-muted-foreground text-xs">
                          {req.role}
                        </p>
                        {req.department !== "—" && (
                          <p className="text-muted-foreground text-xs">
                            {req.department}
                          </p>
                        )}
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <Badge
                            variant="outline"
                            className="px-1.5 py-0 text-[10px]"
                          >
                            {req.type}
                          </Badge>
                          <span className="text-muted-foreground text-xs">
                            {req.days} day{req.days > 1 ? "s" : ""}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {req.startDate}
                          </span>
                          {req.currentStage && (
                            <Badge
                              variant="outline"
                              className="bg-muted text-muted-foreground border-0 px-1.5 py-0 text-[10px]"
                            >
                              {STAGE_LABELS[req.currentStage]}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Detail panel */}
            <Card className="sticky top-4 flex max-h-[calc(100vh-8rem)] flex-col overflow-y-auto bg-[#f3f5fa] lg:col-span-3">
              {vm.selectedRequest ? (
                <>
                  <CardHeader className="border-b pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-11">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                            {vm.selectedRequest.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-foreground font-semibold">
                            {vm.selectedRequest.employee}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {vm.selectedRequest.role}
                          </p>
                          {vm.selectedRequest.department !== "—" && (
                            <p className="text-muted-foreground text-xs">
                              {vm.selectedRequest.department}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-muted-foreground text-xs">
                          {vm.selectedRequest.id}
                        </span>
                        <Badge
                          variant="outline"
                          className={`border-0 text-[10px] ${
                            vm.selectedRequest.status === "approved" ||
                            vm.selectedRequest.status === "dept_approved"
                              ? "bg-success/15 text-success"
                              : vm.selectedRequest.status === "rejected"
                                ? "bg-destructive/15 text-destructive"
                                : "bg-warning/15 text-warning-foreground"
                          }`}
                        >
                          {vm.selectedRequest.status === "approved" ||
                          vm.selectedRequest.status === "dept_approved" ? (
                            <CheckCircle2 className="mr-1 size-3" />
                          ) : vm.selectedRequest.status === "rejected" ? (
                            <XCircle className="mr-1 size-3" />
                          ) : (
                            <Clock className="mr-1 size-3" />
                          )}
                          {statusLabel}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="flex flex-1 flex-col gap-6 pt-5">
                    {vm.selectedRequest.conflict && (
                      <div className="bg-destructive/10 border-destructive/20 flex items-start gap-2 rounded-lg border px-3 py-2.5">
                        <AlertTriangle className="text-destructive mt-0.5 size-4 shrink-0" />
                        <p className="text-destructive text-xs">
                          {vm.selectedRequest.conflictDetails}
                        </p>
                      </div>
                    )}

                    {/* Date / duration / type grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        {
                          icon: Calendar,
                          label: "Start Date",
                          value: vm.selectedRequest.startDate,
                        },
                        {
                          icon: Calendar,
                          label: "End Date",
                          value: vm.selectedRequest.endDate,
                        },
                        {
                          icon: Building2,
                          label: "Duration",
                          value: `${vm.selectedRequest.days} day${vm.selectedRequest.days > 1 ? "s" : ""}`,
                        },
                      ].map(({ icon: Icon, label, value }) => (
                        <div key={label} className="flex items-center gap-2">
                          <div className="bg-muted flex size-8 items-center justify-center rounded-lg">
                            <Icon className="text-muted-foreground size-4" />
                          </div>
                          <div>
                            <p className="text-muted-foreground text-[11px]">
                              {label}
                            </p>
                            <p className="text-foreground text-sm font-medium">
                              {value}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div className="flex items-center gap-2">
                        <div className="bg-muted flex size-8 items-center justify-center rounded-lg">
                          <User className="text-muted-foreground size-4" />
                        </div>
                        <div>
                          <p className="text-muted-foreground text-[11px]">
                            Leave Type
                          </p>
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              TYPE_COLORS[vm.selectedRequest.type] ??
                              "bg-muted text-muted-foreground"
                            }`}
                          >
                            {vm.selectedRequest.type}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Reason */}
                    <div className="rounded-xl border-2 p-4">
                      <p className="mb-4 border-b pb-2 text-sm font-bold tracking-wide uppercase">
                        Reason
                      </p>
                      <p className="text-foreground bg-muted/40 rounded-lg px-3 py-2.5 text-sm leading-relaxed">
                        {vm.selectedRequest.reason}
                      </p>
                    </div>

                    {/* Approval workflow */}
                    <div className="rounded-xl border-2 p-4">
                      <p className="text-muted-foreground mb-4 text-xs font-medium">
                        Approval Workflow
                      </p>
                      <div className="flex items-start gap-1">
                        {vm.selectedRequest.workflow.map((step, i) => (
                          <div
                            key={i}
                            className="flex flex-1 items-start gap-1"
                          >
                            <div className="flex flex-1 flex-col items-center">
                              <div
                                className={`flex size-8 items-center justify-center rounded-full text-[10px] font-semibold transition-all ${STEP_STATUS_STYLES[step.status]}`}
                              >
                                {step.status === "completed" ? (
                                  <Check className="size-3.5" />
                                ) : step.status === "commented" ? (
                                  <MessageSquare className="size-3.5" />
                                ) : step.status === "rejected" ? (
                                  <X className="size-3.5" />
                                ) : step.status === "current" ? (
                                  <Clock className="size-3.5" />
                                ) : (
                                  <span>{i + 1}</span>
                                )}
                              </div>
                              <p className="text-muted-foreground mt-1.5 text-center text-[10px] font-medium">
                                {step.label}
                              </p>
                              {i === 0 && (
                                <p className="text-muted-foreground text-center text-[9px]">
                                  (Comment)
                                </p>
                              )}
                              {i > 0 && (
                                <p className="text-muted-foreground text-center text-[9px]">
                                  (Approve/Reject)
                                </p>
                              )}
                              {step.approvedBy && (
                                <p className="text-foreground w-full truncate px-1 text-center text-[10px]">
                                  {step.approvedBy}
                                </p>
                              )}
                              {step.approvedAt && (
                                <p className="text-muted-foreground text-[9px]">
                                  {step.approvedAt}
                                </p>
                              )}
                              {step.status === "current" && (
                                <p className="text-primary mt-0.5 text-[9px] font-medium">
                                  Awaiting
                                </p>
                              )}
                            </div>
                            {i < vm.selectedRequest!.workflow.length - 1 && (
                              <div
                                className={`mt-4 h-px flex-1 transition-colors ${
                                  step.status === "completed" ||
                                  step.status === "commented"
                                    ? "bg-success"
                                    : step.status === "rejected"
                                      ? "bg-destructive"
                                      : "bg-border"
                                }`}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Comments */}
                    <div className="space-y-3 border-t pt-5">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="text-muted-foreground size-4" />
                        <h4 className="text-sm font-medium">
                          Comments
                          {vm.allComments.length > 0 && (
                            <span className="text-muted-foreground ml-1 text-xs">
                              ({vm.allComments.length})
                            </span>
                          )}
                        </h4>
                      </div>
                      {vm.allComments.length > 0 && (
                        <div className="space-y-2 border-t pt-3">
                          {vm.allComments.map((item) => (
                            <div
                              key={item.id}
                              className="bg-muted/30 rounded-lg border p-3"
                            >
                              <div className="mb-1 flex items-center justify-between">
                                <span className="text-sm font-medium">
                                  {item.author}
                                </span>
                                {item.createdAt && (
                                  <span className="text-muted-foreground text-xs">
                                    {new Date(item.createdAt).toLocaleString()}
                                  </span>
                                )}
                              </div>
                              <p className="text-foreground text-sm">
                                {item.text}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {vm.actionError && (
                      <p className="text-destructive text-sm">
                        {vm.actionError}
                      </p>
                    )}

                    {/* Action footer */}
                    <div className="mt-auto flex flex-col gap-3 border-t pt-4">
                      {vm.isTeamLeadStage && (
                        <div className="rounded-xl border-2 border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900 dark:bg-blue-950/20">
                          <p className="mb-2 text-sm font-semibold text-blue-700 dark:text-blue-400">
                            Your Review Comment
                          </p>
                          <p className="mb-3 text-xs text-blue-600 dark:text-blue-500">
                            As Team Lead, you must submit a comment to forward
                            this request to the Department Head.
                          </p>
                          <textarea
                            value={vm.tlComment}
                            onChange={(e) => vm.setTlComment(e.target.value)}
                            placeholder="Write your review comment here..."
                            rows={3}
                            className="bg-background w-full resize-none rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          {vm.tlCommentError && (
                            <p className="text-destructive mt-1 text-xs">
                              {vm.tlCommentError}
                            </p>
                          )}
                          <div className="mt-2 flex justify-end">
                            <Button
                              size="sm"
                              onClick={requestComment}
                              disabled={
                                !vm.tlComment.trim() || vm.tlCommentLoading
                              }
                              className="bg-blue-600 text-white hover:bg-blue-700"
                            >
                              {vm.tlCommentLoading ? (
                                <Loader2 className="mr-2 size-4 animate-spin" />
                              ) : (
                                <MessageSquare className="mr-2 size-4" />
                              )}
                              Submit & Forward to Dept Head
                            </Button>
                          </div>
                        </div>
                      )}

                      {vm.canAct && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive bg-destructive/30 border-destructive/30 hover:bg-destructive/10 h-12 flex-1 gap-2 px-6 text-base"
                            onClick={() => requestAction("reject")}
                            disabled={vm.actionLoading}
                          >
                            {vm.actionLoading && pendingAction === "reject" ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              <X className="size-3.5" />
                            )}
                            Reject
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-12 flex-1 gap-2 border-green-600 px-6 text-base text-green-600 hover:bg-green-100"
                            onClick={() => requestAction("approve")}
                            disabled={vm.actionLoading}
                          >
                            {vm.actionLoading && pendingAction === "approve" ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              <Check className="size-3.5" />
                            )}
                            Approve
                          </Button>
                        </div>
                      )}

                      {!vm.isTeamLeadStage && !vm.canAct && (
                        <p className="text-muted-foreground text-xs">
                          {![
                            "pending",
                            "team_lead_commented",
                            "dept_approved",
                          ].includes(vm.selectedRequest.status)
                            ? `This request has been ${statusLabel.toLowerCase()}`
                            : vm.selectedRequest.currentStage
                              ? `Waiting for ${STAGE_LABELS[vm.selectedRequest.currentStage]} to review`
                              : "No action required from you at this stage"}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
                  <div className="bg-muted mb-3 flex size-12 items-center justify-center rounded-xl">
                    <Clock className="text-muted-foreground size-5" />
                  </div>
                  <p className="text-foreground text-sm font-medium">
                    No request selected
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Click a request from the queue to review it
                  </p>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
