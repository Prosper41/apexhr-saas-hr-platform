"use client";

import { cn } from "@/lib/utils";
import { Cake, Flag } from "lucide-react";
import { TeamAvatar } from "./teamavatar";
import type {
  TeamMember,
  LeaveEntry,
  GhanaHoliday,
} from "@/models/calendar.types";

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const leaveBarColor: Record<string, string> = {
  Annual: "bg-blue-500",
  Sick: "bg-teal-500",
  Personal: "bg-amber-500",
  Unpaid: "bg-muted-foreground/50",
};

interface CalendarGridProps {
  year: number;
  month: number;
  members: TeamMember[];
  leaveData: Record<string, LeaveEntry[]>;
  conflictDays: Set<number>;
  holidays: GhanaHoliday[];
}

function countWeekdayCols(
  year: number,
  month: number,
  fromDay: number,
  toDay: number,
): number {
  let count = 0;
  for (let d = fromDay; d <= toDay; d++) {
    const dow = new Date(year, month, d).getDay();
    if (dow !== 0 && dow !== 6) count++;
  }
  return count;
}

function lastWeekdayBefore(
  year: number,
  month: number,
  endDay: number,
): number {
  let d = endDay;
  while (d >= 1) {
    const dow = new Date(year, month, d).getDay();
    if (dow !== 0 && dow !== 6) return d;
    d--;
  }
  return endDay;
}

