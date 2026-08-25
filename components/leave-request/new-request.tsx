"use client";

import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useState, useEffect } from "react";
import { Label } from "../ui/label";
import { ResponsiveSelect } from "../ui/select";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";
import { AlertCircle, CalendarIcon, Loader2 } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { fetchPolicies } from "@/services/policy.service";
import { BASE_URL, getHeaders } from "@/lib/api";
import { Calendar } from "../ui/calendar";
import { cn } from "@/lib/utils";

interface Department {
  id: string;
  name: string;
  [key: string]: unknown;
}

interface SelectOption {
  label: string;
  value: string;
}

interface FormState {
  leavePolicyId: string;
  departmentId: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  isHalfDay: boolean;
  reason: string;
}

const DEFAULT_FORM: FormState = {
  leavePolicyId: "",
  departmentId: "",
  startDate: undefined,
  endDate: undefined,
  isHalfDay: false,
  reason: "",
};

interface DecodedToken {
  role: string;
  departmentId?: string;
  department?: string;
}

const disabledDays = [
  { before: new Date(new Date().setHours(0, 0, 0, 0)) },
  { dayOfWeek: [0, 6] },
];

function formatDisplayDate(date: Date | undefined): string {
  if (!date) return "";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function NewRequest({
  onSubmitted,
}: {
  onSubmitted?: () => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);

  const [policyOptions, setPolicyOptions] = useState<SelectOption[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<SelectOption[]>(
    [],
  );
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [lockedDepartmentName, setLockedDepartmentName] = useState<
    string | null
  >(null);

  const [form, setForm] = useState<FormState>(DEFAULT_FORM);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (!dialogOpen) return;

    const loadOptions = async () => {
      setLoadingOptions(true);
      setFetchError(null);

      const token = localStorage.getItem("accessToken");
      if (!token) {
        setFetchError("Access token not found. Please log in again.");
        setLoadingOptions(false);
        return;
      }

      let userRole: string | null = null;
      let userDepartmentId: string | null = null;

      try {
        const decoded = jwtDecode<DecodedToken>(token);
        userRole = decoded?.role ?? null;
        userDepartmentId = decoded?.departmentId ?? decoded?.department ?? null;
      } catch {
        userRole = null;
      }

      try {
        const [policies, departmentsRes] = await Promise.all([
          fetchPolicies(token, userRole),
          fetch(`${BASE_URL}/v1/department`, {
            method: "GET",
            headers: getHeaders(token),
          }),
        ]);

        setPolicyOptions(policies.map((p) => ({ label: p.name, value: p.id })));

        if (!departmentsRes.ok) {
          const err = await departmentsRes.json().catch(() => null);
          throw new Error(
            Array.isArray(err?.message)
              ? err.message.join(", ")
              : (err?.message ??
                  `Failed to fetch departments (${departmentsRes.status})`),
          );
        }

        const deptData = await departmentsRes.json();
        const deptsArray: Department[] = Array.isArray(deptData)
          ? deptData
          : Array.isArray(deptData?.data)
            ? deptData.data
            : Array.isArray(deptData?.departments)
              ? deptData.departments
              : [];

        setDepartmentOptions(
          deptsArray.map((d) => ({ label: d.name, value: d.id })),
        );

        if (userDepartmentId) {
          setForm((prev) => ({ ...prev, departmentId: userDepartmentId! }));

          const match = deptsArray.find((d) => d.id === userDepartmentId);
          setLockedDepartmentName(match?.name ?? null);
        } else {
          setLockedDepartmentName(null);
        }
      } catch (err) {
        setFetchError(
          err instanceof Error ? err.message : "Failed to load options",
        );
      } finally {
        setLoadingOptions(false);
      }
    };

    loadOptions();
  }, [dialogOpen]);

  const handleField = <K extends keyof FormState>(
    key: K,
    value: FormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSubmitError(null);
  };

  const resetDialog = () => {
    setForm(DEFAULT_FORM);
    setSubmitError(null);
    setSubmitSuccess(false);
    setFetchError(null);
    setLockedDepartmentName(null);
  };

  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) resetDialog();
  };

  const handleSubmit = async () => {
    if (!form.leavePolicyId)
      return setSubmitError("Please select a leave type.");
    if (!form.departmentId)
      return setSubmitError("Please select a department.");
    if (!form.startDate) return setSubmitError("Please select a start date.");
    if (!form.endDate) return setSubmitError("Please select an end date.");
    if (form.endDate < form.startDate)
      return setSubmitError("End date cannot be before start date.");

    const token = localStorage.getItem("accessToken");
    if (!token)
      return setSubmitError("Access token not found. Please log in again.");

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch(`${BASE_URL}/v1/leave-requests`, {
        method: "POST",
        headers: getHeaders(token),
        body: JSON.stringify({
          leavePolicyId: form.leavePolicyId,
          departmentId: form.departmentId,
          startDate: form.startDate.toISOString(),
          endDate: form.endDate.toISOString(),
          isHalfDay: form.isHalfDay,
          reason: form.reason,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(
          Array.isArray(errData?.message)
            ? errData.message.join(", ")
            : (errData?.message ?? `Request failed (${res.status})`),
        );
      }

      setSubmitSuccess(true);
      onSubmitted?.();
      setTimeout(() => {
        setDialogOpen(false);
        resetDialog();
      }, 1200);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Something went wrong",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-foreground text-lg font-semibold">
            Leave Requests
          </h2>
          <p className="text-muted-foreground text-sm">
            Manage and track all time-off requests
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="cursor-pointer bg-[#1d9c32] p-5 text-white transition-colors duration-200 hover:border-none hover:bg-[#63c072] hover:text-white"
            >
              New Request +
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Leave Request</DialogTitle>
              <DialogDescription>
                Submit a new time-off request for approval
              </DialogDescription>
            </DialogHeader>

            {loadingOptions && (
              <div className="text-muted-foreground flex items-center justify-center gap-2 py-6 text-sm">
                <Loader2 className="size-4 animate-spin" />
                Loading options...
              </div>
            )}

            {!loadingOptions && fetchError && (
              <div className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm">
                {fetchError}
              </div>
            )}

            {!loadingOptions && !fetchError && (
              <>
                <div className="flex flex-col gap-4 py-2">
                  <div className="flex flex-col gap-1.5">
                    <Label>Leave Type</Label>
                    <ResponsiveSelect
                      placeholder="Select leave type"
                      options={policyOptions}
                      value={form.leavePolicyId}
                      onChange={(val) => handleField("leavePolicyId", val)}
                      searchable
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-4 py-2">
                  <div className="flex flex-col gap-1.5">
                    <Label>Department</Label>
                    {lockedDepartmentName ? (
                      <div className="border-input bg-muted/50 text-foreground flex h-9 w-full items-center rounded-md border px-3 text-sm">
                        {lockedDepartmentName}
                      </div>
                    ) : (
                      <ResponsiveSelect
                        placeholder="Select department"
                        options={departmentOptions}
                        value={form.departmentId}
                        onChange={(val) => handleField("departmentId", val)}
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Start Date */}
                  <div className="flex flex-col gap-2">
                    <Label>Start Date</Label>
                    <Popover open={startOpen} onOpenChange={setStartOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !form.startDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 size-4" />
                          {form.startDate
                            ? formatDisplayDate(form.startDate)
                            : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={form.startDate}
                          onSelect={(date) => {
                            handleField("startDate", date);
                            if (date && form.endDate && form.endDate < date) {
                              handleField("endDate", undefined);
                            }
                            setStartOpen(false);
                          }}
                          disabled={disabledDays}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* End Date */}
                  <div className="flex flex-col gap-2">
                    <Label>End Date</Label>
                    <Popover open={endOpen} onOpenChange={setEndOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !form.endDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 size-4" />
                          {form.endDate
                            ? formatDisplayDate(form.endDate)
                            : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={form.endDate}
                          onSelect={(date) => {
                            handleField("endDate", date);
                            setEndOpen(false);
                          }}
                          disabled={[
                            ...disabledDays,
                            ...(form.startDate
                              ? [{ before: form.startDate }]
                              : []),
                          ]}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="flex items-center gap-4 py-2">
                  <Switch
                    id="half-day"
                    checked={form.isHalfDay}
                    onCheckedChange={(checked) =>
                      handleField("isHalfDay", checked)
                    }
                  />
                  <Label htmlFor="half-day" className="text-foreground text-sm">
                    Half-day request
                  </Label>
                </div>

                <div className="flex flex-col gap-2">
                  <Label>Reason</Label>
                  <Textarea
                    rows={3}
                    placeholder="Brief description of your time off..."
                    value={form.reason}
                    onChange={(e) => handleField("reason", e.target.value)}
                  />
                </div>

                <div className="bg-secondary/95 mt-2 rounded-lg border p-3">
                  <div className="flex items-center gap-4 text-sm">
                    <AlertCircle className="text-primary size-4" />
                    <span>Approval Workflow</span>
                  </div>
                  <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                    Your request will be routed: You → Team Lead (Comment) →
                    Dept Head (Approve)
                  </p>
                </div>

                {submitError && (
                  <p className="text-destructive text-sm">{submitError}</p>
                )}
                {submitSuccess && (
                  <p className="text-sm text-green-600">
                    Request submitted successfully!
                  </p>
                )}
              </>
            )}

            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting || loadingOptions || !!fetchError}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Request"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
