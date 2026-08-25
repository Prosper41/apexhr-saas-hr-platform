"use client";

import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCreatePolicyViewModel } from "@/viewmodels/useCreateLeavePoliciesViewModel";
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
  onCreated: (policy: Policy) => void;
};

export default function CreatePolicy({ onCreated }: Props) {
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
  } = useCreatePolicyViewModel({ onCreated });

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="cursor-pointer">
          <Plus className="size-4" />
          Create Policy
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Policy</DialogTitle>
          <DialogDescription className="text-muted-foreground mb-8 text-xs">
            Configure a leave policy for your organization.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
            <p className="font-medium">Policy Created Successfully</p>
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
                    Creating...
                  </>
                ) : (
                  "Create Policy"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
