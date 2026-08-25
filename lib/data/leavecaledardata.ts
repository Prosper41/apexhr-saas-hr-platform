export type LeaveType = "Annual" | "Sick" | "Personal" | "Unpaid";

export interface LeaveEntry {
  start: number; // day of month
  end: number;
  type: LeaveType;
}

export interface TeamMember {
  name: string;
  role: string;
  avatar: string;
  avatarColor: "blue" | "teal" | "coral" | "purple" | "amber";
  department: string;
  birthday?: { day: number; month: number }; // month is 0-indexed
}

export const teamMembers: TeamMember[] = [
  {
    name: "Kwame Asante",
    role: "Frontend Developer",
    avatar: "KA",
    avatarColor: "blue",
    department: "Software Engineering",
    birthday: { day: 15, month: 3 },
  },
  {
    name: "Yaw Darko",
    role: "SAP Consultant",
    avatar: "YD",
    avatarColor: "teal",
    department: "SAP",
    birthday: { day: 7, month: 4 },
  },
  {
    name: "Akosua Frimpong",
    role: "Project Manager",
    avatar: "AF",
    avatarColor: "coral",
    department: "Project Management",
    birthday: { day: 22, month: 4 },
  },
  {
    name: "Adwoa Sarpong",
    role: "Content Creator",
    avatar: "AS",
    avatarColor: "purple",
    department: "Educational Content Creation",
    birthday: { day: 3, month: 5 },
  },
  {
    name: "Kojo Amponsah",
    role: "HR Specialist",
    avatar: "KA",
    avatarColor: "amber",
    department: "Human Resource",
    birthday: { day: 18, month: 3 },
  },
];

export const leaveData: Record<string, LeaveEntry[]> = {
  "Kwame Asante": [{ start: 3, end: 10, type: "Annual" }],
  "Yaw Darko": [{ start: 17, end: 21, type: "Annual" }],
  "Akosua Frimpong": [{ start: 10, end: 14, type: "Annual" }],
  "Adwoa Sarpong": [{ start: 19, end: 19, type: "Sick" }],
  "Kojo Amponsah": [
    { start: 8, end: 9, type: "Annual" },
    { start: 25, end: 25, type: "Personal" },
  ],
};
