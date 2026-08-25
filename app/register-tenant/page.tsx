import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { AuthModeTabs } from "@/components/auth/auth-mode-tabs";
import { RegisterTenantForm } from "@/components/register-tenant-form";

export default function Page() {
  return (
    <AuthSplitLayout
      headline={
        <>
          Set up once,
          <br />
          <em className="text-gold-soft font-medium not-italic">
            roll out
          </em>{" "}
          everywhere.
        </>
      }
    >
      <div className="mx-auto w-full max-w-3xl">
        <AuthModeTabs />
        <RegisterTenantForm />
      </div>
    </AuthSplitLayout>
  );
}
