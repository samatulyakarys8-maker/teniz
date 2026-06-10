"use client";

import { useMemo, useState } from "react";
import { Anchor, BadgeCheck, Camera, Loader2, Store } from "lucide-react";
import { FishBadge } from "@/components/FishBadge";
import { QRCodeCard } from "@/components/QRCodeCard";
import { TopBar } from "@/components/TopBar";
import { useLanguage } from "@/components/LanguageProvider";
import { checkLegality, fishTypes, formatTenge } from "@/lib/fish";
import type { FishAiVerdict, FishType } from "@/lib/types";

type SavedCatch = {
  id: string;
  qr_code: string;
  fish_type: FishType;
  weight_kg: number;
  size_cm: number;
  is_legal: boolean;
};

export default function FishermanPage() {
  const { t } = useLanguage();
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [verdict, setVerdict] = useState<FishAiVerdict | null>(null);
  const [fishType, setFishType] = useState<FishType>("судак");
  const [sizeCm, setSizeCm] = useState(44);
  const [weightKg, setWeightKg] = useState(18);
  const [price, setPrice] = useState(3100);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [advice, setAdvice] = useState("");
  const [savedCatch, setSavedCatch] = useState<SavedCatch | null>(null);

  const legality = useMemo(() => checkLegality(fishType, sizeCm), [fishType, sizeCm]);

  function choosePhoto(file?: File) {
    if (!file) return;
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
    setVerdict(null);
    setSavedCatch(null);
  }

  async function analyzePhoto() {
    setLoading(true);
    const formData = new FormData();
    if (photo) formData.append("photo", photo);
    const response = await fetch("/api/analyze-fish", {
      method: "POST",
      body: formData,
    });
    const result = (await response.json()) as {
      verdict: FishAiVerdict;
      source: "gemini" | "demo";
    };
    setVerdict(result.verdict);
    setFishType(result.verdict["вид"]);
    setSizeCm(result.verdict["размер_см"]);
    setLoading(false);
  }

  async function askPriceAdvisor() {
    const response = await fetch("/api/price-advice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ species: fishType, weight: weightKg, price }),
    });
    const result = await response.json();
    setAdvice(result.advice);
  }

  async function saveCatchAndLot() {
    setSaving(true);
    const catchPayload = {
      fisherman_id: "00000000-0000-0000-0000-000000000001",
      fish_type: fishType,
      weight_kg: weightKg,
      size_cm: sizeCm,
      photo_url: preview || "/fish-demo.svg",
      latitude: 43.65,
      longitude: 51.16,
      is_legal: legality.legal,
      ai_verdict: verdict,
      quota_used: legality.legal ? weightKg : 0,
      qr_code: `TNZ-${fishType.slice(0, 3).toUpperCase()}-${Date.now()
        .toString(36)
        .toUpperCase()}`,
    };

    const catchResponse = await fetch("/api/catches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(catchPayload),
    });
    const catchResult = await catchResponse.json();
    const created = catchResult.catch as SavedCatch;
    setSavedCatch(created);

    if (legality.legal) {
      await fetch("/api/lots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          catch_id: created.id,
          fisherman_id: "00000000-0000-0000-0000-000000000001",
          price_per_kg: price,
          weight_kg: weightKg,
          status: "active",
        }),
      });
    }
    setSaving(false);
  }

  return (
    <main className="min-h-screen pb-28 text-white">
      <TopBar title={t.fisherman.title} subtitle={t.fisherman.subtitle} />
      <section className="mx-auto grid max-w-6xl gap-5 px-4 sm:px-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="panel overflow-hidden">
          <div className="relative grid min-h-80 place-items-center bg-[#081426]">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt={t.fisherman.photo} className="h-full max-h-96 w-full object-cover" />
            ) : (
              <div className="text-center">
                <span className="mx-auto grid size-20 place-items-center rounded-[2rem] bg-ocean-accent/12 text-ocean-accent">
                  <Camera className="size-9" />
                </span>
                <p className="mt-5 text-xl font-black">{t.fisherman.photo}</p>
                <p className="mt-2 text-sm text-cyan-100/60">{t.fisherman.photoHint}</p>
              </div>
            )}
          </div>
          <div className="grid gap-3 p-5 sm:grid-cols-2">
            <label className="tap-target grid cursor-pointer place-items-center bg-white/10 text-white hover:bg-white/15">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="sr-only"
                onChange={(event) => choosePhoto(event.target.files?.[0])}
              />
              {t.fisherman.upload}
            </label>
            <button
              type="button"
              onClick={analyzePhoto}
              disabled={loading}
              className="tap-target bg-ocean-accent text-ocean-bg hover:bg-[#24f0c6] disabled:opacity-60"
            >
              {loading ? t.fisherman.analyzing : t.fisherman.analyze}
            </button>
          </div>
        </div>

        <div className="space-y-5">
          <div className="panel p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-cyan-100/60">{t.fisherman.verdict}</p>
                <h2 className="mt-1 text-3xl font-black">
                  {legality.legal ? "CAN SELL" : "RELEASE"}
                </h2>
              </div>
              <span
                className={`rounded-2xl px-4 py-2 text-sm font-black ${
                  legality.legal
                    ? "bg-risk-green/15 text-risk-green"
                    : "bg-risk-red/15 text-risk-red"
                }`}
              >
                {legality.legal ? t.fisherman.sell : t.fisherman.release}
              </span>
            </div>
            <p className="mt-4 text-cyan-100/70">{verdict?.["причина"] ?? legality.reason}</p>
          </div>

          <div className="panel grid gap-4 p-5 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-cyan-100/70">{t.fisherman.fishType}</span>
              <select
                value={fishType}
                onChange={(event) => setFishType(event.target.value as FishType)}
                className="h-14 w-full rounded-2xl border border-white/10 bg-ocean-panel px-4 text-white"
              >
                {fishTypes.map((fish) => (
                  <option key={fish} value={fish}>
                    {fish}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-cyan-100/70">{t.fisherman.size}</span>
              <input value={sizeCm} onChange={(event) => setSizeCm(Number(event.target.value))} type="number" className="h-14 w-full rounded-2xl border border-white/10 bg-ocean-panel px-4 text-white" />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-cyan-100/70">{t.fisherman.weight}</span>
              <input value={weightKg} onChange={(event) => setWeightKg(Number(event.target.value))} type="number" className="h-14 w-full rounded-2xl border border-white/10 bg-ocean-panel px-4 text-white" />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-cyan-100/70">{t.fisherman.price}</span>
              <input value={price} onChange={(event) => setPrice(Number(event.target.value))} type="number" className="h-14 w-full rounded-2xl border border-white/10 bg-ocean-panel px-4 text-white" />
            </label>
          </div>

          <div className="panel p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <FishBadge fish={fishType} />
                <p className="mt-3 text-2xl font-black">
                  {weightKg} кг · {formatTenge(price)}/кг
                </p>
              </div>
              <button type="button" onClick={askPriceAdvisor} className="tap-target bg-white/10 text-white hover:bg-white/15">
                {t.fisherman.priceAi}
              </button>
            </div>
            {advice ? <p className="mt-4 leading-7 text-cyan-100/72">{advice}</p> : null}
          </div>

          {savedCatch ? <QRCodeCard qrId={savedCatch.qr_code} /> : null}
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-[#071120]/90 p-4 backdrop-blur">
        <div className="mx-auto flex max-w-6xl gap-3">
          <button
            type="button"
            onClick={saveCatchAndLot}
            disabled={saving}
            className="tap-target flex flex-1 items-center justify-center gap-2 bg-ocean-accent text-ocean-bg hover:bg-[#24f0c6] disabled:opacity-60"
          >
            {saving ? <Loader2 className="size-5 animate-spin" /> : <Store className="size-5" />}
            {legality.legal ? t.fisherman.createLot : t.fisherman.recordRelease}
          </button>
          <div className="hidden items-center gap-2 rounded-2xl border border-white/10 px-4 text-cyan-100/70 sm:flex">
            {legality.legal ? <BadgeCheck className="size-5 text-risk-green" /> : <Anchor className="size-5 text-risk-red" />}
            {legality.legal ? t.fisherman.legal : t.fisherman.returnFish}
          </div>
        </div>
      </div>
    </main>
  );
}
