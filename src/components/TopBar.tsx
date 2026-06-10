import Link from "next/link";
import { Waves } from "lucide-react";

export function TopBar({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="flex items-center justify-between gap-4 px-4 py-5 sm:px-8">
      <Link href="/" className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-2xl bg-ocean-accent/15 text-ocean-accent ring-1 ring-ocean-accent/30">
          <Waves className="size-6" />
        </span>
        <span>
          <span className="block text-xl font-black tracking-wide text-white">
            Teniz
          </span>
          <span className="block text-xs font-medium text-cyan-100/60">
            Caspian fishery OS
          </span>
        </span>
      </Link>
      <div className="text-right">
        <h1 className="text-lg font-black text-white sm:text-2xl">{title}</h1>
        {subtitle ? (
          <p className="hidden text-sm text-cyan-100/60 sm:block">{subtitle}</p>
        ) : null}
      </div>
    </header>
  );
}
