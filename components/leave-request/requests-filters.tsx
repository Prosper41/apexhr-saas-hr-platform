"use client";

import { CalendarIcon, Search } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { ResponsiveSelect } from "../ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { cn } from "@/lib/utils";
import { jwtDecode } from "jwt-decode";
import { fetchPolicies } from "@/services/policy.service";
import { BASE_URL, getHeaders } from "@/lib/api";

interface SelectOption {
  label: string;
  value: string;
}

interface Department {
  id: string;
  name: string;
  [key: string]: unknown;
}

interface DecodedToken {
  role: string;
}

const monthOptions: SelectOption[] = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
].map((label, i) => ({ label, value: String(i + 1) }));

function formatDisplayDate(date: Date | undefined): string {
  if (!date) return "";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function useFilterOptions(includeDepartments: boolean) {
  const [policyOptions, setPolicyOptions] = useState<SelectOption[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<SelectOption[]>(
    [],
  );
  const [loadingOptions, setLoadingOptions] = useState(false);

  useEffect(() => {
    const loadOptions = async () => {
      setLoadingOptions(true);
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setLoadingOptions(false);
        return;
      }

      let userRole: string | null = null;
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        userRole = decoded?.role ?? null;
      } catch {
        userRole = null;
      }

      try {
        if (includeDepartments) {
          const [policies, departmentsRes] = await Promise.all([
            fetchPolicies(token, userRole),
            fetch(`${BASE_URL}/v1/department`, {
              method: "GET",
              headers: getHeaders(token),
            }),
          ]);

          setPolicyOptions(
            policies.map((p) => ({ label: p.name, value: p.id })),
          );

          if (departmentsRes.ok) {
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
          }
        } else {
          const policies = await fetchPolicies(token, userRole);
          setPolicyOptions(
            policies.map((p) => ({ label: p.name, value: p.id })),
          );
        }
      } catch {
      } finally {
        setLoadingOptions(false);
      }
    };

    loadOptions();
  }, [includeDepartments]);

  return { policyOptions, departmentOptions, loadingOptions };
}

export interface RequestFilterValues {
  search: string;
  leavePolicyId: string;
  month: string;
  dateRequested: Date | undefined;
}

const DEFAULT_REQUEST_FILTERS: RequestFilterValues = {
  search: "",
  leavePolicyId: "",
  month: "",
  dateRequested: undefined,
};

export default function RequestFilters({
  onFilterChange,
}: {
  onFilterChange?: (filters: RequestFilterValues) => void;
}) {
  const { policyOptions, loadingOptions } = useFilterOptions(false);

  const [filters, setFilters] = useState<RequestFilterValues>(
    DEFAULT_REQUEST_FILTERS,
  );
  const [searchInput, setSearchInput] = useState("");
  const [dateOpen, setDateOpen] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput }));
    }, 350);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    onFilterChange?.(filters);
  }, [filters, onFilterChange]);

  const updateFilter = useCallback(
    <K extends keyof RequestFilterValues>(
      key: K,
      value: RequestFilterValues[K],
    ) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <div className="relative flex-1 sm:min-w-[200px]">
            <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
            <Input
              placeholder="Search by leave type or reason..."
              className="h-10 w-full pl-9"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          <div className="w-full sm:w-[160px]">
            <ResponsiveSelect
              placeholder="Leave type"
              options={policyOptions}
              value={filters.leavePolicyId}
              onChange={(val) => updateFilter("leavePolicyId", val)}
              searchable
              disabled={loadingOptions}
            />
          </div>

          <div className="w-full sm:w-[150px]">
            <ResponsiveSelect
              placeholder="Month"
              options={monthOptions}
              value={filters.month}
              onChange={(val) => updateFilter("month", val)}
              searchable
            />
          </div>

          <div className="w-full sm:w-[170px]">
            <Popover open={dateOpen} onOpenChange={setDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "h-10 w-full justify-start text-left font-normal",
                    !filters.dateRequested && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 size-4" />
                  {filters.dateRequested
                    ? formatDisplayDate(filters.dateRequested)
                    : "Date requested"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.dateRequested}
                  onSelect={(date) => {
                    updateFilter("dateRequested", date);
                    setDateOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export interface AllLeaveRequestFilterValues {
  search: string;
  departmentId: string;
  month: string; // "1"-"12", "" = all
  leavePolicyId: string;
}

const DEFAULT_ALL_LEAVE_FILTERS: AllLeaveRequestFilterValues = {
  search: "",
  departmentId: "",
  month: "",
  leavePolicyId: "",
};

export function AllLeaveRequestFilters({
  onFilterChange,
}: {
  onFilterChange?: (filters: AllLeaveRequestFilterValues) => void;
}) {
  const { policyOptions, departmentOptions, loadingOptions } =
    useFilterOptions(true);

  const [filters, setFilters] = useState<AllLeaveRequestFilterValues>(
    DEFAULT_ALL_LEAVE_FILTERS,
  );
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput }));
    }, 350);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    onFilterChange?.(filters);
  }, [filters, onFilterChange]);

  const updateFilter = useCallback(
    <K extends keyof AllLeaveRequestFilterValues>(
      key: K,
      value: AllLeaveRequestFilterValues[K],
    ) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <div className="relative flex-1 sm:min-w-[200px]">
            <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
            <Input
              placeholder="Search by name or ID..."
              className="h-10 w-full pl-9"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          <div className="w-full sm:w-[220px]">
            <ResponsiveSelect
              placeholder="Department"
              options={departmentOptions}
              value={filters.departmentId}
              onChange={(val) => updateFilter("departmentId", val)}
              searchable
              disabled={loadingOptions}
            />
          </div>

          <div className="w-full sm:w-[150px]">
            <ResponsiveSelect
              placeholder="Month"
              options={monthOptions}
              value={filters.month}
              onChange={(val) => updateFilter("month", val)}
              searchable
            />
          </div>

          <div className="w-full sm:w-[200px]">
            <ResponsiveSelect
              placeholder="Leave type"
              options={policyOptions}
              value={filters.leavePolicyId}
              onChange={(val) => updateFilter("leavePolicyId", val)}
              searchable
              disabled={loadingOptions}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
