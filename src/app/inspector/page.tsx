"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, BarChart3, Filter, Map, Radio, ShieldCheck } from "lucide-react";
import { FishBadge } from "@/components/FishBadge";
import { TopBar } from "@/components/TopBar";
import { useLanguage } from "@/components/LanguageProvider";
import { riskColor, riskLabel } from "@/lib/fish";
import type { AnomalyVerdict, Catch, FishType, Quota, TenizUser, Zone } from "@/lib/types";

const CatchMap = dynamic(() => import("@/components/CatchMap"), {
  ssr: false,
  loading: () => <MapLoading />,
});

function MapLoading() {
  const { t } = useLanguage();
  return (
    <div className="grid min-h-[470px] place-items-center rounded-[1.5rem] bg-ocean-panel text-cyan-100/60">
      {t.inspector.mapLoading}
    </div>
  );
}

type Alert = {
  catch: Catch;
  anomaly: AnomalyVerdict;
};

type Dashboard = {
  users: TenizUser[];
  catches: Catch[];
  quotas: Quota[];
  zones: Zone[];
  alerts: Alert[];
  demo: boolean;
};

type SectionId = "map" | "quotas" | "ai" | "registry";

export default function InspectorPage() {
  const { t } = useLanguage();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [filter, setFilter] = useState<FishType | "all">("all");
  const [activeSection, setActiveSection] = useState<SectionId>("map");

  useEffect(() => {
    fetch("/api/dashboard")
      .then((response) => response.json())
      .then(setDashboard);
  }, []);

  const catches = useMemo(() => dashboard?.catches ?? [], [dashboard?.catches]);
  const filteredCatches = useMemo(
    () => catches.filter((item) => filter === "all" || item.fish_type === filter),
    [catches, filter],
  );
  const legalCount = catches.filter((item) => item.is_legal).length;
  const alertCount = catches.length - legalCount;

  function goTo(section: SectionId) {
    setActiveSection(section);
    document.getElementById(`section-${section}`)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  const navItems = [
    { id: "map", label: t.inspector.navMap, icon: Map },
    { id: "quotas", label: t.inspector.navQuota, icon: BarChart3 },
    { id: "ai", label: t.inspector.navAi, icon: AlertTriangle },
    { id: "registry", label: t.inspector.navRegistry, icon: Radio },
  ] as const;

  return (
    <main className="min-h-screen text-white">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="hidden border-r border-white/10 bg-[#071120]/78 p-6 lg:block">
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-ocean-accent text-ocean-bg">
              <ShieldCheck className="size-7" />
            </span>
            <div>
              <p className="text-2xl font-black">Teniz</p>
              <p className="text-sm text-cyan-100/55">{t.inspector.desk}</p>
            </div>
          </div>
          <nav className="mt-10 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const selected = activeSection === item.id;
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => goTo(item.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold transition ${
                    selected
                      ? "bg-ocean-accent text-ocean-bg"
                      : "bg-white/7 text-cyan-100/80 hover:bg-white/12"
                  }`}
                >
                  <Icon className={`size-5 ${selected ? "text-ocean-bg" : "text-ocean-accent"}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>

        <section>
          <TopBar title={t.inspector.title} subtitle={t.inspector.subtitle} />
          <div className="grid gap-5 px-4 pb-8 sm:px-8 xl:grid-cols-[1fr_360px]">
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-3">
                <Metric title={t.inspector.total} value={String(catches.length)} />
                <Metric title={t.inspector.legal} value={String(legalCount)} accent="#22c55e" />
                <Metric title={t.inspector.alerts} value={String(alertCount)} accent="#ef4444" />
              </div>

              <div id="section-map" className="panel scroll-mt-6 overflow-hidden p-3">
                {dashboard ? (
                  <CatchMap catches={filteredCatches} users={dashboard.users} />
                ) : (
                  <div className="grid min-h-[470px] place-items-center text-cyan-100/60">
                    {t.inspector.loading}
                  </div>
                )}
              </div>

              <div id="section-registry" className="panel scroll-mt-6 p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-black">{t.inspector.registry}</h2>
                    <p className="text-sm text-cyan-100/55">{t.inspector.registryHint}</p>
                  </div>
                  <label className="relative">
                    <Filter className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-cyan-100/45" />
                    <select
                      value={filter}
                      onChange={(event) => setFilter(event.target.value as FishType | "all")}
                      className="h-11 rounded-2xl border border-white/10 bg-ocean-panel pl-10 pr-4 text-sm text-white"
                    >
                      <option value="all">{t.inspector.all}</option>
                      {["сазан", "вобла", "судак", "осётр", "другое"].map((fish) => (
                        <option key={fish} value={fish}>
                          {fish}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead className="text-cyan-100/50">
                      <tr>
                        <th className="py-3">QR</th>
                        <th>{t.inspector.species}</th>
                        <th>{t.inspector.weight}</th>
                        <th>{t.inspector.size}</th>
                        <th>{t.inspector.coords}</th>
                        <th>{t.inspector.status}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/8">
                      {filteredCatches.map((catchItem) => (
                        <tr key={catchItem.id} className="text-cyan-50/86">
                          <td className="py-3 font-mono text-ocean-accent">{catchItem.qr_code}</td>
                          <td><FishBadge fish={catchItem.fish_type} /></td>
                          <td>{catchItem.weight_kg} кг</td>
                          <td>{catchItem.size_cm} см</td>
                          <td>{catchItem.latitude.toFixed(3)}, {catchItem.longitude.toFixed(3)}</td>
                          <td>
                            <span className={`rounded-full px-3 py-1 text-xs font-black ${catchItem.is_legal ? "bg-risk-green/15 text-risk-green" : "bg-risk-red/15 text-risk-red"}`}>
                              {catchItem.is_legal ? "OK" : "RELEASE"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div id="section-quotas" className="panel scroll-mt-6 p-5">
                <h2 className="text-xl font-black">{t.inspector.quotas}</h2>
                <div className="mt-5 space-y-4">
                  {(dashboard?.quotas ?? []).map((quota) => {
                    const percent = Math.min(100, Math.round((quota.used_kg / quota.total_kg) * 100));
                    return (
                      <div key={quota.id}>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <FishBadge fish={quota.fish_type} />
                          <span className="font-bold text-cyan-100/70">{percent}%</span>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full bg-white/8">
                          <div className="h-full rounded-full bg-ocean-accent" style={{ width: `${percent}%` }} />
                        </div>
                        <p className="mt-1 text-xs text-cyan-100/45">
                          {quota.used_kg} / {quota.total_kg} кг
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div id="section-ai" className="panel scroll-mt-6 p-5">
                <h2 className="text-xl font-black">{t.inspector.anomalies}</h2>
                <div className="mt-5 space-y-3">
                  {(dashboard?.alerts ?? []).map((alert) => {
                    const risk = alert.anomaly["риск"];
                    return (
                      <div key={alert.catch.id} className="rounded-3xl border border-white/10 bg-ocean-panel p-4">
                        <div className="flex items-center justify-between">
                          <FishBadge fish={alert.catch.fish_type} />
                          <span
                            className="rounded-full px-3 py-1 text-xs font-black"
                            style={{ color: riskColor(risk), backgroundColor: `${riskColor(risk)}22` }}
                          >
                            {risk}/10 · {riskLabel(risk)}
                          </span>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-cyan-100/67">
                          {alert.anomaly["причина"]}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="panel p-5">
                <h2 className="text-xl font-black">{t.inspector.zones}</h2>
                <div className="mt-4 space-y-3">
                  {(dashboard?.zones ?? []).map((zone) => (
                    <div key={zone.id} className="flex items-center justify-between rounded-2xl bg-white/7 p-3">
                      <span className="font-semibold">{zone.name}</span>
                      <span style={{ color: riskColor(zone.risk_level) }} className="font-black">
                        {zone.risk_level}/10
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({
  title,
  value,
  accent = "#00d4aa",
}: {
  title: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="panel p-5">
      <p className="text-sm font-bold text-cyan-100/55">{title}</p>
      <p className="mt-3 text-4xl font-black" style={{ color: accent }}>
        {value}
      </p>
    </div>
  );
}
