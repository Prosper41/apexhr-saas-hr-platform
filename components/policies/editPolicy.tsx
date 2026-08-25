"use client";

import { Pencil, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useEditPolicyViewModel } from "@/viewmodels/useEditLeavePoliciesViewModel";
import {
  LEAVE_TYPES,
  ACCRUAL_FREQUENCIES,
  ACCRUAL_LABELS,
  CARRY_OVER_POLICIES,
} from "@/models/policy.types";
import type { Policy } from "@/models/policy.types";

const SELECT_CLASS =
  "w-full rounded-md border px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring";

type Props = {
  policy: Policy;
  onUpdated: (policy: Policy) => void;
};

export default function EditPolicy({ policy, onUpdated }: Props) {
  const {
    dialogOpen,
    form,
    loading,
    error,
    success,
    setField,
    setIsActive,
    handleSubmit,
    handleOpenChange,
  } = useEditPolicyViewModel({ policy, onUpdated });

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      {/* Trigger sits inline in the dropdown menu, next to Delete */}
      <DropdownMenuItem
        onSelect={(e) => {
          e.preventDefault();
          handleOpenChange(true);
        }}
      >
        <Pencil className="mr-2 size-3.5" />
        Edit
      </DropdownMenuItem>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Policy</DialogTitle>
          <DialogDescription className="text-muted-foreground mb-8 text-xs">
            Update the leave policy settings.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
            <p className="font-medium">Policy Updated Successfully</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <Label className="mb-2">Policy Name *</Label>
              <Input
                value={form.name}
                onChange={setField("name")}
                placeholder="e.g. Annual Leave"
                required
              />
            </div>

            <div>
              <Label className="mb-2">Description</Label>
              <textarea
                value={form.description}
                onChange={setField("description")}
                className="w-full rounded-md border px-3 py-2 text-sm"
                placeholder="Describe the policy..."
              />
            </div>

            <div>
              <Label className="mb-2">Type *</Label>
              <select
                value={form.type}
                onChange={setField("type")}
                className={SELECT_CLASS}
                required
              >
                <option value="" disabled>
                  Select a type
                </option>
                {LEAVE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className="mb-2">Accrual *</Label>
              <select
                value={form.accrual}
                onChange={setField("accrual")}
                className={SELECT_CLASS}
                required
              >
                <option value="" disabled>
                  Select accrual frequency
                </option>
                {ACCRUAL_FREQUENCIES.map((f) => (
                  <option key={f} value={f}>
                    {ACCRUAL_LABELS[f]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className="mb-2">Accrual Rate (days)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.accrualRate}
                onChange={setField("accrualRate")}
                placeholder="e.g. 1.67"
                required
              />
            </div>

            <div>
              <Label className="mb-2">Max Balance (days)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.maxBalance}
                onChange={setField("maxBalance")}
                placeholder="e.g. 20"
                required
              />
            </div>

            <div>
              <Label className="mb-2">Carry Over Policy *</Label>
              <select
                value={form.carryOverPolicy}
                onChange={setField("carryOverPolicy")}
                className={SELECT_CLASS}
                required
              >
                {CARRY_OVER_POLICIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {form.carryOverPolicy === "Limited" && (
              <div>
                <Label className="mb-2">Carry Over Limit (days)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.carryOverLimit}
                  onChange={setField("carryOverLimit")}
                  placeholder="e.g. 5"
                />
              </div>
            )}

            <div>
              <Label className="mb-2">Waiting Period (days)</Label>
              <Input
                type="number"
                min="0"
                step="1"
                value={form.waitingPeriodDays}
                onChange={setField("waitingPeriodDays")}
                placeholder="e.g. 90 (leave blank for none)"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={setIsActive}
              />
            </div>

            {error && <p className="text-destructive text-sm">{error}</p>}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
