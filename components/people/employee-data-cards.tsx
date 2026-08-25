"use client";

import { useState } from "react";
import {
  Building2,
  Cake,
  Calendar,
  Loader2,
  Mail,
  MapPin,
  MoreHorizontal,
  PencilIcon,
  Phone,
  Search,
  Trash2Icon,
} from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { ResponsiveSelect } from "../ui/select";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import AddEmployeeForm from "./add-employee";
import EditEmployeeForm from "./edit-employee";
import {
  Employee,
  STATUS_CONFIG,
  STATUS_OPTIONS,
} from "@/models/employee-department.types";
import { useEmployeeListViewModel } from "@/viewmodels/useEmployeeListViewModel";

export default function EmployeeDataCards() {
  const vm = useEmployeeListViewModel();

  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  function openEditDialog(emp: Employee) {
    setEditingEmployee(emp);
    setEditDialogOpen(true);
  }

  async function handleDelete(emp: Employee) {
    const confirmed = window.confirm(
      `Delete ${emp.name}? This action cannot be undone.`,
    );
    if (!confirmed) return;
    await vm.removeEmployeeFromList(emp.id);
  }

  return (
    <div className="m-2.5">
      {/* Header / Add Employee */}
      <div className="mb-5 flex justify-between">
        <AddEmployeeForm onEmployeeCreated={vm.addEmployee} />
      </div>

      {vm.deleteError && (
        <p className="text-destructive mb-3 text-sm">{vm.deleteError}</p>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card className="p-4">
          <p className="text-2xl font-bold">{vm.employees.length}</p>
          <p className="text-muted-foreground text-sm">Total Employees</p>
        </Card>

        <Card className="p-4">
          <p className="text-2xl font-bold text-emerald-700">
            {vm.employees.filter((e) => e.status === "active").length}
          </p>
          <p className="text-muted-foreground text-sm">Active</p>
        </Card>

        <Card className="p-4">
          <p className="text-2xl font-bold text-red-600">
            {vm.employees.filter((e) => e.status === "on-leave").length}
          </p>
          <p className="text-muted-foreground text-sm">On Leave</p>
        </Card>

        <Card className="p-4">
          <p className="text-2xl font-bold">{vm.departments.length}</p>
          <p className="text-muted-foreground text-sm">Departments</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="flex items-center gap-2 rounded-md border px-3 py-2">
          <Search className="size-4" />
          <Input
            placeholder="Search employees..."
            value={vm.searchQuery}
            onChange={(e) => vm.setSearchQuery(e.target.value)}
            className="border-0 focus-visible:ring-0"
          />
        </div>

        <ResponsiveSelect
          value={vm.selectedDepartment}
          onChange={vm.setSelectedDepartment}
          options={vm.departmentOptions}
          searchable
        />

        <ResponsiveSelect
          value={vm.selectedStatus}
          onChange={vm.setSelectedStatus}
          options={[...STATUS_OPTIONS]}
          searchable
        />
      </div>

      {/* Employee Grid */}
      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {vm.loadingEmployees ? (
          <p className="col-span-full py-10 text-center">
            Loading employees...
          </p>
        ) : vm.fetchError ? (
          <p className="col-span-full py-10 text-center text-red-500">
            {vm.fetchError}
          </p>
        ) : vm.filteredEmployees.length === 0 ? (
          <p className="col-span-full py-10 text-center">No employees found.</p>
        ) : (
          vm.filteredEmployees.map((emp) => {
            const statusInfo =
              STATUS_CONFIG[emp.status] ?? STATUS_CONFIG.inactive;
            const isDeleting = vm.deletingId === emp.id;

            return (
              <Card key={`${emp.id}-${emp.email}`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex gap-3">
                      <Avatar>
                        <AvatarFallback>{emp.avatar}</AvatarFallback>
                      </Avatar>

                      <div>
                        <p className="font-semibold">{emp.name}</p>
                        <p className="text-muted-foreground text-xs">
                          {emp.role}
                        </p>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 shrink-0 cursor-pointer"
                          disabled={isDeleting}
                        >
                          {isDeleting ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <MoreHorizontal className="size-4" />
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {/* <DropdownMenuItem>View Profile</DropdownMenuItem> */}
                        <DropdownMenuItem onClick={() => openEditDialog(emp)}>
                          <PencilIcon className="mr-2 size-3.5" />
                          Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Calendar className="mr-2 size-3.5" />
                          View Leave History
                        </DropdownMenuItem>
                        {vm.canDelete && (
                          <DropdownMenuItem
                            onClick={() => handleDelete(emp)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2Icon className="mr-2 size-3.5" />
                            Delete Employee
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex gap-2">
                      <Building2 className="size-3.5" />
                      {emp.department}
                    </div>
                    <div className="flex gap-2">
                      <Mail className="size-3.5" />
                      {emp.email}
                    </div>
                    <div className="flex gap-2">
                      <MapPin className="size-3.5" />
                      {emp.location}
                    </div>
                    <div className="flex gap-2">
                      <Phone className="size-3.5" />
                      {emp.contact}
                    </div>
                    <div className="flex gap-2">
                      <Cake className="size-4" />
                      {emp.dateofbirth}
                    </div>
                  </div>

                  <div className="mt-3 flex justify-between">
                    <Badge className={statusInfo.className}>
                      {statusInfo.label}
                    </Badge>
                    <span className="text-muted-foreground text-[10px]">
                      {emp.id}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <EditEmployeeForm
        employee={editingEmployee}
        departments={vm.departments}
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) setEditingEmployee(null);
        }}
        onEmployeeUpdated={vm.updateEmployeeInList}
      />
    </div>
  );
}
