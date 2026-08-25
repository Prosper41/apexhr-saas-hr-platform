"use client";

import * as React from "react";
import {
  GalleryVerticalEnd,
  Settings2,
  SquareTerminal,
  CalendarDays,
  ClipboardCheck,
  CalendarRange,
  Users,
  FileText,
  ScrollText,
} from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { ADMIN_ROLES } from "@/models/policy.types";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

interface DecodedToken {
  role: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

const allProjects = [
  {
    name: "People",
    url: "/people",
    icon: Users,
    adminOnly: true,
    employeeHidden: false,
  },
  {
    name: "Policies",
    url: "/leave-policies",
    icon: FileText,
    adminOnly: false,
    employeeHidden: false,
  },
  {
    name: "All Leave Requests",
    url: "/all-leave-requests",
    icon: CalendarDays,
    adminOnly: false,
    employeeHidden: false,
  },
  {
    name: "Audit Log",
    url: "/audit-log",
    icon: ScrollText,
    adminOnly: true,
    employeeHidden: false,
  },
  {
    name: "Settings",
    url: "/settings",
    icon: Settings2,
    adminOnly: false,
    employeeHidden: false,
  },
];

const teams = [
  {
    name: "ApexHR",
    logo: GalleryVerticalEnd,
    plan: "Code Raccoon",
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [isEmployee, setIsEmployee] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [user, setUser] = React.useState({
    name: "",
    email: "",
    avatar: "/avatars/shadcn.jpg",
  });
  React.useEffect(() => {
    setMounted(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      const decoded = jwtDecode<DecodedToken>(token);
      const role = decoded?.role ?? "";
      setIsAdmin(ADMIN_ROLES.includes(role));
      setIsEmployee(role === "EMPLOYEE");

      const fullName = [decoded.firstName, decoded.lastName]
        .filter(Boolean)
        .join(" ");

      setUser({
        name: fullName,
        email: decoded.email ?? "",
        avatar: "/avatars/shadcn.jpg",
      });
    } catch {
      setIsAdmin(false);
      setIsEmployee(false);
    }
  }, []);

  const allNavMain = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: SquareTerminal,
      isActive: true,
      adminOnly: false,
      employeeHidden: false,
    },
    {
      title: "Leave Requests",
      url: "/leave-request",
      icon: CalendarDays,
      adminOnly: false,
      employeeHidden: false,
    },
    {
      title: "Approvals",
      url: "/approvals",
      icon: ClipboardCheck,
      adminOnly: false,
      employeeHidden: true,
    },
    {
      title: "Team Calendar",
      url: "/team-calendar",
      icon: CalendarRange,
      adminOnly: false,
      employeeHidden: false,
    },
  ];

  const filterItem = (item: {
    adminOnly: boolean;
    employeeHidden: boolean;
  }) => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.employeeHidden && isEmployee) return false;
    return true;
  };

  const navMain = mounted
    ? allNavMain.filter(filterItem)
    : allNavMain.filter((i) => !i.adminOnly && !i.employeeHidden);

  const projects = mounted
    ? allProjects.filter(filterItem)
    : allProjects.filter((i) => !i.adminOnly && !i.employeeHidden);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavProjects projects={projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
