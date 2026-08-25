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
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Loader2 } from "lucide-react";
import { useCreateDepartmentViewModel } from "@/viewmodels/useCreateDepartmentViewModel";

export default function NewDepartment() {
  const vm = useCreateDepartmentViewModel();

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
    <div className="flex items-center justify-between">
      <div className="ml-4">
        <h2 className="text-foreground text-lg font-semibold">Departments</h2>
        <p className="text-muted-foreground text-sm">
          Manage and organise your company departments
        </p>
      </div>

      <Dialog
        open={vm.dialogOpen}
        onOpenChange={(open) => (open ? vm.openDialog() : vm.closeDialog())}
      >
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer bg-[#ebb521] p-5 text-white transition-colors duration-200 hover:border-none hover:bg-[#d6be38] hover:text-white"
          >
            New Department +
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Department</DialogTitle>
            <DialogDescription>
              Add a new department, define its purpose, and assign a head.
            </DialogDescription>
          </DialogHeader>

          {vm.success ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-foreground font-medium">Department Created</p>
              <p className="text-muted-foreground text-sm">
                The department has been added successfully.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleFormSubmit}
              className="flex flex-col gap-4 pt-2"
            >
              <div className="flex flex-col gap-1.5">
                <Label>Department Name *</Label>
                <Input
                  value={vm.form.name}
                  onChange={vm.setField("name")}
                  placeholder="e.g. Software Development"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>Description *</Label>
                <textarea
                  rows={3}
                  value={vm.form.description}
                  onChange={vm.setField("description")}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  placeholder="Describe department..."
                />
              </div>

              {vm.error && (
                <p className="text-destructive text-sm">{vm.error}</p>
              )}

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
                    "Create Department"
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
            <DialogTitle>Create this department?</DialogTitle>
            <DialogDescription>
              Please confirm you want to create the department &quot;
              {vm.form.name || "Untitled"}&quot;.
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
                "Yes, Create Department"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
