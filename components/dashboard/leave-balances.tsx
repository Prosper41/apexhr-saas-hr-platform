"use client";

import {
  Card,
  CardContent,
  CardTitle,
  CardHeader,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Palmtree,
  Stethoscope,
  Clock,
  Baby,
  ShieldQuestion,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useLeaveBalancesViewModel } from "@/viewmodels/useLeaveBalancesViewModel";

const ICON_MAP: Record<string, React.ElementType> = {
  Annual: Palmtree,
  Sick: Stethoscope,
  Personal: Clock,
  Parental: Baby,
};

const COLOR_MAP: Record<string, string> = {
  Annual: "text-chart-1",
  Sick: "text-chart-2",
  Personal: "text-chart-3",
  Parental: "text-chart-4",
};

const LABEL_MAP: Record<string, string> = {
  Annual: "Annual Leave",
  Sick: "Sick Leave",
  Personal: "Personal",
  Parental: "Parental",
};

export default function LeaveBalances() {
  const { balances, loading, error, mounted } = useLeaveBalancesViewModel();

  if (!mounted) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">My Leave Balances</CardTitle>
            <CardDescription>Current fiscal year 2026-2027</CardDescription>
          </div>

          <Link href="/leave-request">
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer bg-[#1d9c32] p-5 text-white transition-colors duration-200 hover:border-black hover:bg-[#63c072] hover:text-white"
            >
              Request Leave
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent>
        {loading && (
          <div className="text-muted-foreground flex items-center justify-center gap-2 py-8 text-sm">
            <Loader2 className="size-4 animate-spin" />
            Loading balances…
          </div>
        )}

        {!loading && error && (
          <p className="text-destructive py-4 text-sm">{error}</p>
        )}

        {!loading && !error && balances.length === 0 && (
          <p className="text-muted-foreground py-4 text-sm">
            No leave balances found.
          </p>
        )}

        {!loading && !error && balances.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {balances.map((balance) => {
              const Icon = ICON_MAP[balance.leaveType] ?? ShieldQuestion;
              const color =
                COLOR_MAP[balance.leaveType] ?? "text-muted-foreground";
              const label = LABEL_MAP[balance.leaveType] ?? balance.leaveType;

              const usedPct =
                balance.policyMax > 0
                  ? Math.min((balance.used / balance.policyMax) * 100, 100)
                  : 0;

              return (
                <div
                  key={balance.leaveType}
                  className="bg-card flex flex-col gap-3 rounded-xl border p-4"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`bg-muted flex size-8 items-center justify-center rounded-lg ${color}`}
                    >
                      <Icon className="size-4" />
                    </div>
                    <span className="text-foreground text-sm font-medium">
                      {label}
                    </span>
                  </div>

                  <div>
                    <div className="mb-2 flex items-baseline gap-1">
                      <span className="text-foreground text-2xl font-semibold">
                        {balance.remaining}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        / {balance.policyMax} days left
                      </span>
                    </div>
                    <Progress value={usedPct} className="h-1.5" />
                    <div className="text-muted-foreground mt-1.5 flex justify-between text-xs">
                      <span>{balance.used} used</span>
                      {balance.pending > 0 && (
                        <span className="text-yellow-500">
                          {balance.pending} pending
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
