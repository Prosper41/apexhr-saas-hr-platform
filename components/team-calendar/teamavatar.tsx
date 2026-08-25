import { cn } from "@/lib/utils";
import type { AvatarColor } from "@/models/calendar.types";

const colorMap: Record<AvatarColor, string> = {
  blue: "bg-blue-100 text-blue-800",
  teal: "bg-teal-100 text-teal-800",
  coral: "bg-orange-100 text-orange-800",
  purple: "bg-purple-100 text-purple-800",
  amber: "bg-amber-100 text-amber-800",
};

interface TeamAvatarProps {
  initials: string;
  color: AvatarColor;
  size?: "sm" | "md";
}

export function TeamAvatar({ initials, color, size = "sm" }: TeamAvatarProps) {
  return (
    <div
      className={cn(
        "flex flex-shrink-0 items-center justify-center rounded-full font-medium",
        colorMap[color],
        size === "sm" ? "h-7 w-7 text-[10px]" : "h-8 w-8 text-xs",
      )}
    >
      {initials}
    </div>
  );
}
