"use client";

import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function AuthSubmitButton({
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "group relative mt-1 w-full overflow-hidden bg-black px-4 py-4 text-[14.5px] font-medium tracking-wide text-white transition-colors disabled:opacity-60",
        className,
      )}
    >
      <span className="relative z-10">{children}</span>
      <span className="absolute inset-0 -translate-x-full bg-[#8a6d40] transition-transform duration-300 group-hover:translate-x-0" />
    </button>
  );
}
