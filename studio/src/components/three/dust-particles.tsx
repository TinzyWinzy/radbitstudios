"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface DustParticlesProps {
  count?: number;
}

export function DustParticles({ count = 400 }: DustParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const colors = new Float32Array(count * 3);

    const goldColor = new THREE.Color("#D4A853");
    const blueColor = new THREE.Color("#4A9FB5");

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 2 + Math.random() * 12;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.3) * 10;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
      sizes[i] = 0.01 + Math.random() * 0.025;

      const isGold = Math.random() > 0.3;
      const color = isGold ? goldColor : blueColor;
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const pos = pointsRef.current.geometry.attributes.position;
    const array = pos.array as Float32Array;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      array[i * 3] += Math.sin(t * 0.15 + i * 0.5) * 0.002;
      array[i * 3 + 1] += Math.cos(t * 0.1 + i * 0.3) * 0.001;
      array[i * 3 + 2] += Math.sin(t * 0.12 + i * 0.4) * 0.002;

      const x = array[i * 3];
      const z = array[i * 3 + 2];
      const dist = Math.sqrt(x * x + z * z);

      if (dist > 14) {
        const angle = Math.atan2(z, x) + Math.PI;
        array[i * 3] = Math.cos(angle) * 3;
        array[i * 3 + 2] = Math.sin(angle) * 3;
      }
      if (array[i * 3 + 1] > 5) array[i * 3 + 1] = -3;
      if (array[i * 3 + 1] < -3) array[i * 3 + 1] = 5;
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.02}
        sizeAttenuation
        transparent
        opacity={0.4}
        vertexColors
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
