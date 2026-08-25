"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flag } from "lucide-react";
import type { GhanaHoliday } from "@/models/calendar.types";
import { MONTHS } from "@/viewmodels/useCalendarViewModel";

const SHORT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

interface UpcomingHolidaysProps {
  month: number;
  todayDay: number | null;
  holidays: GhanaHoliday[];
}

export function UpcomingHolidays({
  month,
  todayDay,
  holidays,
}: UpcomingHolidaysProps) {
  const currentDay = todayDay ?? 0;

  const relevant = holidays
    .filter((h) => {
      if (h.month === month && (todayDay === null || h.day >= currentDay))
        return true;
      if (h.month === (month + 1) % 12) return true;
      return false;
    })
    .sort((a, b) => (a.month === b.month ? a.day - b.day : a.month - b.month))
    .slice(0, 5);

  function getDaysLabel(h: GhanaHoliday): string {
    if (h.month === month && todayDay !== null) {
      const diff = h.day - currentDay;
      if (diff === 0) return "Today";
      if (diff > 0) return `in ${diff}d`;
    }
    return `${SHORT_MONTHS[h.month]} ${h.day}`;
  }

  const thisMonthCount = relevant.filter((h) => h.month === month).length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-foreground text-sm font-medium">
              Public Holidays
            </p>
            <p className="text-muted-foreground mt-0.5 text-xs">
              Ghana 🇬🇭 {MONTHS[month]}
            </p>
          </div>
          {thisMonthCount > 0 && (
            <Badge
              variant="outline"
              className="border-green-200 bg-green-50 text-xs text-green-700"
            >
              {thisMonthCount} this month
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0 pb-2">
        {relevant.length === 0 ? (
          <p className="text-muted-foreground py-4 text-center text-xs">
            No public holidays in {MONTHS[month]}
          </p>
        ) : (
          <div className="space-y-1">
            {relevant.map((h, i) => {
              const label = getDaysLabel(h);
              const isToday = h.month === month && h.day === currentDay;
              const isNextMonth = h.month !== month;
              return (
                <div
                  key={`${h.name}-${h.month}-${h.day}-${i}`}
                  className="flex items-center gap-3 rounded-lg border px-3 py-2.5"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-green-200 bg-green-50">
                    <Flag className="size-3.5 text-green-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground truncate text-xs font-medium">
                      {h.name}
                    </p>
                    <p className="mt-0.5 text-[11px] text-green-600">
                      {SHORT_MONTHS[h.month]} {h.day}
                      {isNextMonth && (
                        <span className="text-muted-foreground ml-1">
                          (next month)
                        </span>
                      )}
                    </p>
                  </div>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] whitespace-nowrap ${
                      isToday
                        ? "border-green-300 bg-green-100 text-green-700"
                        : "border-green-200 bg-green-50 text-green-600"
                    }`}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
