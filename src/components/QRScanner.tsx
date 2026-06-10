"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, X } from "lucide-react";
import { useLanguage } from "./LanguageProvider";

export function QRScanner({
  onScan,
  active,
  onClose,
}: {
  onScan: (qr: string) => void;
  active: boolean;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const scannerRef = useRef<{ clear: () => Promise<void> } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!active) return;
    let mounted = true;

    import("html5-qrcode")
      .then(({ Html5QrcodeScanner }) => {
        if (!mounted) return;
        const scanner = new Html5QrcodeScanner(
          "teniz-qr-reader",
          {
            fps: 10,
            qrbox: { width: 240, height: 240 },
            rememberLastUsedCamera: true,
          },
          false,
        );
        scannerRef.current = scanner;
        scanner.render(
          (decodedText) => {
            onScan(decodedText);
            scanner.clear().catch(() => undefined);
          },
          () => undefined,
        );
      })
      .catch(() => setError(t.qr.cameraError));

    return () => {
      mounted = false;
      scannerRef.current?.clear().catch(() => undefined);
      scannerRef.current = null;
    };
  }, [active, onScan, t.qr.cameraError]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#06101f]/95 p-4">
      <div className="mx-auto flex max-w-md flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-ocean-accent/15 text-ocean-accent">
              <Camera className="size-5" />
            </span>
            <div>
              <h2 className="text-xl font-black text-white">{t.qr.scan}</h2>
              <p className="text-sm text-cyan-100/60">{t.qr.passport}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-11 place-items-center rounded-2xl bg-white/10 text-white"
            aria-label={t.qr.close}
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="panel overflow-hidden p-3">
          <div id="teniz-qr-reader" className="min-h-80 text-white" />
        </div>
        {error ? <p className="text-sm text-red-200">{error}</p> : null}
      </div>
    </div>
  );
}
