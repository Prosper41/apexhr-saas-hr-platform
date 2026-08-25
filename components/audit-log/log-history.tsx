import { Search } from "lucide-react";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { ResponsiveSelect } from "../ui/select";

const departmentOptions = [
  { label: "SAP", value: "sap" },
  { label: "Software", value: "software" },
  {
    label: "Educational Content Creation",
    value: "educational-content-creation",
  },
  { label: "HR", value: "hr" },
  { label: "Project Management", value: "project-management" },
  { label: "Corporate", value: "corporate" },
];

const actorOptions = [
  { label: "HR Admin", value: "HR Admin" },
  { label: "Department Head", value: "Department Head" },
  { label: "Team Lead", value: "Team Lead" },
  { label: "Employee", value: "Employee" },
];

const timeOptions = [
  { label: "Last 7 days", value: "last-7-days" },
  { label: "Last 30 days", value: "last-30-days" },
  { label: "Last 90 days", value: "last-90-days" },
  { label: "Last 6 months", value: "last-6-months" },
  { label: "Last year", value: "last-year" },
];

const eventTypeOptions = [
  { label: "All Event Types", value: "all-event-types" },
  { label: "Login", value: "login" },
  { label: "Logout", value: "logout" },
  { label: "Data Access", value: "data-access" },
  { label: "Permission Change", value: "permission-change" },
  { label: "System Error", value: "system-error" },
];
export default function LogHistory() {
  return (
    <main>
      <div className="mb-8 flex flex-col gap-4">
        <h2 className="text-xl font-bold">Audit Log</h2>
        <p className="text-gray-600">
          This is where the log history will be displayed.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="mb-5 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card className="p-4">
          <p className="text-muted-foreground text-sm">Total Events(30days)</p>
          <p className="text-2xl font-bold">108</p>
        </Card>

        <Card className="p-4">
          <p className="text-muted-foreground text-sm">Manual Overrides</p>
          <p className="text-2xl font-bold text-red-600">47</p>
        </Card>

        <Card className="p-4">
          <p className="text-muted-foreground text-sm">Unique actors</p>
          <p className="text-2xl font-bold">11</p>
        </Card>

        <Card className="p-4">
          <p className="text-muted-foreground text-sm">Average Events/day</p>
          <p className="text-2xl font-bold">9</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            placeholder="Search by name or reason..."
            className="h-10 w-full pl-9"
          />
        </div>
        <div className="w-full sm:w-[160px]">
          <ResponsiveSelect
            placeholder="All Event Types"
            options={eventTypeOptions}
            searchable
          />
        </div>
        <div className="w-full sm:w-[220px]">
          <ResponsiveSelect
            placeholder="Department"
            options={departmentOptions}
            searchable
          />
        </div>
        <div className="w-full sm:w-[220px]">
          <ResponsiveSelect
            placeholder="Last 30 days"
            options={timeOptions}
            searchable
          />
        </div>
        <div className="w-full sm:w-[220px]">
          <ResponsiveSelect
            placeholder="All Actors"
            options={actorOptions}
            searchable
          />
        </div>
      </div>
    </main>
  );
}
