"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";

interface Marker {
  lat: number;
  lng: number;
  label: string;
  slug?: string;
  id?: string;
}

interface MiniMapProps {
  markers: Marker[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  // Wenn gesetzt: Klick auf einen Pin ruft dies auf (z.B. Post-Fenster im NipponOS öffnen)
  // statt zur /posts/<slug>-Seite zu navigieren.
  onMarkerClick?: (id: string) => void;
}

export default function MiniMap({ markers, center = [36.5, 136], zoom = 5, height = "300px", onMarkerClick }: MiniMapProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const tileRef = useRef<import("leaflet").TileLayer | null>(null);
  const { theme } = useTheme();
  const router = useRouter();
  const clickRef = useRef(onMarkerClick);
  clickRef.current = onMarkerClick;

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
    // Clean up any leftover Leaflet state on the DOM node before initializing
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const container = ref.current as any;
    if (container._leaflet_id) {
      container._leaflet_id = undefined;
    }
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
    import("leaflet").then(L => {
      if (!ref.current) return;
      const map = L.map(ref.current, { zoomControl: true, attributionControl: false }).setView(center, zoom);
      mapRef.current = map;

      const tileUrl = document.documentElement.getAttribute("data-theme") === "light"
        ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
      tileRef.current = L.tileLayer(tileUrl, { attribution: "©OpenStreetMap ©CartoDB" }).addTo(map);

      const icon = L.divIcon({
        html: `<div style="width:12px;height:12px;border-radius:50%;background:var(--accent-pink);box-shadow:0 0 8px rgba(255,45,107,0.8);border:2px solid white;"></div>`,
        className: "",
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });

      markers.forEach(m => {
        const clickable = !!(m.slug || (m.id && clickRef.current));
        const popup = L.popup({ closeButton: false }).setContent(
          `<div style="padding:6px 10px;font-size:13px;white-space:nowrap;cursor:${clickable ? "pointer" : "default"}">
            📝 ${m.label}
            ${clickable ? `<div style="font-size:11px;color:var(--accent-cyan);margin-top:3px">→ Post öffnen</div>` : ""}
          </div>`
        );
        const marker = L.marker([m.lat, m.lng], { icon }).addTo(map).bindPopup(popup);
        if (clickable) {
          const slug = m.slug;
          const id = m.id;
          marker.on("popupopen", () => {
            setTimeout(() => {
              const el = marker.getPopup()?.getElement();
              if (el) {
                el.style.cursor = "pointer";
                el.addEventListener("click", () => {
                  if (clickRef.current && id) clickRef.current(id);
                  else if (slug) router.push(`/posts/${slug}`);
                });
              }
            }, 50);
          });
        }
      });

      // Karte auf die Marker ausrichten
      if (markers.length === 1) {
        map.setView([markers[0].lat, markers[0].lng], zoom);
      } else if (markers.length > 1) {
        map.fitBounds(markers.map(m => [m.lat, m.lng]) as [number, number][], { padding: [40, 40] });
      }
    });
    return () => { mapRef.current?.remove(); mapRef.current = null; };
  }, []);

  return <div ref={ref} style={{ height, borderRadius: "12px", overflow: "hidden" }} />;
}
