"use client";

import { ChangePswdForm } from "@/components/settings/change-pswd";

export function PasswordTab() {
  return (
    <div className="w-full max-w-sm">
      <ChangePswdForm className="ml-0 w-full max-w-none" />
    </div>
  );
}
