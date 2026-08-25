import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { AuthModeTabs } from "@/components/auth/auth-mode-tabs";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <AuthSplitLayout
      headline={
        <>
          Structure, made
          <br />
          <em className="font-medium text-[#c7a878] not-italic">legible.</em>
        </>
      }
    >
      <AuthModeTabs />
      <h1 className="mb-9 font-[family-name:var(--font-fraunces)] text-[29px] font-medium tracking-tight">
        Welcome back
      </h1>
      <LoginForm />
    </AuthSplitLayout>
  );
}
