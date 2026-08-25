"use client";

import { useState } from "react";
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
import { Input } from "../ui/input";
import { Loader2 } from "lucide-react";
import { ResponsiveSelect } from "../ui/select";
import { Field, FieldGroup, FieldLabel } from "../ui/field";
import { Employee, ROLES } from "@/models/employee-department.types";
import { useAddEmployeeViewModel } from "@/viewmodels/useAddEmployeeViewModel";

type AddEmployeeFormProps = {
  onEmployeeCreated: (employee: Employee) => void;
};

export default function AddEmployeeForm({
  onEmployeeCreated,
}: AddEmployeeFormProps) {
  const vm = useAddEmployeeViewModel(onEmployeeCreated);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingEvent, setPendingEvent] =
    useState<React.FormEvent<HTMLFormElement> | null>(null);

  // Intercepts the native submit — opens the confirmation dialog instead
  // of calling vm.handleSubmit directly. React 17+ doesn't pool events,
  // so it's safe to hold onto this event until the user confirms.
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPendingEvent(e);
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    setConfirmOpen(false);
    if (pendingEvent) {
      vm.handleSubmit(pendingEvent);
      setPendingEvent(null);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <Dialog
        open={vm.dialogOpen}
        onOpenChange={(open) => (open ? vm.openDialog() : vm.closeDialog())}
      >
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer bg-[#1d9c32] p-5 text-white transition-colors duration-200 hover:border-none hover:bg-[#63c072] hover:text-white"
          >
            Add Employee +
          </Button>
        </DialogTrigger>

        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add an Employee</DialogTitle>
            <DialogDescription>
              Add a new employee, details, and assign the person to a
              department.
            </DialogDescription>
          </DialogHeader>

          {vm.success ? (
            <p className="py-10 text-center">Employee Added</p>
          ) : (
            <form
              onSubmit={handleFormSubmit}
              className="flex flex-col gap-4 pt-2"
            >
              <FieldGroup className="grid gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel>First Name *</FieldLabel>
                  <Input
                    value={vm.form.firstName}
                    onChange={vm.setField("firstName")}
                  />
                </Field>

                <Field>
                  <FieldLabel>Last Name *</FieldLabel>
                  <Input
                    value={vm.form.lastName}
                    onChange={vm.setField("lastName")}
                  />
                </Field>

                <Field className="md:col-span-2">
                  <FieldLabel>Contact *</FieldLabel>
                  <Input
                    value={vm.form.contact}
                    onChange={vm.setField("contact")}
                  />
                </Field>

                <Field className="md:col-span-2">
                  <FieldLabel>Department *</FieldLabel>
                  <ResponsiveSelect
                    value={vm.form.departmentId}
                    onChange={vm.setDepartment}
                    options={vm.departments.map((d) => ({
                      label: d.name,
                      value: d.id,
                    }))}
                    searchable
                  />
                </Field>

                <Field className="md:col-span-2">
                  <FieldLabel>Role *</FieldLabel>
                  <ResponsiveSelect
                    placeholder="Select role"
                    value={vm.form.role}
                    onChange={vm.setRole}
                    options={ROLES.map((r) => ({ label: r.name, value: r.id }))}
                    searchable
                  />
                </Field>

                <Field className="md:col-span-2">
                  <FieldLabel>House Address *</FieldLabel>
                  <Input
                    value={vm.form.houseAddress}
                    onChange={vm.setField("houseAddress")}
                  />
                </Field>

                <Field className="md:col-span-2">
                  <FieldLabel>Date of Birth *</FieldLabel>
                  <Input
                    type="date"
                    value={vm.form.dateOfBirth}
                    onChange={vm.setField("dateOfBirth")}
                  />
                </Field>

                <Field className="md:col-span-2">
                  <FieldLabel>Work Email *</FieldLabel>
                  <Input
                    type="email"
                    value={vm.form.workEmail}
                    onChange={vm.setField("workEmail")}
                  />
                </Field>

                {vm.error && (
                  <p className="text-destructive text-sm md:col-span-2">
                    {vm.error}
                  </p>
                )}
              </FieldGroup>

              <div className="flex gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={vm.closeDialog}
                  disabled={vm.loading}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  className="flex-1 cursor-pointer"
                  disabled={vm.loading}
                >
                  {vm.loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </span>
                  ) : (
                    "Add Employee"
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation dialog */}
      <Dialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!vm.loading) setConfirmOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Add this employee?</DialogTitle>
            <DialogDescription>
              Please confirm you want to add {vm.form.firstName || "this"}{" "}
              {vm.form.lastName} as a new employee.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-2">
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={vm.loading}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={vm.loading}>
              {vm.loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </span>
              ) : (
                "Yes, Add Employee"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
