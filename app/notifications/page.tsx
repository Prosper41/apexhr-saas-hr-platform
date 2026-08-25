"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppHeader } from "@/components/app-header";
import NotificationsPage from "@/components/notifications/notification-filter";

export default function Page() {
  // const [refresh, setRefresh] = useState(0);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />

        <div className="m-4 flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* <section className="w-full">
            <No onSubmitted={() => setRefresh((r) => r + 1)} />
          </section> */}

          <section className="w-full">
            <NotificationsPage />
          </section>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
