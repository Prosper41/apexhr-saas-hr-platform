import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppHeader } from "@/components/app-header";
import ProtectedRoute from "@/components/protected-route";
import CreateDepartment from "@/components/people/create-department";
import EmployeeDataCards from "@/components/people/employee-data-cards";

export default function Page() {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <AppHeader />

          <div className="m-4 flex flex-1 flex-col gap-4 p-4 pt-0">
            <section className="w-full">
              <CreateDepartment />
            </section>

            <section className="w-full">
              <EmployeeDataCards />
            </section>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
