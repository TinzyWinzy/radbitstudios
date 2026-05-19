"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group } from "./r3f-group";
import * as THREE from "three";

interface FloatingRuinsProps {
  count?: number;
  radius?: number;
}

const stoneColors = [
  "#6B5E50",
  "#5C5045",
  "#7A6D5E",
  "#4F453A",
  "#6E6354",
];

const techGold = "#D4A853";

export function FloatingRuins({ count = 18, radius = 12 }: FloatingRuinsProps) {
  const groupRef = useRef<THREE.Group>(null);

  const instances = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const orbitRing = Math.floor(i / 6);
      const ringRadius = 4 + orbitRing * 3;
      const angleInRing = ((i % 6) / 6) * Math.PI * 2 + (orbitRing * 0.5);
      const yBase = 1 + orbitRing * 1.5 + (Math.random() - 0.5) * 0.5;

      const isAccent = Math.random() > 0.7;

      return {
        orbitRing,
        orbitDist: ringRadius,
        orbitOffset: angleInRing,
        yBase,
        scale: [
          0.2 + Math.random() * 0.4,
          0.15 + Math.random() * 0.3,
          0.2 + Math.random() * 0.4,
        ] as [number, number, number],
        rotSpeed: {
          x: (Math.random() - 0.5) * 0.005,
          y: (Math.random() - 0.5) * 0.008,
          z: (Math.random() - 0.5) * 0.003,
        },
        orbitSpeed: 0.08 + orbitRing * 0.02,
        floatSpeed: 0.4 + Math.random() * 0.3,
        floatAmp: 0.1 + Math.random() * 0.2,
        color: isAccent ? techGold : stoneColors[Math.floor(Math.random() * stoneColors.length)],
        isAccent,
      };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, radius]);

  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    instances.forEach((inst, i) => {
      const mesh = meshRefs.current[i];
      if (!mesh) return;
      const angle = inst.orbitOffset + t * inst.orbitSpeed;
      mesh.position.x = Math.cos(angle) * inst.orbitDist;
      mesh.position.z = Math.sin(angle) * inst.orbitDist;
      mesh.position.y = inst.yBase + Math.sin(t * inst.floatSpeed + i * 0.5) * inst.floatAmp;
      mesh.rotation.x += inst.rotSpeed.x;
      mesh.rotation.y += inst.rotSpeed.y;
      mesh.rotation.z += inst.rotSpeed.z;

      if (inst.isAccent && mesh.material instanceof THREE.MeshStandardMaterial) {
        const pulse = 0.5 + Math.sin(t * 2 + i) * 0.3;
        mesh.material.emissiveIntensity = pulse;
      }
    });
  });

  return (
    <Group ref={groupRef}>
      {instances.map((inst, i) => (
        <mesh
          key={i}
          ref={(el: THREE.Mesh | null) => { meshRefs.current[i] = el; }}
          position={[Math.cos(inst.orbitOffset) * inst.orbitDist, inst.yBase, Math.sin(inst.orbitOffset) * inst.orbitDist]}
          scale={inst.scale}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color={inst.color}
            roughness={inst.isAccent ? 0.3 : 0.8}
            metalness={inst.isAccent ? 0.4 : 0.08}
            emissive={inst.isAccent ? "#D4A853" : "#000000"}
            emissiveIntensity={inst.isAccent ? 0.5 : 0}
          />
        </mesh>
      ))}

      {instances.filter((inst) => inst.orbitRing === 0).length > 0 && (
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 1, 0]}>
          <ringGeometry args={[3.8, 4.2, 64]} />
          <meshStandardMaterial
            color="#D4A853"
            emissive="#D4A853"
            emissiveIntensity={0.1}
            transparent
            opacity={0.08}
            roughness={0.5}
            metalness={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </Group>
  );
}
