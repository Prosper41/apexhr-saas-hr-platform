export interface ApprovalStage {
  status: "pending" | "approved" | "rejected" | "commented";
  approvedAt?: string | null;
  approvedBy?: { id?: string; firstName?: string; lastName?: string } | null;
}

export interface LeaveRequest {
  id: string;
  startDate: string;
  endDate: string;
  totalDays?: number;
  days?: number;
  status: string;
  reason?: string;
  createdAt?: string;
  currentStage?: "team_lead" | "dept_head" | "hr" | null;
  teamLeadApproval?: ApprovalStage;
  deptHeadApproval?: ApprovalStage;
  hrApproval?: ApprovalStage;
  user?: { firstName?: string; lastName?: string; role?: string };
  leavePolicy?: { type?: string; name?: string };
  department?: { id?: string; name?: string };
  comments?: CommentItem[];
}

export interface CommentItem {
  id?: string;
  comment?: string;
  text?: string;
  createdAt?: string;
  author?:
    | { id?: string; firstName?: string; lastName?: string; role?: string }
    | string;
}

export interface WorkflowStep {
  step: string;
  label: string;
  status: "completed" | "current" | "pending" | "rejected" | "commented";
  approvedBy?: string;
  approvedAt?: string;
}

export interface ApprovalRequest {
  rawId: string;
  id: string;
  employee: string;
  avatar: string;
  role: string;
  department: string;
  departmentId: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  submittedAt: string;
  status: string;
  currentStage: "team_lead" | "dept_head" | "hr" | null;
  workflow: WorkflowStep[];
  conflict: boolean;
  conflictDetails?: string;
  existingComments: CommentItem[];
}

export type ModalType = "approve" | "reject" | null;

export interface ActionModal {
  type: ModalType;
  employeeName: string;
  leaveDays: number;
  leaveType: string;
}

export interface LocalComment {
  id: string;
  text: string;
  createdAt: string;
  author: string;
}

export interface NormalizedComment {
  id: string;
  text: string;
  author: string;
  createdAt: string;
}

export const ACTIONABLE_STATUSES = [
  "pending",
  "team_lead_commented",
  "dept_approved",
] as const;

export const STAGE_LABELS: Record<string, string> = {
  team_lead: "Team Lead",
  dept_head: "Dept Head",
  hr: "HR Admin",
};

export const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  team_lead_commented: "In Review",
  dept_approved: "Dept Approved",
  approved: "Approved",
  rejected: "Rejected",
};

export const STEP_STATUS_STYLES: Record<string, string> = {
  completed: "bg-success text-success-foreground",
  commented: "bg-blue-500 text-white",
  current: "bg-primary text-primary-foreground ring-2 ring-primary/30",
  pending: "bg-muted text-muted-foreground",
  rejected: "bg-destructive text-destructive-foreground",
};

export const TYPE_COLORS: Record<string, string> = {
  Annual: "bg-blue-500/10 text-blue-600",
  Sick: "bg-red-500/10 text-red-600",
  Personal: "bg-purple-500/10 text-purple-600",
  Custom: "bg-chart-4/10 text-chart-4",
};
