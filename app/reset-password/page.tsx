import { Suspense } from "react";
import ResetPasswordPage from "@/components/forgot-password";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Suspense fallback={<div>Loading...</div>}>
          <ResetPasswordPage />
        </Suspense>
      </div>
    </div>
  );
}
