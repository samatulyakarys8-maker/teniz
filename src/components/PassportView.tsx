"use client";

import Link from "next/link";
import { CalendarDays, MapPin, ShieldCheck, Waves } from "lucide-react";
import { FishBadge } from "@/components/FishBadge";
import { useLanguage } from "@/components/LanguageProvider";
import type { Passport } from "@/lib/types";

export function PassportView({ passport }: { passport: Passport }) {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-ocean-radial px-4 py-6 text-white sm:px-8">
      <section className="mx-auto max-w-3xl">
        <Link href="/" className="mb-8 flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-ocean-accent text-ocean-bg">
            <Waves className="size-6" />
          </span>
          <span className="text-xl font-black">Teniz</span>
        </Link>

        <div className="panel overflow-hidden">
          <div className="relative min-h-64 bg-[#071120]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={passport.photo_url || "/fish-demo.svg"} alt={passport.fish_type} className="h-72 w-full object-cover opacity-78" />
            <div className="absolute inset-0 bg-gradient-to-t from-ocean-card via-ocean-card/40 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5">
              <FishBadge fish={passport.fish_type} />
              <h1 className="mt-4 text-4xl font-black">{t.passport.title}</h1>
              <p className="mt-2 font-mono text-ocean-accent">{passport.qr_code}</p>
            </div>
          </div>

          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <Info title={t.passport.fisherman} value={passport.fisherman.name} />
            <Info title={t.passport.phone} value={passport.fisherman.phone} />
            <Info title={t.passport.weight} value={`${passport.weight_kg} кг`} />
            <Info title={t.passport.size} value={`${passport.size_cm} см`} />
            <Info title={t.passport.coords} value={`${passport.latitude.toFixed(4)}, ${passport.longitude.toFixed(4)}`} icon={<MapPin className="size-5" />} />
            <Info
              title={t.passport.date}
              value={new Intl.DateTimeFormat("ru-KZ", { dateStyle: "medium", timeStyle: "short" }).format(new Date(passport.created_at))}
              icon={<CalendarDays className="size-5" />}
            />
          </div>

          <div className="border-t border-white/10 p-5">
            <div className={`flex items-center gap-3 rounded-3xl p-4 ${passport.is_legal ? "bg-risk-green/12 text-risk-green" : "bg-risk-red/12 text-risk-red"}`}>
              <ShieldCheck className="size-6" />
              <div>
                <p className="font-black">{passport.is_legal ? t.passport.legal : t.passport.release}</p>
                <p className="text-sm text-cyan-100/65">{passport.ai_verdict?.["причина"] ?? t.passport.fallback}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Info({ title, value, icon }: { title: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-ocean-panel p-4">
      <div className="flex items-center gap-2 text-sm font-bold text-cyan-100/55">
        {icon}
        {title}
      </div>
      <p className="mt-2 text-lg font-black">{value}</p>
    </div>
  );
}
