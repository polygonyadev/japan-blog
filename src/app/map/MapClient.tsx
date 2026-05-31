"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";

interface Marker {
  lat: number;
  lng: number;
  label: string;
  title: string;
  slug?: string;
  type: "post" | "bucket";
}

export default function MapClient({ markers, height = "500px" }: { markers: Marker[]; height?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const tileRef = useRef<import("leaflet").TileLayer | null>(null);
  const { theme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (!tileRef.current || !mapRef.current) return;
    import("leaflet").then(L => {
      tileRef.current?.remove();
      const url = theme === "light"
        ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
      tileRef.current = L.tileLayer(url, { attribution: "©OpenStreetMap ©CartoDB" }).addTo(mapRef.current!);
    });
  }, [theme]);

  useEffect(() => {
    if (!ref.current) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const container = ref.current as any;
    if (container._leaflet_id) container._leaflet_id = undefined;
    if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }

    import("leaflet").then(L => {
      if (!ref.current) return;
      const center: [number, number] = markers.length > 0
        ? [markers.reduce((s, m) => s + m.lat, 0) / markers.length, markers.reduce((s, m) => s + m.lng, 0) / markers.length]
        : [36.5, 136];

      const map = L.map(ref.current, { zoomControl: true, attributionControl: false }).setView(center, 5);
      mapRef.current = map;

      const tileUrl = document.documentElement.getAttribute("data-theme") === "light"
        ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
      tileRef.current = L.tileLayer(tileUrl, { attribution: "©OpenStreetMap ©CartoDB" }).addTo(map);

      markers.forEach(m => {
        const color = m.type === "post" ? "#ff2d6b" : "#00d4ff";
        const icon = L.divIcon({
          html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};box-shadow:0 0 10px ${color}99;border:2px solid white;cursor:pointer;"></div>`,
          className: "",
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });

        const popup = L.popup({ closeButton: false, className: "custom-popup" }).setContent(
          `<div style="padding:8px 12px;font-size:13px;font-weight:600;white-space:nowrap;cursor:${m.slug ? "pointer" : "default"}">
            ${m.type === "post" ? "📝" : "📍"} ${m.title}
            ${m.label && m.label !== m.title ? `<div style="font-size:11px;font-weight:400;opacity:0.7;margin-top:2px">${m.label}</div>` : ""}
            ${m.slug ? `<div style="font-size:11px;color:#00d4ff;margin-top:4px">→ Post öffnen</div>` : ""}
          </div>`
        );

        const marker = L.marker([m.lat, m.lng], { icon }).addTo(map).bindPopup(popup);

        if (m.slug) {
          const slug = m.slug;
          marker.on("click", () => marker.openPopup());
          marker.on("popupopen", () => {
            setTimeout(() => {
              const el = marker.getPopup()?.getElement();
              if (el) el.style.cursor = "pointer";
              el?.addEventListener("click", () => router.push(`/posts/${slug}`));
            }, 50);
          });
        }
      });

      if (markers.length > 1) {
        const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]));
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    });

    return () => { mapRef.current?.remove(); mapRef.current = null; };
  }, [markers]);

  return <div ref={ref} style={{ height, width: "100%" }} />;
}
