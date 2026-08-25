export type LeaveType = "Annual" | "Sick" | "Personal" | "Unpaid" | "Parental";

export type AvatarColor = "blue" | "teal" | "coral" | "purple" | "amber";

export type EmployeeRole = "Employee" | "Team Lead" | "Department Head" | "HR";

export interface LeaveRequestEmployeeDto {
  id: string;
  firstName: string;
  lastName: string;
  initials?: string;
  role?: string;
  position?: string;
  jobTitle?: string;
  title?: string;
  isHR?: boolean;
  isDepartmentHead?: boolean;
  isTeamLead?: boolean;
}

export interface LeaveRequestDepartmentDto {
  id: string;
  name: string;
}

export interface LeaveRequestDto {
  id: string;
  employee?: LeaveRequestEmployeeDto;
  department?: LeaveRequestDepartmentDto | string;
  leaveType: string;
  leaveName?: string;
  startDate: string;
  endDate: string;
  totalDays?: number;
  isHalfDay?: boolean;
  status?: string;
}

export interface BirthdayDto {
  employeeId?: string;
  employeeName?: string;
  employee?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    role?: string;
    position?: string;
    jobTitle?: string;
    title?: string;
    isHR?: boolean;
    isDepartmentHead?: boolean;
    isTeamLead?: boolean;
  };
  role?: string;
  department?: { id?: string; name?: string } | string;
  dateOfBirth: string;
}

export interface PublicHolidayDto {
  id?: string;
  name: string;
  date: string;
}

export interface LeaveEntry {
  start: number;
  end: number;
  type: LeaveType;
  status?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: EmployeeRole;
  avatar: string;
  avatarColor: AvatarColor;
  department: string;
  birthday?: { day: number; month: number };
}

export interface GhanaHoliday {
  name: string;
  month: number;
  day: number;
  short: string;
}
