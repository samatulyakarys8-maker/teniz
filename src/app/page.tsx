import Link from "next/link";
import { Fish, Search, ShieldCheck, Waves } from "lucide-react";

const roles = [
  {
    title: "Рыбак",
    kz: "Балықшы",
    href: "/fisherman",
    icon: Fish,
    text: "Фото улова, AI-проверка законности, QR паспорт и быстрый выход на рынок.",
  },
  {
    title: "Покупатель",
    kz: "Сатып алушы",
    href: "/buyer",
    icon: Search,
    text: "Живые лоты, расстояние до улова, контакт с рыбаком и сканирование паспорта.",
  },
  {
    title: "Инспектор",
    kz: "Инспектор",
    href: "/inspector",
    icon: ShieldCheck,
    text: "Карта Каспия, квоты, риск-маркеры и AI-сигналы по подозрительным уловам.",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-ocean-radial px-4 py-6 text-white sm:px-8">
      <section className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-7xl flex-col">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-ocean-accent text-ocean-bg shadow-glow">
              <Waves className="size-7" />
            </span>
            <div>
              <p className="text-2xl font-black tracking-wide">Teniz</p>
              <p className="text-sm text-cyan-100/60">Каспий балық шаруашылығы</p>
            </div>
          </div>
          <div className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-cyan-100/70">
            RU / KZ
          </div>
        </nav>

        <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="min-w-0 max-w-full">
            <div className="mb-8 inline-flex rounded-full border border-ocean-accent/30 bg-ocean-accent/10 px-4 py-2 text-sm font-semibold text-ocean-accent">
              MVP для Mangystau Hackathon
            </div>
            <h1 className="max-w-3xl text-[2.35rem] font-black leading-[1.04] tracking-tight sm:text-7xl">
              <span className="sm:hidden">
                Цифровой путь
                <br />
                рыбы от Каспия
                <br />
                до прилавка.
              </span>
              <span className="hidden sm:inline">
                Цифровой путь рыбы от Каспия до прилавка.
              </span>
            </h1>
            <p className="mt-6 max-w-[22rem] text-lg leading-8 text-cyan-100/72 sm:max-w-2xl">
              Улов фиксируется на берегу, AI проверяет законность, покупатель видит
              прозрачный лот, а инспектор контролирует квоты и риски на карте.
            </p>
          </div>

          <div className="grid min-w-0 max-w-full gap-4 md:grid-cols-3 lg:grid-cols-1">
            {roles.map((role) => {
              const Icon = role.icon;
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
                      <span className="block text-2xl font-black">{role.title}</span>
                      <span className="block text-sm font-semibold text-ocean-accent">
                        {role.kz}
                      </span>
                      <span className="mt-3 block break-words text-[0.95rem] leading-7 text-cyan-100/68 sm:text-base">
                        {role.text}
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
