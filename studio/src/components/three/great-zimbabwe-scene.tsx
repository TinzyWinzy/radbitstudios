"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { Starfield } from "./starfield";
import { EnclosureWalls } from "./enclosure-walls";
import { ConicalTower } from "./conical-tower";
import { FloatingRuins } from "./floating-ruins";
import { ZimbabweBird } from "./zimbabwe-bird";
import { FloatingGlyphs } from "./floating-glyphs";
import { DustParticles } from "./dust-particles";
import { SouthernConstellations } from "./southern-constellations";

function isMobileDevice() {
  if (typeof window === "undefined") return false;
  const width = window.innerWidth;
  const cores = (navigator as any).hardwareConcurrency;
  if (width < 768) return true;
  if (cores !== undefined && cores < 4) return true;
  return false;
}

function SceneContent({ scrollProgress }: { scrollProgress: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const mouseTarget = useRef({ x: 0, y: 0 });
  const cameraPos = useRef(new THREE.Vector3(0, 1.5, 6));
  const cameraLookAt = useRef(new THREE.Vector3(0, 1, 0));

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      mouseTarget.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      };
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  useFrame(() => {
    const tx = mouseTarget.current.x;
    const ty = mouseTarget.current.y;
    const sp = scrollProgress;

    let targetX: number, targetY: number, targetZ: number;
    let lookX = 0, lookY = 1, lookZ = 0;

    if (sp < 0.15) {
      targetX = 0; targetY = 1.5; targetZ = 6;
      lookX = 0; lookY = 1; lookZ = 0;
    } else if (sp < 0.35) {
      const t = (sp - 0.15) / 0.2;
      targetX = 0; targetY = 1.5 + t * 2; targetZ = 6 - t * 2;
      lookX = 0; lookY = 1 + t * 0.5; lookZ = 0;
    } else if (sp < 0.55) {
      const t = (sp - 0.35) / 0.2;
      const angle = t * Math.PI * 0.4;
      targetX = Math.sin(angle) * 8; targetY = 3.5; targetZ = Math.cos(angle) * 8;
      lookX = 0; lookY = 1.5; lookZ = 0;
    } else if (sp < 0.75) {
      const t = (sp - 0.55) / 0.2;
      const angle = Math.PI * 0.4 + t * Math.PI * 0.3;
      targetX = Math.sin(angle) * 10; targetY = 2.5 + t * 1.5; targetZ = Math.cos(angle) * 10;
      lookX = 0; lookY = 1; lookZ = 0;
    } else {
      const t = (sp - 0.75) / 0.25;
      const angle = Math.PI * 0.7 + t * Math.PI * 0.3;
      targetX = Math.sin(angle) * 12; targetY = 4 - t * 1; targetZ = Math.cos(angle) * 12;
      lookX = 0; lookY = 0.5; lookZ = 0;
    }

    targetX += tx * 0.3;
    targetY += -ty * 0.2;

    cameraPos.current.x += (targetX - cameraPos.current.x) * 0.025;
    cameraPos.current.y += (targetY - cameraPos.current.y) * 0.025;
    cameraPos.current.z += (targetZ - cameraPos.current.z) * 0.025;

    cameraLookAt.current.x += (lookX - cameraLookAt.current.x) * 0.025;
    cameraLookAt.current.y += (lookY - cameraLookAt.current.y) * 0.025;
    cameraLookAt.current.z += (lookZ - cameraLookAt.current.z) * 0.025;

    camera.position.copy(cameraPos.current);
    camera.lookAt(cameraLookAt.current);

    if (groupRef.current) {
      groupRef.current.rotation.x += (ty * 0.005 - groupRef.current.rotation.x) * 0.015;
      groupRef.current.rotation.y += (tx * 0.008 - groupRef.current.rotation.y) * 0.015;
    }
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.15} />
      <directionalLight position={[8, 12, 6]} intensity={1.2} color="#F5D742" />
      <directionalLight position={[-6, 4, -8]} intensity={0.4} color="#3A6B9F" />
      <pointLight position={[0, 2, 0]} intensity={1.2} color="#D4A853" distance={20} />
      <pointLight position={[0, 5, 0]} intensity={0.6} color="#4A9FB5" distance={12} />

      <Starfield count={8000} radius={120} />
      <EnclosureWalls />
      <SouthernConstellations />
      <ConicalTower position={[0, 0, 0]} />
      <ZimbabweBird />
      <FloatingRuins count={18} radius={12} />
      <FloatingGlyphs count={12} />
      <DustParticles count={400} />
    </group>
  );
}

interface GreatZimbabweSceneProps {
  className?: string;
  scrollProgress?: number;
}

export function GreatZimbabweScene({ className, scrollProgress = 0 }: GreatZimbabweSceneProps) {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const [dpr, setDpr] = useState(1);

  useEffect(() => {
    setMounted(true);
    setIsMobile(isMobileDevice());
    setDpr(Math.min(2, window.devicePixelRatio || 1));
  }, []);

  if (!mounted) {
    return <div className={className} />;
  }

  if (isMobile) {
    return (
      <div className={`${className} bg-gradient-to-b from-background via-background to-background`} />
    );
  }

  return (
    <div className={className}>
      <Canvas
        camera={{
          position: [0, 1.5, 6],
          fov: 55,
          near: 0.1,
          far: 200,
        }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
        }}
        dpr={[1, dpr]}
      >
        <SceneContent scrollProgress={scrollProgress} />
        <EffectComposer>
          <Bloom
            intensity={0.5}
            luminanceThreshold={0.25}
            luminanceSmoothing={0.92}
            mipmapBlur
          />
          <Vignette
            darkness={0.6}
            offset={0.12}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
