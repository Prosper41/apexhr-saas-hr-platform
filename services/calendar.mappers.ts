import type {
  AvatarColor,
  BirthdayDto,
  EmployeeRole,
  GhanaHoliday,
  LeaveEntry,
  LeaveRequestDto,
  LeaveType,
  PublicHolidayDto,
  TeamMember,
} from "@/models/calendar.types";

const AVATAR_COLORS: AvatarColor[] = [
  "blue",
  "teal",
  "coral",
  "purple",
  "amber",
];

const LEAVE_TYPE_MAP: Record<string, LeaveType> = {
  ANNUAL: "Annual",
  SICK: "Sick",
  PERSONAL: "Personal",
  UNPAID: "Unpaid",
  PARENTAL: "Parental",
};

const HOLIDAY_SHORT_NAME_OVERRIDES: Record<string, string> = {
  "New Year's Day": "New Year",
  "Independence Day": "Independence",
  "Easter Monday": "Easter Mon",
  "Workers' Day": "Workers' Day",
  "Republic Day": "Republic Day",
  "Founder's Day": "Founder's Day",
  "Farmer's Day": "Farmer's Day",
  "Christmas Day": "Christmas",
  "Boxing Day": "Boxing Day",
  "Constitution Day": "Constitution",
};

const ROLE_MAP: Record<string, EmployeeRole> = {
  EMPLOYEE: "Employee",
  STAFF: "Employee",
  MEMBER: "Employee",

  "TEAM LEAD": "Team Lead",
  TEAM_LEAD: "Team Lead",
  TEAMLEAD: "Team Lead",
  LEAD: "Team Lead",
  "TEAM LEADER": "Team Lead",
  TEAM_LEADER: "Team Lead",

  "DEPARTMENT HEAD": "Department Head",
  DEPARTMENT_HEAD: "Department Head",
  DEPT_HEAD: "Department Head",
  "DEPT HEAD": "Department Head",
  HOD: "Department Head",
  "HEAD OF DEPARTMENT": "Department Head",
  MANAGER: "Department Head",

  HR: "HR",
  "HUMAN RESOURCES": "HR",
  HUMAN_RESOURCES: "HR",
  HR_ADMIN: "HR",
  "HR ADMIN": "HR",
};

function normalizeRole(raw: unknown): EmployeeRole | null {
  if (typeof raw !== "string") return null;
  const key = raw.trim().toUpperCase();
  return ROLE_MAP[key] ?? null;
}

function normalizeLeaveType(raw: string | undefined | null): LeaveType {
  if (!raw) return "Unpaid";
  return LEAVE_TYPE_MAP[raw.toUpperCase()] ?? "Unpaid";
}

function initialsFromName(name: string | undefined | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function hashToIndex(id: string, size: number): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return hash % size;
}

function avatarColorFromId(id: string): AvatarColor {
  return AVATAR_COLORS[hashToIndex(id, AVATAR_COLORS.length)];
}

function getEmployeeName(dto: unknown): string | null {
  const d = dto as Record<string, unknown>;
  const employee = d?.employee as Record<string, unknown> | undefined;
  const user = d?.user as Record<string, unknown> | undefined;

  const firstName =
    (employee?.firstName as string | undefined) ??
    (d?.firstName as string | undefined) ??
    (user?.firstName as string | undefined);
  const lastName =
    (employee?.lastName as string | undefined) ??
    (d?.lastName as string | undefined) ??
    (user?.lastName as string | undefined);

  if (typeof firstName === "string" && firstName.trim()) {
    const combined = [firstName, lastName].filter(Boolean).join(" ").trim();
    if (combined) return combined;
  }

  const name =
    d?.employeeName ??
    d?.name ??
    d?.fullName ??
    d?.full_name ??
    employee?.name ??
    employee?.fullName ??
    user?.name;

  if (typeof name === "string" && name.trim()) return name;

  console.warn(
    "[calendar.mappers] Could not find an employee name field on:",
    dto,
  );
  return null;
}

function getEmployeeId(dto: unknown): string {
  const d = dto as Record<string, unknown>;
  const employee = d?.employee as Record<string, unknown> | undefined;
  const user = d?.user as Record<string, unknown> | undefined;

  const id = employee?.id ?? d?.employeeId ?? d?.userId ?? user?.id ?? d?.id;

  if (id !== undefined && id !== null) return String(id);

  const fallback = getEmployeeName(dto);
  console.warn(
    "[calendar.mappers] Could not find an employee id field on:",
    dto,
  );
  return fallback ?? `unknown-${Math.random().toString(36).slice(2)}`;
}

function pickField(dto: unknown, keys: string[]): unknown {
  const d = dto as Record<string, unknown>;
  for (const key of keys) {
    if (d?.[key] !== undefined && d?.[key] !== null) return d[key];
  }
  return undefined;
}

function getBirthDateValue(dto: unknown): unknown {
  return pickField(dto, [
    "dateOfBirth",
    "dob",
    "birthDate",
    "birthday",
    "date_of_birth",
    "birth_date",
  ]);
}

function getStartDateValue(dto: unknown): unknown {
  return pickField(dto, [
    "startDate",
    "start_date",
    "from",
    "fromDate",
    "start",
    "leaveStart",
    "leaveStartDate",
  ]);
}

function getEndDateValue(dto: unknown): unknown {
  return pickField(dto, [
    "endDate",
    "end_date",
    "to",
    "toDate",
    "end",
    "leaveEnd",
    "leaveEndDate",
  ]);
}

function getLeaveTypeValue(dto: unknown): unknown {
  return pickField(dto, ["leaveType", "leave_type", "type", "category"]);
}

