import { ReactNode } from "react";
import Link from "next/link";
import { AuthOrgChart } from "./auth-org-chart";
import { AuthBackgroundSleeks } from "./auth-background-sleeks";

export function AuthSplitLayout({
  headline,
  children,
}: {
  headline: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-screen md:grid-cols-[44%_56%]">
      <div className="relative flex flex-col justify-between overflow-hidden bg-[#0b0b0a] px-7 py-10 text-white md:px-14 md:py-13">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(171,136,83,.28) 1px, transparent 1px), linear-gradient(90deg, rgba(171,136,83,.28) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage:
              "radial-gradient(circle at 30% 30%, black, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(circle at 30% 30%, black, transparent 75%)",
          }}
        />

        <AuthBackgroundSleeks />

        <Link
          href="/"
          className="relative w-fit font-[family-name:var(--font-fraunces)] text-[26px] font-medium tracking-tight transition-opacity hover:opacity-80"
        >
          Apex<span className="text-[#c7a878]">HR</span>
        </Link>

        <div className="relative max-w-[360px]">
          <h2 className="font-[family-name:var(--font-fraunces)] text-[32px] leading-[1.18] font-light md:text-[38px]">
            {headline}
          </h2>
          <AuthOrgChart />
        </div>

        <div className="relative flex items-end justify-between font-[family-name:var(--font-plex-mono)] text-[11px] tracking-wider text-white/55">
          <span>ApexHR © {new Date().getFullYear()}</span>
          <span className="text-[#c7a878]">multi-tenant</span>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-12 md:px-10">
        <div className="w-full max-w-[400px]">{children}</div>
      </div>
    </div>
  );
}
