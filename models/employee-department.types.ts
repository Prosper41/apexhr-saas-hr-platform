export type Employee = {
  id: string;
  name: string;
  avatar: string;
  email: string;
  contact: string;
  role: string;
  department: string;
  departmentId: string;
  location: string;
  status: string;
  dateofbirth: string;
};

export type AddEmployeeFormState = {
  firstName: string;
  lastName: string;
  contact: string;
  departmentId: string;
  role: string;
  houseAddress: string;
  dateOfBirth: string;
  workEmail: string;
};

export const EMPTY_EMPLOYEE_FORM: AddEmployeeFormState = {
  firstName: "",
  lastName: "",
  contact: "",
  departmentId: "",
  role: "",
  houseAddress: "",
  dateOfBirth: "",
  workEmail: "",
};

export type EditEmployeeFormState = {
  firstName: string;
  lastName: string;
  contact: string;
  departmentId: string;
  role: string;
  houseAddress: string;
  dateOfBirth: string;
};

export type Department = {
  id: string;
  name: string;
};

export type CreateDepartmentFormState = {
  name: string;
  description: string;
};

export const EMPTY_DEPARTMENT_FORM: CreateDepartmentFormState = {
  name: "",
  description: "",
};

export type ApiUser = {
  id?: string;
  _id?: string;
  userId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  contact?: string;
  role?: string;
  department?: { id?: string; _id?: string; name?: string };
  departmentName?: string;
  houseAddress?: string;
  address?: string;
  status?: string;
  dateOfBirth?: string;
  dateofbirth?: string;
};

export type ApiDepartment = {
  id?: string;
  _id?: string;
  name?: string;
};

export const ROLES = [
  { id: "EMPLOYEE", name: "Employee" },
  { id: "TEAM_LEAD", name: "Team Lead" },
  { id: "DEPT_HEAD", name: "Department Head" },
  { id: "HR_ADMIN", name: "HR Admin" },
  { id: "TENANT_ADMIN", name: "Tenant Admin" },
] as const;

export const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "on-leave", label: "On Leave" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
] as const;

export const EDITABLE_STATUS_OPTIONS = [
  { value: "on-leave", label: "On Leave" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
] as const;

export const STATUS_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  active: {
    label: "Active",
    className: "bg-success/15 text-success border-0",
  },
  "on-leave": {
    label: "On Leave",
    className: "bg-warning/15 text-warning-foreground border-0",
  },
  inactive: {
    label: "Inactive",
    className: "bg-muted text-muted-foreground border-0",
  },
};

export const DELETE_PERMITTED_ROLES = ["HR_ADMIN", "TENANT_ADMIN"] as const;

export function hasDeletePermission(role: string | null | undefined): boolean {
  if (!role) {
    return false;
  }
  return (DELETE_PERMITTED_ROLES as readonly string[]).includes(role);
}
