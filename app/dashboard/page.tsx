"use client";

import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppHeader } from "@/components/app-header";
import ProtectedRoute from "@/components/protected-route";

import StatCards from "@/components/dashboard/stat-cards";
import LeaveBalances from "@/components/dashboard/leave-balances";
import ReqDepChart from "@/components/dashboard/req_dep-chart";
import PendingUpcoming from "@/components/dashboard/pending-upcoming";

interface DecodedToken {
  firstName?: string;
}

export default function Page() {
  const [firstName, setFirstName] = useState("");

  useEffect(() => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      const decoded = jwtDecode<DecodedToken>(token);
      setFirstName(decoded.firstName ?? "");
    } catch {
      setFirstName("");
    }
  }, []);

  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? "Good morning"
      : currentHour < 17
        ? "Good afternoon"
        : "Good evening";

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar />

        <SidebarInset>
          <AppHeader />

          <div className="mt-4 flex flex-1 flex-col gap-4 p-4 pt-0">
            {/* Welcome Banner */}
            <section
              className="flex w-full items-center justify-between rounded-xl px-6 py-5 text-white shadow-sm"
              style={{ background: "#ab8853" }}
            >
              <div>
                <h1 className="text-xl font-semibold">
                  {greeting}
                  {firstName ? `, ${firstName}` : ""}
                </h1>
                <p className="mt-0.5 text-sm" style={{ color: "#d1fad7" }}>
                  Here&apos;s what&apos;s happening with your team today.
                </p>
              </div>
              <div
                className="hidden text-right text-sm sm:block"
                style={{ color: "#d1fad7" }}
              >
                <p className="font-medium text-white">
                  {new Date().toLocaleDateString("en-US", { weekday: "long" })}
                </p>
                <p>
                  {new Date().toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </section>

            <section className="w-full">
              <StatCards />
            </section>

            <section className="w-full">
              <LeaveBalances />
            </section>

            <section className="w-full">
              <ReqDepChart />
            </section>

            <section className="w-full">
              <PendingUpcoming />
            </section>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
