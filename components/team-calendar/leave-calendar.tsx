"use client";

import { AlertTriangle, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ResponsiveSelect } from "@/components/ui/select";
import { CalendarGrid } from "./calendargrid";
import { UpcomingHolidays } from "./upcomingholidays";
import { UpcomingBirthdays } from "./upcomingbirthdays";
import { useCalendarViewModel } from "@/viewmodels/useCalendarViewModel";

export default function LeaveCalendar() {
  const vm = useCalendarViewModel();

  return (
    <main>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-foreground text-lg font-semibold">
            Team Calendar
          </h2>
          <p className="text-muted-foreground text-sm">
            Visualize team availability and upcoming birthdays
          </p>
        </div>
        <div className="w-52">
          <ResponsiveSelect
            value={vm.selectedDepartment}
            onChange={vm.setSelectedDepartment}
            options={vm.departmentOptions}
            searchable
          />
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm bg-blue-500" />
          <span className="text-muted-foreground text-xs">Annual</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm bg-teal-500" />
          <span className="text-muted-foreground text-xs">Sick</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-sm bg-amber-500" />
          <span className="text-muted-foreground text-xs">Personal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-pink-500" />
          <span className="text-muted-foreground text-xs">Birthday</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="border-destructive/50 bg-destructive/10 h-3 w-3 rounded-sm border" />
          <span className="text-muted-foreground text-xs">
            Conflict (&gt;20% dept absent)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={vm.prevMonth}>
                  <ChevronLeftIcon className="size-4" />
                </Button>
                <p className="text-foreground min-w-[100px] text-center text-sm font-medium">
                  {vm.monthName} {vm.year}
                </p>
                <Button variant="outline" size="sm" onClick={vm.nextMonth}>
                  <ChevronRightIcon className="size-4" />
                </Button>
              </div>
              <Badge variant="outline" className="text-xs">
                <AlertTriangle className="text-destructive mr-1 size-3.5" />
                {vm.conflictDays.size} conflict day
                {vm.conflictDays.size !== 1 ? "s" : ""}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {vm.loading ? (
              <p className="text-muted-foreground py-12 text-center text-sm">
                Loading calendar...
              </p>
            ) : vm.error ? (
              <div className="py-12 text-center">
                <p className="text-destructive text-sm font-medium">
                  Failed to load calendar data
                </p>
                <p className="text-muted-foreground mt-1 text-xs">{vm.error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={vm.retry}
                >
                  Retry
                </Button>
              </div>
            ) : (
              <CalendarGrid
                year={vm.year}
                month={vm.monthIdx}
                members={vm.filteredMembers}
                leaveData={vm.leaveData}
                conflictDays={vm.conflictDays}
                holidays={vm.monthHolidays}
              />
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <UpcomingHolidays
            month={vm.monthIdx}
            todayDay={vm.todayDay}
            holidays={vm.sidebarHolidays}
          />
          <UpcomingBirthdays
            month={vm.monthIdx}
            todayDay={vm.todayDay}
            filteredMembers={vm.filteredMembers}
          />
        </div>
      </div>
    </main>
  );
}
