"use client";

import { useMemo } from "react";
import L from "leaflet";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import { riskColor, riskLabel } from "@/lib/fish";
import type { Catch, TenizUser } from "@/lib/types";

export default function CatchMap({
  catches,
  users,
}: {
  catches: Catch[];
  users: TenizUser[];
}) {
  const bounds = useMemo(
    () =>
      L.latLngBounds(
        catches.map((item) => [item.latitude, item.longitude] as [number, number]),
      ),
    [catches],
  );

  return (
    <MapContainer
      center={[44.5, 51.5]}
      zoom={7}
      bounds={catches.length > 1 ? bounds : undefined}
      scrollWheelZoom
      className="min-h-[470px] rounded-[1.5rem]"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {catches.map((catchItem) => {
        const risk = !catchItem.is_legal
          ? 9
          : catchItem.weight_kg > 45
            ? 7
            : catchItem.weight_kg > 30
              ? 5
              : 3;
        const fisherman = users.find((user) => user.id === catchItem.fisherman_id);
        return (
          <CircleMarker
            key={catchItem.id}
            center={[catchItem.latitude, catchItem.longitude]}
            pathOptions={{
              color: riskColor(risk),
              fillColor: riskColor(risk),
              fillOpacity: 0.72,
              weight: 2,
            }}
            radius={10 + Math.min(12, catchItem.weight_kg / 7)}
          >
            <Popup>
              <div className="space-y-1">
                <p className="text-sm font-black">{catchItem.fish_type}</p>
                <p>{catchItem.weight_kg} кг / {catchItem.size_cm} см</p>
                <p>{fisherman?.name ?? "Рыбак"}</p>
                <p style={{ color: riskColor(risk) }}>{riskLabel(risk)}</p>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
