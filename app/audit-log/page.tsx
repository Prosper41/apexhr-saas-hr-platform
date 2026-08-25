import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppHeader } from "@/components/app-header";
import ProtectedRoute from "@/components/protected-route";
import LogHistory from "@/components/audit-log/log-history";
import LogTable from "@/components/audit-log/log-table";

export default function Page() {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <AppHeader />

          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <section className="w-full">
              <LogHistory />
            </section>

            <section className="w-full">
              <LogTable />
            </section>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
