"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { NotificationBell } from "@/components/notifications/notification-bell";

export function AppHeader() {
  return (
    <header className="bg-background sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between gap-2 border-b px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
      </div>
      <NotificationBell />
    </header>
  );
}
