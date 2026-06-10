"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function QRCodeCard({ qrId }: { qrId: string }) {
  const [dataUrl, setDataUrl] = useState("");

  useEffect(() => {
    const origin = window.location.origin;
    QRCode.toDataURL(`${origin}/fish-passport/${encodeURIComponent(qrId)}`, {
      width: 220,
      margin: 2,
      color: {
        dark: "#0a1628",
        light: "#ffffff",
      },
    }).then(setDataUrl);
  }, [qrId]);

  return (
    <div className="panel p-5 text-center">
      <p className="text-sm font-semibold text-cyan-100/70">QR паспорт улова</p>
      <div className="mx-auto mt-4 grid size-56 place-items-center rounded-3xl bg-white p-4">
        {dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={dataUrl} alt={`QR ${qrId}`} className="size-full" />
        ) : (
          <span className="text-sm text-slate-500">Генерация...</span>
        )}
      </div>
      <p className="mt-3 font-mono text-sm text-ocean-accent">{qrId}</p>
    </div>
  );
}
