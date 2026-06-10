"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Phone, QrCode, Search, SlidersHorizontal } from "lucide-react";
import { FishBadge } from "@/components/FishBadge";
import { QRScanner } from "@/components/QRScanner";
import { TopBar } from "@/components/TopBar";
import { distanceKm, fishTypes, formatTenge } from "@/lib/fish";
import type { FishType, LotWithDetails } from "@/lib/types";

export default function BuyerPage() {
  const router = useRouter();
  const [lots, setLots] = useState<LotWithDetails[]>([]);
  const [fishFilter, setFishFilter] = useState<FishType | "all">("all");
  const [maxPrice, setMaxPrice] = useState(10000);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [manualQr, setManualQr] = useState("TNZ-SDK-001");
  const [position, setPosition] = useState<{ latitude: number; longitude: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState("Определяем расстояние...");

  useEffect(() => {
    fetch("/api/lots")
      .then((response) => response.json())
      .then((data) => setLots(data.lots ?? []));

    if (!navigator.geolocation) {
      setGeoStatus("Геолокация недоступна");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (geo) => {
        setPosition({
          latitude: geo.coords.latitude,
          longitude: geo.coords.longitude,
        });
        setGeoStatus("Расстояние от вас");
      },
      () => setGeoStatus("Геолокация запрещена: показываем лоты без расстояния"),
      { enableHighAccuracy: false, timeout: 7000 },
    );
  }, []);

  const filtered = useMemo(
    () =>
      lots.filter(
        (lot) =>
          (fishFilter === "all" || lot.catch.fish_type === fishFilter) &&
          lot.price_per_kg <= maxPrice,
      ),
    [fishFilter, lots, maxPrice],
  );

  const openQr = useCallback(
    (qr: string) => {
      const id = qr.includes("/fish-passport/")
        ? qr.split("/fish-passport/").pop() ?? qr
        : qr;
      router.push(`/fish-passport/${encodeURIComponent(id)}`);
    },
    [router],
  );

  return (
    <main className="min-h-screen pb-28 text-white">
      <TopBar title="Маркет покупателя" subtitle="Тікелей балық нарығы" />
      <section className="mx-auto max-w-5xl px-4 sm:px-8">
        <div className="panel mb-5 p-4">
          <div className="flex items-center gap-3 text-sm text-cyan-100/70">
            <MapPin className="size-5 text-ocean-accent" />
            {geoStatus}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <label className="relative">
              <SlidersHorizontal className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-cyan-100/45" />
              <select
                value={fishFilter}
                onChange={(event) => setFishFilter(event.target.value as FishType | "all")}
                className="h-14 w-full rounded-2xl border border-white/10 bg-ocean-panel pl-12 pr-4 text-white"
              >
                <option value="all">Все виды</option>
                {fishTypes.map((fish) => (
                  <option key={fish} value={fish}>
                    {fish}
                  </option>
                ))}
              </select>
            </label>
            <label className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-cyan-100/45" />
              <input
                type="number"
                value={maxPrice}
                onChange={(event) => setMaxPrice(Number(event.target.value))}
                className="h-14 w-full rounded-2xl border border-white/10 bg-ocean-panel pl-12 pr-4 text-white"
                aria-label="Максимальная цена"
              />
            </label>
            <button
              type="button"
              onClick={() => setScannerOpen(true)}
              className="tap-target flex items-center justify-center gap-2 bg-ocean-accent text-ocean-bg"
            >
              <QrCode className="size-5" />
              Scan QR
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((lot) => {
            const distance = position
              ? distanceKm(position, {
                  latitude: lot.catch.latitude,
                  longitude: lot.catch.longitude,
                })
              : null;
            return (
              <article key={lot.id} className="panel overflow-hidden">
                <div className="grid grid-cols-[118px_1fr] gap-4 p-4">
                  <div className="overflow-hidden rounded-3xl bg-ocean-panel">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={lot.catch.photo_url || "/fish-demo.svg"}
                      alt={lot.catch.fish_type}
                      className="h-full min-h-36 w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <FishBadge fish={lot.catch.fish_type} />
                      <span className="text-xs font-bold text-cyan-100/50">
                        {distance ? `${distance.toFixed(1)} км` : "— км"}
                      </span>
                    </div>
                    <h2 className="mt-3 text-2xl font-black">{lot.weight_kg} кг</h2>
                    <p className="mt-1 text-lg font-bold text-ocean-accent">
                      {formatTenge(lot.price_per_kg)}/кг
                    </p>
                    <p className="mt-2 truncate text-sm text-cyan-100/60">
                      {lot.fisherman.name}
                    </p>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <a
                        href={`tel:${lot.fisherman.phone}`}
                        className="tap-target flex items-center justify-center gap-2 bg-white/10 text-sm text-white"
                      >
                        <Phone className="size-4" />
                        Контакт
                      </a>
                      <button
                        type="button"
                        onClick={() => openQr(lot.catch.qr_code)}
                        className="tap-target bg-ocean-accent text-sm text-ocean-bg"
                      >
                        Паспорт
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-[#071120]/90 p-4 backdrop-blur">
        <div className="mx-auto flex max-w-5xl gap-3">
          <input
            value={manualQr}
            onChange={(event) => setManualQr(event.target.value)}
            className="h-14 min-w-0 flex-1 rounded-2xl border border-white/10 bg-ocean-panel px-4 text-white"
            aria-label="QR ID"
          />
          <button
            type="button"
            onClick={() => openQr(manualQr)}
            className="tap-target bg-ocean-accent text-ocean-bg"
          >
            Открыть
          </button>
        </div>
      </div>

      <QRScanner
        active={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={openQr}
      />
    </main>
  );
}
