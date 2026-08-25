"use client";

import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { ADMIN_ROLES } from "@/models/policy.types";

import ProtectedRoute from "@/components/protected-route";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { ProfileTab } from "@/components/settings/profile-tab";
import { PasswordTab } from "@/components/settings/password-tab";
import { OrganizationTab } from "@/components/settings/organization-tab";

interface DecodedToken {
  role: string;
}

export default function SettingsPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      const decoded = jwtDecode<DecodedToken>(token);
      setIsAdmin(ADMIN_ROLES.includes(decoded?.role ?? ""));
    } catch {
      setIsAdmin(false);
    }
  }, []);

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <AppHeader />

          <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 p-4 px-8 pt-0">
            <div>
              <h1 className="text-xl font-semibold">Settings</h1>
              <p className="text-muted-foreground text-sm">
                {mounted && isAdmin
                  ? "Manage your account and organization preferences"
                  : "Manage your account preferences"}
              </p>
            </div>

            <Tabs defaultValue="profile" className="mt-2 w-full">
              <TabsList>
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="password">Password</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>

                {mounted && isAdmin && (
                  <>
                    <TabsTrigger value="organization">Organization</TabsTrigger>
                    <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
                    <TabsTrigger value="integrations">Integrations</TabsTrigger>
                  </>
                )}
              </TabsList>

              <TabsContent value="profile" className="mt-6">
                <ProfileTab isAdmin={mounted && isAdmin} />
              </TabsContent>

              <TabsContent value="password" className="mt-6">
                <PasswordTab />
              </TabsContent>

              <TabsContent value="notifications" className="mt-6">
                <p className="text-muted-foreground text-sm">
                  Notifications — coming soon.
                </p>
              </TabsContent>

              {mounted && isAdmin && (
                <>
                  <TabsContent value="organization" className="mt-6">
                    <OrganizationTab />
                  </TabsContent>

                  <TabsContent value="roles" className="mt-6">
                    <p className="text-muted-foreground text-sm">
                      Roles & Permissions — coming soon.
                    </p>
                  </TabsContent>

                  <TabsContent value="integrations" className="mt-6">
                    <p className="text-muted-foreground text-sm">
                      Integrations — coming soon.
                    </p>
                  </TabsContent>
                </>
              )}
            </Tabs>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
