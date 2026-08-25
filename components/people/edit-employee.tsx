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
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Loader2 } from "lucide-react";
import { ResponsiveSelect } from "../ui/select";
import { Field, FieldGroup, FieldLabel } from "../ui/field";
import {
  Department,
  Employee,
  ROLES,
} from "@/models/employee-department.types";
import { useEditEmployeeViewModel } from "@/viewmodels/useEditEmployeeViewModel";

type EditEmployeeFormProps = {
  employee: Employee | null;
  departments: Department[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEmployeeUpdated: (employee: Employee) => void;
};

export default function EditEmployeeForm({
  employee,
  departments,
  open,
  onOpenChange,
  onEmployeeUpdated,
}: EditEmployeeFormProps) {
  const vm = useEditEmployeeViewModel(
    employee,
    departments,
    onEmployeeUpdated,
    () => onOpenChange(false),
  );

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingEvent, setPendingEvent] =
    useState<React.FormEvent<HTMLFormElement> | null>(null);

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
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>
              Update employee details and department assignment.
            </DialogDescription>
          </DialogHeader>

          {!employee ? null : vm.success ? (
            <p className="py-10 text-center">Employee Updated</p>
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
                    options={departments.map((d) => ({
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
                  onClick={() => onOpenChange(false)}
                  disabled={vm.loading}
                >
                  Cancel
                </Button>

                <Button type="submit" className="flex-1" disabled={vm.loading}>
                  {vm.loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    "Save Changes"
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
        onOpenChange={(o) => {
          if (!vm.loading) setConfirmOpen(o);
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Save these changes?</DialogTitle>
            <DialogDescription>
              Please confirm you want to update{" "}
              {employee ? `${employee.name}'s` : "this employee's"} details.
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
                  Saving...
                </span>
              ) : (
                "Yes, Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