function getStatusValue(dto: unknown): string | undefined {
  const value = pickField(dto, ["status"]);
  return typeof value === "string" ? value : undefined;
}

function getDepartmentValue(dto: unknown): string | undefined {
  const value = pickField(dto, ["department", "dept", "team"]);
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const name = (value as Record<string, unknown>).name;
    if (typeof name === "string") return name;
  }
  return undefined;
}

function getRoleValue(dto: unknown): EmployeeRole {
  const d = dto as Record<string, unknown>;
  const employee = d?.employee as Record<string, unknown> | undefined;

  const rawRole = pickField(dto, ["role", "position", "jobTitle", "title"]);
  const employeeRawRole = employee
    ? pickField(employee, ["role", "position", "jobTitle", "title"])
    : undefined;

  const normalized = normalizeRole(rawRole) ?? normalizeRole(employeeRawRole);
  if (normalized) return normalized;

  // Boolean-flag fallback, most senior first
  const isHR = (d?.isHR ?? employee?.isHR) as boolean | undefined;
  const isDeptHead = (d?.isDepartmentHead ?? employee?.isDepartmentHead) as
    | boolean
    | undefined;
  const isTeamLead = (d?.isTeamLead ?? employee?.isTeamLead) as
    | boolean
    | undefined;

  if (isHR === true) return "HR";
  if (isDeptHead === true) return "Department Head";
  if (isTeamLead === true) return "Team Lead";

  console.warn(
    "[calendar.mappers] Could not resolve a known role for:",
    dto,
    "— defaulting to 'Employee'. Add the real field/value to ROLE_MAP.",
  );
  return "Employee";
}

function parseIsoDateParts(
  value: unknown,
  sourceForLogging?: unknown,
): { year: number; month: number; day: number } | null {
  if (!value || typeof value !== "string") {
    console.warn(
      "[calendar.mappers] Missing/invalid date value. Full record:",
      sourceForLogging ?? value,
    );
    return null;
  }

  const datePart = value.split("T")[0];
  const [y, m, d] = datePart.split("-").map(Number);

  if (!y || !m || !d || Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) {
    console.warn(
      "[calendar.mappers] Could not parse date value:",
      value,
      "Full record:",
      sourceForLogging ?? value,
    );
    return null;
  }

  return { year: y, month: m - 1, day: d };
}

function shortenHolidayName(name: string): string {
  if (HOLIDAY_SHORT_NAME_OVERRIDES[name])
    return HOLIDAY_SHORT_NAME_OVERRIDES[name];
  return name.length > 14 ? `${name.slice(0, 12)}…` : name;
}

export function mapPublicHolidaysToGhanaHolidays(
  dtos: PublicHolidayDto[],
): GhanaHoliday[] {
  const result: GhanaHoliday[] = [];

  for (const dto of dtos) {
    const dateValue = pickField(dto, ["date", "holidayDate", "day"]);
    const parts = parseIsoDateParts(dateValue, dto);
    const name = pickField(dto, ["name", "holidayName", "title"]) as
      | string
      | undefined;
    if (!parts || !name) continue;

    result.push({
      name,
      month: parts.month,
      day: parts.day,
      short: shortenHolidayName(name),
    });
  }

  return result;
}

export function mapLeaveRequestsToLeaveData(
  dtos: LeaveRequestDto[],
  year: number,
  month: number,
): Record<string, LeaveEntry[]> {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const result: Record<string, LeaveEntry[]> = {};

  for (const dto of dtos) {
    const status = getStatusValue(dto);
    if (status && status.toUpperCase() === "REJECTED") continue;

    const employeeName = getEmployeeName(dto);
    const start = parseIsoDateParts(getStartDateValue(dto), dto);
    const end = parseIsoDateParts(getEndDateValue(dto), dto);
    if (!employeeName || !start || !end) continue;

    const startsBeforeOrDuring =
      start.year < year || (start.year === year && start.month <= month);
    const endsAfterOrDuring =
      end.year > year || (end.year === year && end.month >= month);
    if (!startsBeforeOrDuring || !endsAfterOrDuring) continue;

    const startDay =
      start.year === year && start.month === month ? start.day : 1;
    const endDay =
      end.year === year && end.month === month ? end.day : daysInMonth;

    const entry: LeaveEntry = {
      start: startDay,
      end: endDay,
      type: normalizeLeaveType(getLeaveTypeValue(dto) as string | undefined),
      status,
    };

    if (!result[employeeName]) result[employeeName] = [];
    result[employeeName].push(entry);
  }

  return result;
}

export function mapBirthdaysAndLeavesToMembers(
  birthdays: BirthdayDto[],
  leaveRequests: LeaveRequestDto[],
): TeamMember[] {
  const membersById = new Map<string, TeamMember>();

  for (const dto of birthdays) {
    const name = getEmployeeName(dto);
    const id = getEmployeeId(dto);
    if (!name) continue;

    const parts = parseIsoDateParts(getBirthDateValue(dto), dto);

    membersById.set(id, {
      id,
      name,
      role: getRoleValue(dto),
      department: getDepartmentValue(dto) ?? "General",
      avatar: initialsFromName(name),
      avatarColor: avatarColorFromId(id),
      birthday: parts ? { day: parts.day, month: parts.month } : undefined,
    });
  }

  for (const dto of leaveRequests) {
    const name = getEmployeeName(dto);
    const id = getEmployeeId(dto);
    if (!name || membersById.has(id)) continue;

    membersById.set(id, {
      id,
      name,
      role: getRoleValue(dto),
      department: getDepartmentValue(dto) ?? "General",
      avatar: initialsFromName(name),
      avatarColor: avatarColorFromId(id),
    });
  }

  return Array.from(membersById.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}
