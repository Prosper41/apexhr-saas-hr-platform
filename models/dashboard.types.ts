export interface DashboardStats {
  pendingRequests: number;
  pendingRequestsChange: number;
  approvedMTD: number;
  approvedRate: number;
  outToday: number;
  totalEmployees: number;
  conflicts: number;
}

export interface RequestTrendPoint {
  month: string;
  approved: number;
  rejected: number;
}

export interface DepartmentAbsence {
  dept: string;
  count: number;
}

export interface UpcomingAbsence {
  id: string | number;
  name: string;
  dates: string;
  department: string;
  type: string;
  avatar?: string;
}

export interface PendingApproval {
  id: string | number;
  name: string;
  role: string;
  department: string;
  dates: string;
  days: number;
  type: string;
  avatar?: string;
}
