"use client";
import dynamic from "next/dynamic";

// 3D-Viewer (three.js) erst zur Laufzeit laden — nur wenn ein Modell vorhanden ist
const ModelViewer = dynamic(() => import("./ModelViewer"), {
  ssr: false,
  loading: () => (
    <div style={{ height: 360, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", background: "radial-gradient(circle at 50% 40%, #2a2a3a, #14141f)", color: "#9ab", fontSize: 14 }}>
      🧊 3D-Modell lädt…
    </div>
  ),
});

export default function Model3DLazy({ url, height }: { url: string; height?: number }) {
  return <ModelViewer url={url} height={height} />;
}
