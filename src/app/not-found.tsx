"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";

export default function NotFound() {
  const { t } = useLanguage();
  return (
    <main className="grid min-h-screen place-items-center bg-ocean-radial px-4 text-center text-white">
      <div className="panel max-w-md p-8">
        <p className="text-sm font-bold text-ocean-accent">404</p>
        <h1 className="mt-3 text-3xl font-black">{t.passport.notFound}</h1>
        <p className="mt-3 text-cyan-100/65">{t.passport.notFoundText}</p>
        <Link href="/buyer" className="tap-target mt-6 inline-flex bg-ocean-accent text-ocean-bg">
          {t.passport.back}
        </Link>
      </div>
    </main>
  );
}
