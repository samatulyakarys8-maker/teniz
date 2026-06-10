import { clsx } from "clsx";
import { fishBadgeClasses } from "@/lib/fish";
import type { FishType } from "@/lib/types";

export function FishBadge({ fish }: { fish: FishType }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold",
        fishBadgeClasses[fish],
      )}
    >
      {fish}
    </span>
  );
}
