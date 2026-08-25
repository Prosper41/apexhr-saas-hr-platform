"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CalendarDays,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Users,
  Loader2,
} from "lucide-react";
import { useDashboardStatsViewModel } from "@/viewmodels/useDashboardViewModel";

export default function StatCards() {
  const { stats, loading, error, mounted } = useDashboardStatsViewModel();

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="text-muted-foreground flex items-center justify-center gap-2 py-8 text-sm">
        <Loader2 className="size-4 animate-spin" />
        Loading stats…
      </div>
    );
  }

  if (error) {
    return <p className="text-destructive py-4 text-sm">{error}</p>;
  }

  if (!stats) return null;

  const isPendingUp = stats.pendingRequestsChange >= 0;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="flex items-center gap-4 p-5">
          <div className="bg-primary/10 flex size-11 items-center justify-center rounded-xl">
            <CalendarDays className="text-primary size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-muted-foreground text-sm">Pending Requests</p>
            <div className="flex items-baseline gap-2">
              <p className="text-foreground text-2xl font-semibold">
                {stats.pendingRequests}
              </p>
              <Badge
                variant="secondary"
                className="bg-warning/15 text-warning-foreground border-0 text-[10px]"
              >
                {isPendingUp ? (
                  <ArrowUpRight className="mr-0.5 size-3" />
                ) : (
                  <ArrowDownRight className="mr-0.5 size-3" />
                )}
                {isPendingUp ? "+" : ""}
                {stats.pendingRequestsChange}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex size-11 items-center justify-center rounded-xl bg-[#1d9c32]/50">
            <CheckCircle2 className="size-5 text-[#247935]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-muted-foreground text-sm">Approved (MTD)</p>
            <div className="flex items-baseline gap-2">
              <p className="text-foreground text-2xl font-semibold">
                {stats.approvedMTD}
              </p>
              <Badge
                variant="secondary"
                className="bg-success/15 text-success border-0 text-[10px]"
              >
                <TrendingUp className="mr-0.5 size-3" />
                {stats.approvedRate}%
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex size-11 items-center justify-center rounded-xl bg-[#eab308]/40">
            <Users className="size-5 text-[#d97706]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-muted-foreground text-sm">Out Today</p>
            <div className="flex items-baseline gap-2">
              <p className="text-foreground text-2xl font-semibold">
                {stats.outToday}
              </p>
              <span className="text-muted-foreground text-xs">
                of {stats.totalEmployees}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center gap-4 p-5">
          <div className="bg-destructive/30 flex size-11 items-center justify-center rounded-xl">
            <AlertTriangle className="text-destructive size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-muted-foreground text-sm">Conflicts</p>
            <div className="flex items-baseline gap-2">
              <p className="text-foreground text-2xl font-semibold">
                {stats.conflicts}
              </p>
              {stats.conflicts > 0 && (
                <span className="text-destructive text-xs font-medium">
                  Needs review
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
