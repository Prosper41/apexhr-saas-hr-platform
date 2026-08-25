"use client";

import { useId, useState, InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  rightSlot?: ReactNode;
  isPassword?: boolean;
}

export function AuthField({
  label,
  rightSlot,
  isPassword,
  className,
  id,
  ...props
}: AuthFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [visible, setVisible] = useState(false);

  return (
    <div className="mb-6">
      <div className="mb-2.5 flex items-baseline justify-between">
        <label
          htmlFor={inputId}
          className="font-[family-name:var(--font-plex-mono)] text-[10.5px] tracking-[0.1em] text-[#8f8a80] uppercase"
        >
          {label}
        </label>
        {rightSlot}
      </div>
      <div className="group relative">
        <input
          id={inputId}
          type={isPassword ? (visible ? "text" : "password") : props.type}
          className={cn(
            "w-full border-0 border-b border-[#ddd8cb] bg-transparent px-0.5 pt-1.5 pb-3 text-[15.5px] text-black outline-none placeholder:text-[#b7b2a4] focus:border-[#ab8853]",
            className,
          )}
          {...props}
        />
        <span className="pointer-events-none absolute inset-x-0 -bottom-px h-px w-0 bg-[#ab8853] transition-all duration-300 group-focus-within:w-full" />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute top-1 right-0.5 text-[#8f8a80] hover:text-black"
            aria-label={visible ? "Hide password" : "Show password"}
          >
            {visible ? (
              <EyeOff size={18} strokeWidth={1.6} />
            ) : (
              <Eye size={18} strokeWidth={1.6} />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
