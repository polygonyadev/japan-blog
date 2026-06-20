"use client";
import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stage, useGLTF } from "@react-three/drei";

function Model({ url, onLoaded }: { url: string; onLoaded: () => void }) {
  const { scene } = useGLTF(url);
  // Modell ist geladen, sobald diese Komponente (nach Suspense) mountet
  useEffect(() => { onLoaded(); }, [onLoaded]);
  return <primitive object={scene} />;
}

export default function ModelViewer({ url, height = 360 }: { url: string; height?: number }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div style={{ position: "relative", height, borderRadius: 14, overflow: "hidden", background: "radial-gradient(circle at 50% 40%, #2a2a3a, #14141f)" }}>
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 4], fov: 45 }}>
        <Suspense fallback={null}>
          <Stage environment="city" intensity={0.5} adjustCamera shadows="contact">
            <Model url={url} onLoaded={() => setLoaded(true)} />
          </Stage>
        </Suspense>
        <OrbitControls makeDefault autoRotate autoRotateSpeed={0.8} enablePan={false} minDistance={1.5} maxDistance={12} />
      </Canvas>

      {!loaded && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ab", fontSize: 14, pointerEvents: "none" }}>
          🧊 3D-Modell lädt…
        </div>
      )}
      <div style={{ position: "absolute", bottom: 8, left: 0, right: 0, textAlign: "center", color: "rgba(255,255,255,0.65)", fontSize: 12, pointerEvents: "none" }}>
        🖱️ Ziehen zum Drehen · Scrollen zum Zoomen
      </div>
    </div>
  );
}
