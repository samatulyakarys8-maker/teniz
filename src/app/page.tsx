"use client";

import Link from "next/link";
import { Fish, Search, ShieldCheck, Waves } from "lucide-react";
import { LanguageSwitch, useLanguage } from "@/components/LanguageProvider";

const roleCards = [
  { key: "fisherman", href: "/fisherman", icon: Fish },
  { key: "buyer", href: "/buyer", icon: Search },
  { key: "inspector", href: "/inspector", icon: ShieldCheck },
] as const;

export default function LandingPage() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen overflow-hidden bg-ocean-radial px-4 py-6 text-white sm:px-8">
      <section className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-7xl flex-col">
        <nav className="relative flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-ocean-accent text-ocean-bg shadow-glow">
              <Waves className="size-7" />
            </span>
            <div>
              <p className="text-2xl font-black tracking-wide">Teniz</p>
              <p className="hidden text-sm text-cyan-100/60 sm:block">{t.tagline}</p>
            </div>
          </div>
          <div className="fixed right-4 top-8 z-50 sm:static">
            <LanguageSwitch />
          </div>
        </nav>

        <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="min-w-0 max-w-full">
            <div className="mb-8 inline-flex rounded-full border border-ocean-accent/30 bg-ocean-accent/10 px-4 py-2 text-sm font-semibold text-ocean-accent">
              {t.roleCta}
            </div>
            <h1 className="max-w-3xl text-[2.35rem] font-black leading-[1.04] tracking-tight sm:text-7xl">
              <span className="sm:hidden">
                {t.heroMobile.map((line) => (
                  <span key={line}>
                    {line}
                    <br />
                  </span>
                ))}
              </span>
              <span className="hidden sm:inline">{t.heroDesktop}</span>
            </h1>
            <p className="mt-6 max-w-[22rem] text-lg leading-8 text-cyan-100/72 sm:max-w-2xl">
              {t.heroText}
            </p>
          </div>

          <div className="grid min-w-0 max-w-full gap-4 md:grid-cols-3 lg:grid-cols-1">
            {roleCards.map((role) => {
              const Icon = role.icon;
              const copy = t.roles[role.key];
              return (
                <Link
                  href={role.href}
                  key={role.href}
                  className="group panel relative overflow-hidden p-6 transition hover:-translate-y-1 hover:border-ocean-accent/40 hover:shadow-glow"
                >
                  <div className="absolute right-0 top-0 h-28 w-28 rounded-bl-[4rem] bg-ocean-accent/10 transition group-hover:bg-ocean-accent/20" />
                  <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:gap-5">
                    <span className="grid size-14 shrink-0 place-items-center rounded-3xl bg-white/8 text-ocean-accent ring-1 ring-white/10">
                      <Icon className="size-7" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-2xl font-black">{copy.title}</span>
                      <span className="block text-sm font-semibold text-ocean-accent">
                        {copy.subtitle}
                      </span>
                      <span className="mt-3 block break-words text-[0.95rem] leading-7 text-cyan-100/68 sm:text-base">
                        {copy.text}
                      </span>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
