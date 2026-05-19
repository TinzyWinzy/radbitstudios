"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { EnclosureWalls } from "./enclosure-walls";
import { ConicalTower } from "./conical-tower";
import { FloatingRuins } from "./floating-ruins";
import { ZimbabweBird } from "./zimbabwe-bird";
import { FloatingGlyphs } from "./floating-glyphs";
import { DustParticles } from "./dust-particles";
import { SouthernConstellations } from "./southern-constellations";
import { Group } from "./r3f-group";

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
  const cameraPos = useRef(new THREE.Vector3(0, 1.5, -2)); // Changed from positive Z to negative Z for inside view
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
      targetX = 0; targetY = 1.5; targetZ = -2; // Inside view - looking out from center
      lookX = 0; lookY = 1; lookZ = 0;
    } else if (sp < 0.35) {
      const t = (sp - 0.15) / 0.2;
      targetX = 0; targetY = 1.5 + t * 1.5; targetZ = -2 + t * 1; // Adjusted for inside view
      lookX = 0; lookY = 1 + t * 0.3; lookZ = 0;
    } else if (sp < 0.55) {
      const t = (sp - 0.35) / 0.2;
      const angle = t * Math.PI * 0.3; // Reduced angle for more subtle movement inside
      targetX = Math.sin(angle) * 3; targetY = 2.5; targetZ = Math.cos(angle) * 3 - 2; // Keeping inside enclosure
      lookX = 0; lookY = 1.3; lookZ = 0;
    } else if (sp < 0.75) {
      const t = (sp - 0.55) / 0.2;
      const angle = Math.PI * 0.3 + t * Math.PI * 0.2;
      targetX = Math.sin(angle) * 4; targetY = 2 + t * 1; targetZ = Math.cos(angle) * 4 - 2;
      lookX = 0; lookY = 1.1; lookZ = 0;
    } else {
      const t = (sp - 0.75) / 0.25;
      const angle = Math.PI * 0.5 + t * Math.PI * 0.2;
      targetX = Math.sin(angle) * 5; targetY = 3 - t * 0.5; targetZ = Math.cos(angle) * 5 - 2;
      lookX = 0; lookY = 0.8; lookZ = 0;
    }

    targetX += tx * 0.2;
    targetY += -ty * 0.15;

    cameraPos.current.x += (targetX - cameraPos.current.x) * 0.02;
    cameraPos.current.y += (targetY - cameraPos.current.y) * 0.02;
    cameraPos.current.z += (targetZ - cameraPos.current.z) * 0.02;

    cameraLookAt.current.x += (lookX - cameraLookAt.current.x) * 0.02;
    cameraLookAt.current.y += (lookY - cameraLookAt.current.y) * 0.02;
    cameraLookAt.current.z += (lookZ - cameraLookAt.current.z) * 0.02;

    camera.position.copy(cameraPos.current);
    camera.lookAt(cameraLookAt.current);

    if (groupRef.current) {
      groupRef.current.rotation.x += (ty * 0.003 - groupRef.current.rotation.x) * 0.01;
      groupRef.current.rotation.y += (tx * 0.005 - groupRef.current.rotation.y) * 0.01;
    }
  });

  return (
    <Group ref={groupRef}>
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 8, 3]} intensity={1.0} color="#F5D742" />
      <directionalLight position={[-3, 4, -5]} intensity={0.3} color="#3A6B9F" />
      <pointLight position={[0, 1.5, 0]} intensity={0.8} color="#D4A853" distance={15} />
      <pointLight position={[0, 3, 0]} intensity={0.4} color="#4A9FB5" distance={10} />

      {/* Invert the enclosure walls for inside view - we'll show the inner surfaces */}
      <EnclosureWalls inverted={true} />
      <SouthernConstellations />
      <ConicalTower position={[0, 0, 0]} />
      <ZimbabweBird />
      <FloatingRuins count={18} radius={12} />
      <FloatingGlyphs count={12} />
      <DustParticles count={400} />
    </Group>
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
