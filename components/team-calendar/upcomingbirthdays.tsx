"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cake } from "lucide-react";
import { TeamAvatar } from "./teamavatar";
import type { TeamMember } from "@/models/calendar.types";
import { MONTHS } from "@/viewmodels/useCalendarViewModel";

interface UpcomingBirthdaysProps {
  month: number;
  todayDay: number | null;
  filteredMembers: TeamMember[];
}

export function UpcomingBirthdays({
  month,
  todayDay,
  filteredMembers,
}: UpcomingBirthdaysProps) {
  const currentDay = todayDay ?? 0;

  const birthdaysThisMonth = filteredMembers
    .filter((m) => m.birthday?.month === month)
    .sort((a, b) => (a.birthday?.day ?? 0) - (b.birthday?.day ?? 0));

  function getDaysLabel(day: number): string {
    const diff = day - currentDay;
    if (diff === 0) return "Today!";
    if (diff > 0) return `in ${diff}d`;
    return `${MONTHS[month].slice(0, 3)} ${day}`;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-foreground text-sm font-medium">Birthdays</p>
            <p className="text-muted-foreground mt-0.5 text-xs">
              {MONTHS[month]}
            </p>
          </div>
          {birthdaysThisMonth.length > 0 && (
            <Badge
              variant="outline"
              className="border-pink-200 bg-pink-50 text-xs text-pink-700"
            >
              {birthdaysThisMonth.length} birthday
              {birthdaysThisMonth.length !== 1 ? "s" : ""}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0 pb-2">
        {birthdaysThisMonth.length === 0 ? (
          <p className="text-muted-foreground py-4 text-center text-xs">
            No birthdays in {MONTHS[month]}
          </p>
        ) : (
          <div className="space-y-1">
            {birthdaysThisMonth.map((member) => {
              const day = member.birthday!.day;
              const label = getDaysLabel(day);
              const isToday = day === currentDay;
              return (
                <div
                  key={member.id}
                  className="flex items-center gap-3 rounded-lg border px-3 py-2.5"
                >
                  <TeamAvatar
                    initials={member.avatar}
                    color={member.avatarColor}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground truncate text-xs font-medium">
                      {member.name}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] text-pink-600">
                      <Cake className="size-3" />
                      {MONTHS[month].slice(0, 3)} {day}
                    </p>
                  </div>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] whitespace-nowrap ${
                      isToday
                        ? "border-pink-300 bg-pink-100 text-pink-700"
                        : "border-pink-200 bg-pink-50 text-pink-600"
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
