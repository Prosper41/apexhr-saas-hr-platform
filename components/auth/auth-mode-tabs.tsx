"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "Log in", href: "/login" },
  { label: "Register company", href: "/register-tenant" },
];

export function AuthModeTabs() {
  const pathname = usePathname();

  return (
    <div className="mb-11 flex gap-7 border-b border-[#e9e5db]">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "relative pb-3.5 text-sm font-medium transition-colors",
              active ? "text-black" : "text-[#8f8a80] hover:text-black",
            )}
          >
            {tab.label}
            <span
              className={cn(
                "absolute inset-x-0 -bottom-px h-0.5 origin-left bg-[#ab8853] transition-transform duration-300",
                active ? "scale-x-100" : "scale-x-0",
              )}
            />
          </Link>
        );
      })}
    </div>
  );
}
