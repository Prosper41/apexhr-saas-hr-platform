import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  ApprovalRequest,
  ActionModal,
  LocalComment,
  NormalizedComment,
  ACTIONABLE_STATUSES,
  STATUS_LABELS,
} from "@/models/approval.types";
import {
  decodeToken,
  fetchLeaveRequests,
  filterQueueForRole,
  normalizeToApproval,
  submitApprovalAction,
  submitComment,
  submitTeamLeadComment,
} from "@/services/approval.service";

export interface ApprovalViewModel {
  queue: ApprovalRequest[];
  selectedRequest: ApprovalRequest | null;
  allComments: NormalizedComment[];
  statusLabel: string;

  loading: boolean;
  error: string | null;
  actionLoading: boolean;
  actionError: string | null;
  commentLoading: boolean;
  tlCommentLoading: boolean;
  tlCommentError: string | null;

  comment: string;
  tlComment: string;

  actionModal: ActionModal | null;
  commentSuccessModal: boolean;

  userRole: string;
  isTeamLeadStage: boolean;
  canAct: boolean;

  setSelectedRequest: (r: ApprovalRequest | null) => void;
  setComment: (v: string) => void;
  setTlComment: (v: string) => void;
  handleAction: (action: "approve" | "reject") => Promise<void>;
  handleTeamLeadComment: () => Promise<void>;
  handleCommentSubmit: () => Promise<void>;
  handleActionModalClose: () => void;
  handleCommentSuccessModalClose: () => void;
}

