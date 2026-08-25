"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import NextLink from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  usePendingApprovalsViewModel,
  useUpcomingAbsencesViewModel,
} from "@/viewmodels/useDashboardViewModel";
import type {
  PendingApproval,
  UpcomingAbsence,
} from "@/models/dashboard.types";

export default function PendingUpcoming() {
  const {
    pending: pendingRequestsRaw,
    loading: pendingLoading,
    error: pendingError,
  } = usePendingApprovalsViewModel();
  const pendingRequests = pendingRequestsRaw ?? [];

  const {
    absences: upcomingAbsencesRaw,
    loading: absencesLoading,
    error: absencesError,
  } = useUpcomingAbsencesViewModel();
  const upcomingAbsences = upcomingAbsencesRaw ?? [];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* Pending Requests */}
      <Card className="sm:col-span-1 lg:col-span-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Pending</CardTitle>
              <CardDescription>Requests awaiting your review</CardDescription>
            </div>
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary border-0"
            >
              {pendingRequests.length} Pending
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {pendingLoading && (
            <div className="text-muted-foreground flex items-center justify-center gap-2 py-8 text-sm">
              <Loader2 className="size-4 animate-spin" />
              Loading…
            </div>
          )}

          {!pendingLoading && pendingError && (
            <p className="text-destructive py-4 text-sm">{pendingError}</p>
          )}

          {!pendingLoading && !pendingError && pendingRequests.length === 0 && (
            <p className="text-muted-foreground py-4 text-sm">
              No pending requests.
            </p>
          )}

          {!pendingLoading && !pendingError && pendingRequests.length > 0 && (
            <div className="flex flex-col gap-3">
              {pendingRequests.map((req: PendingApproval) => (
                <div
                  key={req.id}
                  className="bg-card hover:bg-muted/50 flex items-center gap-4 rounded-xl border p-4 transition-colors"
                >
                  <Avatar className="size-9">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {req.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-foreground text-sm font-medium">
                        {req.name}
                      </p>
                      <Badge
                        variant="outline"
                        className="px-1.5 py-1 text-[10px]"
                      >
                        {req.department}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-xs">{req.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-foreground text-sm font-medium">
                      {req.dates}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {req.days} day{req.days !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <Button
                    asChild
                    size="sm"
                    variant="ghost"
                    className="text-primary hover:text-primary hover:bg-primary/10 h-8 shrink-0 gap-1 px-2.5 text-xs"
                  >
                    <NextLink href={`/approvals?requestId=${req.id}`}>
                      Review
                      <ArrowRight className="size-3.5" />
                    </NextLink>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Absences */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Upcoming</CardTitle>
              <CardDescription>Absences upcoming</CardDescription>
            </div>
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary border-0"
            >
              {upcomingAbsences.length} Upcoming
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {absencesLoading && (
            <div className="text-muted-foreground flex items-center justify-center gap-2 py-8 text-sm">
              <Loader2 className="size-4 animate-spin" />
              Loading…
            </div>
          )}

          {!absencesLoading && absencesError && (
            <p className="text-destructive py-4 text-sm">{absencesError}</p>
          )}

          {!absencesLoading &&
            !absencesError &&
            upcomingAbsences.length === 0 && (
              <p className="text-muted-foreground py-4 text-sm">
                No upcoming absences.
              </p>
            )}

          {!absencesLoading &&
            !absencesError &&
            upcomingAbsences.length > 0 && (
              <div className="flex flex-col gap-3">
                {upcomingAbsences.map((absence: UpcomingAbsence) => (
                  <div
                    key={absence.id}
                    className="bg-card hover:bg-muted/50 flex items-center gap-4 rounded-xl border p-4 transition-colors"
                  >
                    <Avatar className="size-9">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {absence.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between gap-2">
                        <p className="text-foreground text-sm font-medium">
                          {absence.name}
                        </p>
                        <Badge
                          variant="outline"
                          className="px-1.5 py-1 text-[10px]"
                        >
                          {absence.department}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-xs">
                        {absence.dates}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
