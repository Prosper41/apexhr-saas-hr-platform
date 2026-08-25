export type FormState = {
  name: string;
  description: string;
  type: string;
  accrual: string;
  accrualRate: string;
  maxBalance: string;
  carryOverPolicy: string;
  carryOverLimit: string;
  waitingPeriodDays: string;
  isActive: boolean;
};

export type Policy = {
  id: string;
  name: string;
  description: string;
  type: string;
  accrual: string;
  accrualRate: number;
  maxBalance: number;
  carryOverPolicy: string;
  carryOverLimit?: number;
  waitingPeriodDays?: number;
  isActive: boolean;
  employees: number;
};

export const LEAVE_TYPES = [
  "Annual",
  "Sick",
  "Personal",
  "Parental",
  "Custom",
] as const;
export const ACCRUAL_FREQUENCIES = [
  "Monthly",
  "Yearly",
  "OneTime",
  "Manual",
] as const;
export const CARRY_OVER_POLICIES = ["None", "Full", "Limited", "NA"] as const;

export const ACCRUAL_LABELS: Record<string, string> = {
  Monthly: "Monthly",
  Yearly: "Yearly",
  OneTime: "One-time",
  Manual: "Manual",
};

export const ADMIN_ROLES = ["TENANT_ADMIN", "HR_ADMIN"];

export const EMPTY_FORM: FormState = {
  name: "",
  description: "",
  type: "",
  accrual: "",
  accrualRate: "",
  maxBalance: "",
  carryOverPolicy: "None",
  carryOverLimit: "",
  waitingPeriodDays: "",
  isActive: true,
};
