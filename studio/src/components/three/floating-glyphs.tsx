"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface FloatingGlyphsProps {
  count?: number;
}

export function FloatingGlyphs({ count = 12 }: FloatingGlyphsProps) {
  const groupRef = useRef<THREE.Group>(null);

  const glyphs = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      const radius = 5 + (i % 3) * 2;
      const yBase = 1 + (i % 4) * 1.2;

      const positions: number[] = [];
      const numPoints = 6 + Math.floor(Math.random() * 4);
      for (let j = 0; j < numPoints; j++) {
        const a = (j / numPoints) * Math.PI * 2;
        const r = 0.3 + Math.random() * 0.3;
        positions.push(Math.cos(a) * r, Math.sin(a) * r, 0);
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(positions), 3));

      return {
        geometry: geo,
        orbitAngle: angle,
        orbitRadius: radius,
        yBase,
        floatSpeed: 0.3 + Math.random() * 0.3,
        floatAmp: 0.15 + Math.random() * 0.15,
        orbitSpeed: 0.04 + Math.random() * 0.03,
        rotSpeed: 0.1 + Math.random() * 0.1,
        isGold: Math.random() > 0.5,
      };
    });
  }, [count]);

  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    glyphs.forEach((glyph, i) => {
      const mesh = meshRefs.current[i];
      if (!mesh) return;

      const angle = glyph.orbitAngle + t * glyph.orbitSpeed;
      mesh.position.x = Math.cos(angle) * glyph.orbitRadius;
      mesh.position.z = Math.sin(angle) * glyph.orbitRadius;
      mesh.position.y = glyph.yBase + Math.sin(t * glyph.floatSpeed + i) * glyph.floatAmp;

      mesh.rotation.y += glyph.rotSpeed * 0.01;
      mesh.rotation.x = Math.sin(t * 0.5 + i) * 0.2;

      if (mesh.material instanceof THREE.MeshBasicMaterial) {
        const pulse = 0.4 + Math.sin(t * 1.5 + i * 0.5) * 0.2;
        mesh.material.opacity = pulse;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {glyphs.map((glyph, i) => (
        <mesh
          key={i}
          ref={(el: THREE.Mesh | null) => { meshRefs.current[i] = el; }}
          geometry={glyph.geometry}
        >
          <meshBasicMaterial
            color={glyph.isGold ? "#D4A853" : "#4A9FB5"}
            transparent
            opacity={0.5}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}
