"use client";

import { Fragment, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { Card } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";

type LogEntry = {
  id: number;
  timestamp: string;
  actor: {
    name: string;
    role: string;
    initials: string;
    color: string;
  };
  action: string;
  summary: string;
  target: string;
  status: "override" | "approved" | "rejected" | "submitted" | "modified";

  snapshot: {
    before: Record<string, string | number>;
    after: Record<string, string | number>;
  };

  meta: {
    eventId: string;
    ip: string;
    reason: string;
  };
};

const LOG_ENTRIES: LogEntry[] = [
  {
    id: 1,
    timestamp: "May 14, 11:05 AM",
    actor: {
      name: "Aisha Mensah",
      role: "HR Admin",
      initials: "AM",
      color: "#E76F51",
    },
    action: "Policy edited",
    summary: "Maternity policy carry-over rule",
    target: "Tenant-wide · All depts",
    status: "modified",

    snapshot: {
      before: {
        max_carryover: "5 days",
        reset_date: "Jan 1",
      },
      after: {
        max_carryover: "10 days",
        reset_date: "Jan 1",
      },
    },

    meta: {
      eventId: "EVT-00879",
      ip: "197.255.x.x",
      reason: "Updated to comply with Ghana Labour Act amendment",
    },
  },

  {
    id: 2,
    timestamp: "May 14, 09:30 AM",
    actor: {
      name: "Nana Akua",
      role: "Team Lead",
      initials: "NA",
      color: "#C084FC",
    },
    action: "Comment added",
    summary: "Pre-approval comment on request",
    target: "Yaw Darko · Engineering",
    status: "submitted",

    snapshot: {
      before: {
        comment_count: 0,
        workflow_stage: "Team Lead review",
      },
      after: {
        comment_count: 1,
        workflow_stage: "Team Lead review",
      },
    },

    meta: {
      eventId: "EVT-00876",
      ip: "197.255.x.x",
      reason: "Flagged deadline conflict for Dept Head context",
    },
  },
];

const STATUS_STYLES = {
  submitted: {
    bg: "bg-blue-100 dark:bg-blue-500/10",
    text: "text-blue-700 dark:text-blue-400",
    label: "submitted",
  },

  approved: {
    bg: "bg-green-100 dark:bg-green-500/10",
    text: "text-green-700 dark:text-green-400",
    label: "approved",
  },

  rejected: {
    bg: "bg-red-100 dark:bg-red-500/10",
    text: "text-red-700 dark:text-red-400",
    label: "rejected",
  },

  modified: {
    bg: "bg-amber-100 dark:bg-amber-500/10",
    text: "text-amber-700 dark:text-amber-400",
    label: "modified",
  },

  override: {
    bg: "bg-pink-100 dark:bg-pink-500/10",
    text: "text-pink-700 dark:text-pink-400",
    label: "override",
  },
};

export default function LogTable() {
  const [expandedRow, setExpandedRow] = useState<number | null>(1);

  const toggleRow = (id: number) => {
    setExpandedRow((prev) => (prev === id ? null : id));
  };

  return (
    <Card className="overflow-hidden border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]" />
            <TableHead>Timestamp</TableHead>
            <TableHead>Actor</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Target</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {LOG_ENTRIES.map((entry) => {
            const statusStyle = STATUS_STYLES[entry.status];

            return (
              <Fragment key={entry.id}>
                {/* Main Row */}
                <TableRow className="border-b">
                  <TableCell>
                    <button
                      onClick={() => toggleRow(entry.id)}
                      className="hover:bg-muted flex h-7 w-7 items-center justify-center rounded-md transition"
                    >
                      {expandedRow === entry.id ? (
                        <ChevronUp className="text-muted-foreground size-4" />
                      ) : (
                        <ChevronDown className="text-muted-foreground size-4" />
                      )}
                    </button>
                  </TableCell>

                  <TableCell className="text-sm font-medium whitespace-nowrap">
                    {entry.timestamp}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9">
                        <AvatarFallback
                          className="text-xs font-semibold text-white"
                          style={{
                            backgroundColor: entry.actor.color,
                          }}
                        >
                          {entry.actor.initials}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <p className="text-sm leading-none font-semibold">
                          {entry.actor.name}
                        </p>

                        <p className="text-muted-foreground mt-1 text-xs">
                          {entry.actor.role}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div>
                      <p className="text-sm font-semibold">{entry.action}</p>

                      <p className="text-muted-foreground mt-1 text-sm">
                        {entry.summary}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell className="text-muted-foreground text-sm font-medium">
                    {entry.target}
                  </TableCell>

                  <TableCell>
                    <Badge
                      className={`rounded-full border-0 px-3 py-1 text-xs font-medium capitalize ${statusStyle.bg} ${statusStyle.text}`}
                    >
                      {statusStyle.label}
                    </Badge>
                  </TableCell>
                </TableRow>

                {/* Expanded Snapshot */}
                {expandedRow === entry.id && (
                  <TableRow>
                    <TableCell colSpan={6} className="bg-muted/20 px-6 py-5">
                      <div className="space-y-5">
                        {/* State Snapshot */}
                        <div>
                          <p className="text-muted-foreground mb-3 text-xs font-semibold tracking-wide uppercase">
                            State Snapshot
                          </p>

                          <div className="grid gap-3 md:grid-cols-2">
                            {/* BEFORE */}
                            <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-500/10 dark:bg-red-500/5">
                              <p className="mb-4 text-sm font-semibold text-red-700 dark:text-red-400">
                                Before
                              </p>

                              <div className="space-y-2 font-mono text-sm">
                                {Object.entries(entry.snapshot.before).map(
                                  ([key, value]) => (
                                    <div
                                      key={key}
                                      className="flex items-center gap-2"
                                    >
                                      <span className="text-muted-foreground">
                                        {key}:
                                      </span>

                                      <span className="text-red-700 dark:text-red-300">
                                        {String(value)}
                                      </span>
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>

                            {/* AFTER */}
                            <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-500/10 dark:bg-green-500/5">
                              <p className="mb-4 text-sm font-semibold text-green-700 dark:text-green-400">
                                After
                              </p>

                              <div className="space-y-2 font-mono text-sm">
                                {Object.entries(entry.snapshot.after).map(
                                  ([key, value]) => (
                                    <div
                                      key={key}
                                      className="flex items-center gap-2"
                                    >
                                      <span className="text-muted-foreground">
                                        {key}:
                                      </span>

                                      <span className="text-green-700 dark:text-green-300">
                                        {String(value)}
                                      </span>
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Footer Meta */}
                        <div className="flex flex-col gap-2 border-t pt-4 text-sm md:flex-row md:flex-wrap md:items-center md:gap-6">
                          <div>
                            <span className="text-muted-foreground">
                              Event ID
                            </span>{" "}
                            <span className="font-semibold">
                              {entry.meta.eventId}
                            </span>
                          </div>

                          <div>
                            <span className="text-muted-foreground">IP</span>{" "}
                            <span className="font-semibold">
                              {entry.meta.ip}
                            </span>
                          </div>

                          <div className="flex items-start gap-2">
                            <span className="text-muted-foreground">
                              Reason
                            </span>

                            <span className="font-medium">
                              {entry.meta.reason}
                            </span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
