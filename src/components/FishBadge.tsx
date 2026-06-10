"use client";

import { clsx } from "clsx";
import { fishBadgeClasses } from "@/lib/fish";
import { fishNames } from "@/lib/i18n";
import type { FishType } from "@/lib/types";
import { useLanguage } from "./LanguageProvider";

export function FishBadge({ fish }: { fish: FishType }) {
  const { lang } = useLanguage();
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold",
        fishBadgeClasses[fish],
      )}
    >
      {fishNames[lang][fish] ?? fish}
    </span>
  );
}
