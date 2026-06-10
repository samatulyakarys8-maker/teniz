"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { type Lang, ui } from "@/lib/i18n";

type LanguageContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (typeof ui)[Lang];
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ru");

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("lang");
    if (requested === "ru" || requested === "kz") {
      setLangState(requested);
      window.localStorage.setItem("teniz-lang", requested);
      document.documentElement.lang = requested === "kz" ? "kk" : "ru";
      return;
    }
    const stored = window.localStorage.getItem("teniz-lang");
    if (stored === "ru" || stored === "kz") {
      setLangState(stored);
      document.documentElement.lang = stored === "kz" ? "kk" : "ru";
    }
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({
      lang,
      setLang: (next) => {
        setLangState(next);
        window.localStorage.setItem("teniz-lang", next);
        document.documentElement.lang = next === "kz" ? "kk" : "ru";
      },
      t: ui[lang],
    }),
    [lang],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}

export function LanguageSwitch() {
  const { lang, setLang } = useLanguage();
  return (
    <div className="flex shrink-0 rounded-full border border-white/10 bg-white/5 p-1 text-xs font-black text-cyan-100/70 sm:text-sm">
      {(["ru", "kz"] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setLang(option)}
          className={`rounded-full px-2.5 py-1.5 transition sm:px-3 ${
            lang === option ? "bg-ocean-accent text-ocean-bg" : "hover:text-white"
          }`}
        >
          {option.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
