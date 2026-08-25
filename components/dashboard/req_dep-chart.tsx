"use client";

import {
  Card,
  CardContent,
  CardTitle,
  CardHeader,
  CardDescription,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

import {
  useRequestTrendsViewModel,
  useDepartmentTodayViewModel,
} from "@/viewmodels/useDashboardViewModel";

export default function ReqDepChart() {
  const {
    trends,
    loading: trendsLoading,
    error: trendsError,
  } = useRequestTrendsViewModel();
  const {
    departments,
    loading: deptLoading,
    error: deptError,
  } = useDepartmentTodayViewModel();

  function abbreviateDept(name: string): string {
    if (!name) return "";
    if (name.length <= 3) return name;

    const words = name.trim().split(/\s+/);
    if (words.length > 1) {
      const initials = words
        .map((w) => w[0])
        .join("")
        .toUpperCase();
      return initials.slice(0, 3);
    }

    return name.slice(0, 3);
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* Request Trends Chart */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Request Trends</CardTitle>
          <CardDescription>
            Monthly leave requests over the past 6 months
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="h-64">
            {trendsLoading && (
              <div className="text-muted-foreground flex h-full items-center justify-center gap-2 text-sm">
                <Loader2 className="size-4 animate-spin" />
                Loading trends…
              </div>
            )}

            {!trendsLoading && trendsError && (
              <p className="text-destructive py-4 text-sm">{trendsError}</p>
            )}

            {!trendsLoading && !trendsError && trends.length === 0 && (
              <p className="text-muted-foreground py-4 text-sm">
                No trend data found.
              </p>
            )}

            {!trendsLoading && !trendsError && trends.length > 0 && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends}>
                  <defs>
                    <linearGradient
                      id="colorApproved"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="oklch(0.55 0.19 255)"
                        stopOpacity={0.15}
                      />
                      <stop
                        offset="95%"
                        stopColor="oklch(0.55 0.19 255)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />

                  <Area
                    type="monotone"
                    dataKey="approved"
                    stroke="oklch(0.55 0.19 180)"
                    fill="url(#colorApproved)"
                  />

                  <Area
                    type="monotone"
                    dataKey="rejected"
                    stroke="oklch(0.577 0.245 27.325)"
                    strokeDasharray="4 4"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Department Absences */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Today by Department</CardTitle>
          <CardDescription>Employees absent per department</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="h-64">
            {deptLoading && (
              <div className="text-muted-foreground flex h-full items-center justify-center gap-2 text-sm">
                <Loader2 className="size-4 animate-spin" />
                Loading…
              </div>
            )}

            {!deptLoading && deptError && (
              <p className="text-destructive py-4 text-sm">{deptError}</p>
            )}

            {!deptLoading && !deptError && departments.length === 0 && (
              <p className="text-muted-foreground py-4 text-sm">
                No department data found.
              </p>
            )}

            {!deptLoading && !deptError && departments.length > 0 && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departments}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dept" tickFormatter={abbreviateDept} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="oklch(0.5 2 180)" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
