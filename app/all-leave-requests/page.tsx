"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppHeader } from "@/components/app-header";
import NewRequest from "@/components/leave-request/new-request";
import { AllLeaveRequestFilters } from "@/components/leave-request/requests-filters";
import AllLeaveRequestsCards from "@/components/leave-request/all-leave-requests-cards";

export default function Page() {
  const [refresh, setRefresh] = useState(0);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />

        <div className="m-4 flex flex-1 flex-col gap-4 p-4 pt-0">
          <section className="w-full">
            <NewRequest onSubmitted={() => setRefresh((r) => r + 1)} />
          </section>

          <section className="w-full">
            <AllLeaveRequestFilters />
          </section>

          <section className="w-full">
            <AllLeaveRequestsCards refresh={refresh} />
          </section>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