export function CalendarGrid({
  year,
  month,
  members,
  leaveData,
  conflictDays,
  holidays,
}: CalendarGridProps) {
  const today = new Date();
  const todayDay =
    today.getFullYear() === year && today.getMonth() === month
      ? today.getDate()
      : -1;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dayNumbers = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const holidayMap = new Map<number, GhanaHoliday>();
  holidays.forEach((h) => holidayMap.set(h.day, h));

  return (
    <div className="w-full overflow-x-auto">
      <table
        className="w-full border-collapse"
        style={{ minWidth: `${160 + daysInMonth * 32}px` }}
      >
        <thead>
          <tr>
            <th className="text-muted-foreground bg-background sticky left-0 z-30 w-40 min-w-40 pr-3 pb-1 text-left text-xs font-medium">
              Team member
            </th>
            {dayNumbers.map((d) => {
              const dow = new Date(year, month, d).getDay();
              const isWeekend = dow === 0 || dow === 6;
              const isConflict = conflictDays.has(d);
              const isToday = d === todayDay;
              const isHoliday = holidayMap.has(d);
              return (
                <th
                  key={d}
                  className={cn(
                    "w-8 min-w-8 pt-0 pb-1 text-center",
                    isWeekend && "opacity-50",
                    isConflict && "bg-destructive/5",
                    isToday && "bg-blue-50",
                    isHoliday && !isConflict && "bg-green-50/60",
                  )}
                >
                  <span
                    className={cn(
                      "block text-[11px] font-medium",
                      isConflict
                        ? "text-destructive"
                        : isToday
                          ? "text-blue-600"
                          : isHoliday
                            ? "text-green-700"
                            : "text-foreground",
                    )}
                  >
                    {d}
                  </span>
                  <span className="text-muted-foreground mt-0.5 block text-[9px]">
                    {DAYS[dow]}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {/* Ghana Public Holidays row */}
          <tr>
            <td className="bg-background sticky left-0 z-20 py-0 pr-3 align-middle">
              <div className="border-border flex items-center gap-2 border-b py-1.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm">
                  🇬🇭
                </div>
                <div className="overflow-hidden">
                  <p className="text-foreground truncate text-xs font-medium">
                    Public Holidays
                  </p>
                  <p className="text-muted-foreground truncate text-[10px]">
                    Ghana {year}
                  </p>
                </div>
              </div>
            </td>
            {dayNumbers.map((d) => {
              const dow = new Date(year, month, d).getDay();
              const isWeekend = dow === 0 || dow === 6;
              const isConflict = conflictDays.has(d);
              const isToday = d === todayDay;
              const holiday = holidayMap.get(d);

              return (
                <td
                  key={d}
                  className={cn(
                    "border-border relative h-11 border-b border-l",
                    isWeekend && "bg-muted/30",
                    isConflict && "bg-destructive/5",
                    isToday && "bg-blue-50",
                    holiday && !isWeekend && "bg-green-50/60",
                  )}
                  title={holiday?.name}
                >
                  {holiday && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
                      <Flag className="size-3.5 text-green-600" />
                      <span className="max-w-full truncate px-0.5 text-center text-[7px] leading-tight font-medium text-green-700">
                        {holiday.short}
                      </span>
                    </div>
                  )}
                </td>
              );
            })}
          </tr>

          {/* Team member rows */}
          {members.map((member) => {
            const memberLeaves: LeaveEntry[] = leaveData[member.name] ?? [];
            const birthday = member.birthday;
            const hasBdayThisMonth = birthday?.month === month;

            return (
              <tr key={member.id}>
                <td className="bg-background sticky left-0 z-20 py-0 pr-3 align-middle">
                  <div className="border-border flex items-center gap-2 border-b py-1.5">
                    <TeamAvatar
                      initials={member.avatar}
                      color={member.avatarColor}
                    />
                    <div className="overflow-hidden">
                      <p className="text-foreground truncate text-xs font-medium">
                        {member.name}
                      </p>
                      <p className="text-muted-foreground truncate text-[10px]">
                        {member.role}
                      </p>
                    </div>
                  </div>
                </td>

                {dayNumbers.map((d) => {
                  const dow = new Date(year, month, d).getDay();
                  const isWeekend = dow === 0 || dow === 6;
                  const isConflict = conflictDays.has(d);
                  const isToday = d === todayDay;
                  const isHoliday = holidayMap.has(d);

                  const leaveStartingHere = memberLeaves.find(
                    (l) => l.start === d,
                  );
                  const isOnLeave =
                    !isWeekend &&
                    memberLeaves.some((l) => d >= l.start && d <= l.end);
                  const isBirthday = hasBdayThisMonth && birthday?.day === d;

                  return (
                    <td
                      key={d}
                      className={cn(
                        "border-border relative h-11 border-b border-l",
                        isWeekend && "bg-muted/30",
                        isConflict && "bg-destructive/5",
                        isToday && "bg-blue-50",
                        isHoliday &&
                          !isWeekend &&
                          !isConflict &&
                          !isToday &&
                          "bg-green-50/40",
                      )}
                    >
                      {leaveStartingHere &&
                        (() => {
                          const startDow = new Date(
                            year,
                            month,
                            leaveStartingHere.start,
                          ).getDay();
                          const isStartWeekend =
                            startDow === 0 || startDow === 6;
                          if (isStartWeekend) return null;

                          const visualEnd = lastWeekdayBefore(
                            year,
                            month,
                            leaveStartingHere.end,
                          );

                          const physicalCols =
                            visualEnd - leaveStartingHere.start + 1;

                          const weekdayCount = countWeekdayCols(
                            year,
                            month,
                            leaveStartingHere.start,
                            leaveStartingHere.end,
                          );

                          return (
                            <div
                              className={cn(
                                "absolute top-1/2 z-10 flex h-5 -translate-y-1/2 items-center rounded",
                                leaveBarColor[leaveStartingHere.type],
                              )}
                              style={{ left: 2, width: physicalCols * 32 - 4 }}
                            >
                              <span className="truncate px-1.5 text-[8px] font-medium text-white">
                                {leaveStartingHere.type}
                                {weekdayCount > 1 && ` · ${weekdayCount}d`}
                              </span>
                            </div>
                          );
                        })()}

                      {isBirthday && (
                        <>
                          {isOnLeave ? (
                            <div className="absolute bottom-1 left-1/2 z-20 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-pink-500" />
                          ) : (
                            <div className="absolute top-1/2 left-0.5 z-10 flex -translate-y-1/2 items-center gap-0.5">
                              <Cake className="size-3 text-pink-500" />
                              <span className="rounded border border-pink-200 bg-pink-50 px-1 py-0.5 text-[8px] whitespace-nowrap text-pink-600">
                                bday
                              </span>
                            </div>
                          )}
                        </>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