export function useApprovalViewModel(): ApprovalViewModel {
  const searchParams = useSearchParams();
  const preselectedId = searchParams.get("id");

  const [selectedRequest, setSelectedRequest] =
    useState<ApprovalRequest | null>(null);
  const [queue, setQueue] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState("");
  const [mounted, setMounted] = useState(false);

  const [actionModal, setActionModal] = useState<ActionModal | null>(null);
  const [commentSuccessModal, setCommentSuccessModal] = useState(false);
  const [pendingNextRequest, setPendingNextRequest] =
    useState<ApprovalRequest | null>(null);

  const [comment, setComment] = useState("");
  const [localComments, setLocalComments] = useState<LocalComment[]>([]);
  const [commentLoading, setCommentLoading] = useState(false);

  const [tlComment, setTlComment] = useState("");
  const [tlCommentLoading, setTlCommentLoading] = useState(false);
  const [tlCommentError, setTlCommentError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setLocalComments([]);
    setActionError(null);
    setTlCommentError(null);
    setTlComment("");
  }, [selectedRequest?.rawId]);

  useEffect(() => {
    if (!mounted) return;

    const load = async () => {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("Access token not found. Please log in again.");
        setLoading(false);
        return;
      }

      const decoded = decodeToken(token);
      const resolvedRole = decoded?.role ?? "";
      const resolvedDeptId = decoded?.departmentId ?? decoded?.deptId ?? "";
      setUserRole(resolvedRole);

      try {
        const raw = await fetchLeaveRequests(token);
        const allNormalized = raw.map(normalizeToApproval);
        const myQueue = filterQueueForRole(
          allNormalized,
          resolvedRole,
          resolvedDeptId,
        );

        setQueue(myQueue);

        if (preselectedId) {
          const match = allNormalized.find((r) => r.rawId === preselectedId);
          if (match) {
            setSelectedRequest(match);
            if (!myQueue.find((r) => r.rawId === preselectedId)) {
              setQueue((prev) => [match, ...prev]);
            }
            return;
          }
        }

        if (myQueue.length > 0) setSelectedRequest(myQueue[0]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [mounted, preselectedId]);

  const isTeamLeadStage =
    userRole === "TEAM_LEAD" &&
    ACTIONABLE_STATUSES.includes(
      selectedRequest?.status as (typeof ACTIONABLE_STATUSES)[number],
    ) &&
    selectedRequest?.currentStage === "team_lead";

  const canAct = (() => {
    if (!selectedRequest) return false;
    if (
      !ACTIONABLE_STATUSES.includes(
        selectedRequest.status as (typeof ACTIONABLE_STATUSES)[number],
      )
    )
      return false;
    const stage = selectedRequest.currentStage;
    if (userRole === "DEPT_HEAD") return stage === "dept_head";
    if (userRole === "HR_ADMIN" || userRole === "TENANT_ADMIN")
      return stage === "hr";
    return false;
  })();

  const handleTeamLeadComment = async () => {
    if (!selectedRequest || !tlComment.trim()) return;
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    setTlCommentLoading(true);
    setTlCommentError(null);

    try {
      await submitTeamLeadComment(selectedRequest.rawId, tlComment, token);
      const updatedQueue = queue.filter(
        (r) => r.rawId !== selectedRequest.rawId,
      );
      setQueue(updatedQueue);
      setTlComment("");
      setPendingNextRequest(updatedQueue.length > 0 ? updatedQueue[0] : null);
      setCommentSuccessModal(true);
    } catch (err) {
      setTlCommentError(
        err instanceof Error ? err.message : "Something went wrong",
      );
    } finally {
      setTlCommentLoading(false);
    }
  };

  const handleCommentSuccessModalClose = () => {
    setCommentSuccessModal(false);
    setSelectedRequest(pendingNextRequest);
    setPendingNextRequest(null);
  };

  const handleAction = async (action: "approve" | "reject") => {
    if (!selectedRequest) return;
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    setActionLoading(true);
    setActionError(null);

    try {
      await submitApprovalAction(
        selectedRequest.rawId,
        action,
        userRole,
        token,
      );

      if (action === "approve") {
        window.dispatchEvent(new Event("leave:approved"));
      }

      setActionModal({
        type: action,
        employeeName: selectedRequest.employee,
        leaveDays: selectedRequest.days,
        leaveType: selectedRequest.type,
      });

      const updated = queue.filter((r) => r.rawId !== selectedRequest.rawId);
      setQueue(updated);
      setSelectedRequest(updated.length > 0 ? updated[0] : null);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Something went wrong",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleCommentSubmit = async () => {
    if (!selectedRequest || !comment.trim()) return;
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    setCommentLoading(true);
    try {
      const newComment = await submitComment(
        selectedRequest.rawId,
        comment,
        token,
      );
      setLocalComments((prev) => [
        {
          id: newComment.id ?? crypto.randomUUID(),
          text: comment,
          author: "You",
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
      setComment("");
    } catch (err) {
      console.error(err);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleActionModalClose = () => setActionModal(null);

  const allComments: NormalizedComment[] = [
    ...localComments,
    ...(selectedRequest?.existingComments ?? []).map((c) => {
      const authorObj =
        typeof c.author === "object" && c.author !== null ? c.author : null;
      const authorName = authorObj
        ? `${authorObj.firstName ?? ""} ${authorObj.lastName ?? ""}`.trim()
        : typeof c.author === "string"
          ? c.author
          : "Unknown";
      return {
        id: c.id ?? crypto.randomUUID(),
        text: c.comment ?? c.text ?? "",
        author: authorName,
        createdAt: c.createdAt ?? "",
      };
    }),
  ];

  const statusLabel =
    STATUS_LABELS[selectedRequest?.status ?? ""] ??
    (selectedRequest?.status
      ? selectedRequest.status.charAt(0).toUpperCase() +
        selectedRequest.status.slice(1)
      : "");

  return {
    queue,
    selectedRequest,
    allComments,
    statusLabel,

    loading,
    error,
    actionLoading,
    actionError,
    commentLoading,
    tlCommentLoading,
    tlCommentError,

    comment,
    tlComment,

    actionModal,
    commentSuccessModal,

    userRole,
    isTeamLeadStage,
    canAct,

    setSelectedRequest,
    setComment,
    setTlComment,
    handleAction,
    handleTeamLeadComment,
    handleCommentSubmit,
    handleActionModalClose,
    handleCommentSuccessModalClose,
  };
}
