"use client";

import {
  Info,
  ShieldCheck,
  MoreHorizontal,
  Trash2Icon,
  CalendarClock,
  RotateCcw,
  ArrowRightLeft,
  Users,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CreatePolicy from "@/components/policies/create-policy";
import { useLeavePoliciesViewModel } from "@/viewmodels/useLeavePoliciesViewModel";
import type { Policy } from "@/models/policy.types";
import EditPolicy from "@/components/policies/editPolicy";

const typeColors: Record<string, string> = {
  Annual: "bg-chart-1/10 text-chart-1",
  Sick: "bg-chart-2/10 text-chart-2",
  Personal: "bg-chart-3/10 text-chart-3",
  Parental: "bg-chart-4/10 text-chart-4",
  Custom: "bg-muted text-muted-foreground",
};

function formatAccrualRate(rate: number, accrual: string): string {
  const labels: Record<string, string> = {
    Monthly: "mo",
    Yearly: "yr",
    OneTime: "one-time",
    Manual: "manual",
  };
  const suffix = labels[accrual] ?? accrual.toLowerCase();
  return accrual === "OneTime" || accrual === "Manual"
    ? `${rate} days`
    : `${rate} days/${suffix}`;
}

function formatCarryOver(policy: Policy): string {
  if (policy.carryOverPolicy === "Limited" && policy.carryOverLimit != null)
    return `${policy.carryOverLimit} days max`;
  if (policy.carryOverPolicy === "NA") return "N/A";
  return policy.carryOverPolicy;
}

function formatWaitingPeriod(days?: number): string {
  return days ? `${days} days` : "None";
}

export default function LeavePolicies() {
  const {
    policies,
    loadingPolicies,
    fetchError,
    mounted,
    canManagePolicies,
    handlePolicyCreated,
    handlePolicyUpdated,
    handleDeletePolicy,
  } = useLeavePoliciesViewModel();

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-lg font-semibold">
            Leave Policies
          </h1>
          <p className="text-muted-foreground text-sm">
            Configure leave types, accrual rules, and carry-over settings
          </p>
        </div>
        {canManagePolicies && <CreatePolicy onCreated={handlePolicyCreated} />}
      </div>

      {/* Info banner */}
      <div className="bg-primary/5 border-primary/30 rounded-lg border p-4">
        <div className="flex items-start gap-3">
          <Info className="text-primary mt-0.5 size-5 shrink-0" />
          <div>
            <p className="text-foreground text-sm font-medium">
              Flexible Rules Engine
            </p>
            <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
              Configure custom accrual logic, carry-over rules, and waiting
              periods to comply with local labor laws. Changes to policies take
              effect at the start of the next accrual cycle.
            </p>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loadingPolicies && (
        <p className="text-muted-foreground text-sm">Loading policies…</p>
      )}

      {/* Error */}
      {!loadingPolicies && fetchError && (
        <p className="text-destructive text-sm">{fetchError}</p>
      )}

      {/* Empty */}
      {!loadingPolicies && !fetchError && policies.length === 0 && (
        <p className="text-muted-foreground text-sm">
          No policies found. Create your first one above.
        </p>
      )}

      {/* Policy cards */}
      {!loadingPolicies && !fetchError && policies.length > 0 && (
        <div className="flex flex-col gap-4">
          {policies.map((policy) => (
            <Card key={policy.id}>
              <CardContent className="p-4">
                {/* Card header row */}
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/8 mt-0.5 flex size-10 items-center justify-center rounded-xl">
                      <ShieldCheck className="size-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-foreground text-sm font-medium">
                          {policy.name}
                        </h2>
                        <Badge
                          variant="outline"
                          className={`border-0 text-[10px] ${
                            typeColors[policy.type] ??
                            "bg-muted text-muted-foreground"
                          }`}
                        >
                          {policy.type}
                        </Badge>
                        {!policy.isActive && <Badge>Draft</Badge>}
                      </div>
                      <p className="text-muted-foreground mt-0.5 text-xs">
                        {policy.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground text-xs">
                              Active
                            </span>
                            <Switch checked={policy.isActive} />
                          </div>
                        </TooltipTrigger>
                      </Tooltip>
                    </TooltipProvider>

                    {canManagePolicies && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 cursor-pointer"
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <EditPolicy
                            policy={policy}
                            onUpdated={handlePolicyUpdated}
                          />
                          <DropdownMenuItem
                            onClick={() => handleDeletePolicy(policy.id)}
                          >
                            <Trash2Icon className="mr-2 size-3.5" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                  <div className="bg-muted/95 flex items-center gap-2 rounded-lg p-2.5">
                    <CalendarClock className="text-muted-foreground size-4 shrink-0" />
                    <div>
                      <p className="text-muted-foreground text-[10px]">
                        Accrual
                      </p>
                      <p className="text-foreground text-xs font-medium">
                        {formatAccrualRate(policy.accrualRate, policy.accrual)}
                      </p>
                    </div>
                  </div>

                  <div className="bg-muted/95 flex items-center gap-2 rounded-lg p-2.5">
                    <ShieldCheck className="text-muted-foreground size-4 shrink-0" />
                    <div>
                      <p className="text-muted-foreground text-[10px]">
                        Max Balance
                      </p>
                      <p className="text-foreground text-xs font-medium">
                        {policy.maxBalance} days
                      </p>
                    </div>
                  </div>

                  <div className="bg-muted/95 flex items-center gap-2 rounded-lg p-2.5">
                    <RotateCcw className="text-muted-foreground size-4 shrink-0" />
                    <div>
                      <p className="text-muted-foreground text-[10px]">
                        Carry Over
                      </p>
                      <p className="text-foreground text-xs font-medium">
                        {formatCarryOver(policy)}
                      </p>
                    </div>
                  </div>

                  <div className="bg-muted/95 flex items-center gap-2 rounded-lg p-2.5">
                    <ArrowRightLeft className="text-muted-foreground size-4 shrink-0" />
                    <div>
                      <p className="text-muted-foreground text-[10px]">
                        Waiting Period
                      </p>
                      <p className="text-foreground text-xs font-medium">
                        {formatWaitingPeriod(policy.waitingPeriodDays)}
                      </p>
                    </div>
                  </div>

                  <div className="bg-muted/95 flex items-center gap-2 rounded-lg p-2.5">
                    <Users className="text-muted-foreground size-4 shrink-0" />
                    <div>
                      <p className="text-muted-foreground text-[10px]">
                        Applies To
                      </p>
                      <p className="text-foreground text-xs font-medium">
                        All ({policy.employees})
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
