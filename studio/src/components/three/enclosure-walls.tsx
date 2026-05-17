"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface EnclosureWallsProps {
  radiusX?: number;
  radiusZ?: number;
  height?: number;
  segments?: number;
  blockRows?: number;
}

const stoneColors = [
  "#6B5E50",
  "#5C5045",
  "#7A6D5E",
  "#4F453A",
  "#6E6354",
];

const techAccentColors = [
  "#D4A853",
  "#C49B4A",
  "#B8903F",
];

function randomStoneColor() {
  return stoneColors[Math.floor(Math.random() * stoneColors.length)];
}

function randomTechAccent() {
  return techAccentColors[Math.floor(Math.random() * techAccentColors.length)];
}

export function EnclosureWalls({
  radiusX = 8,
  radiusZ = 5.5,
  height = 3.5,
  segments = 60,
  blockRows = 8,
}: EnclosureWallsProps) {
  const wallGroupRef = useRef<THREE.Group>(null);

  const { wallBlocks, chevronBlocks } = useMemo(() => {
    const wallBlocks: {
      pos: [number, number, number];
      scale: [number, number, number];
      color: string;
    }[] = [];

    const chevronBlocks: {
      pos: [number, number, number];
      angle: number;
    }[] = [];

    const blockH = height / blockRows;
    const blockD = 0.4;

    const wallPoints: { x: number; z: number; angle: number }[] = [];
    for (let i = 0; i < segments; i++) {
      const t = (i / segments) * Math.PI * 2;
      wallPoints.push({
        x: Math.cos(t) * radiusX,
        z: Math.sin(t) * radiusZ,
        angle: t,
      });
    }

    wallPoints.forEach((pt, segIdx) => {
      const segW = (2 * Math.PI * Math.sqrt((radiusX * radiusX + radiusZ * radiusZ) / 2)) / segments;

      for (let row = 0; row < blockRows; row++) {
        const y = row * blockH - height / 2;
        const wJitter = (Math.random() - 0.5) * segW * 0.08;
        const hJitter = (Math.random() - 0.5) * blockH * 0.05;
        const dJitter = (Math.random() - 0.5) * blockD * 0.05;

        const normalX = Math.cos(pt.angle);
        const normalZ = Math.sin(pt.angle);

        wallBlocks.push({
          pos: [
            pt.x + normalX * dJitter * 0.5,
            y + hJitter,
            pt.z + normalZ * dJitter * 0.5,
          ],
          scale: [
            segW * 0.92 + wJitter,
            blockH * 0.9 + hJitter,
            blockD + dJitter,
          ],
          color: randomStoneColor(),
        });
      }

      if (segIdx % 3 === 0) {
        const y = height / 2;
        const normalX = Math.cos(pt.angle);
        const normalZ = Math.sin(pt.angle);

        chevronBlocks.push({
          pos: [
            pt.x + normalX * blockD * 0.5,
            y + 0.05,
            pt.z + normalZ * blockD * 0.5,
          ],
          angle: pt.angle,
        });
      }
    });

    return { wallBlocks, chevronBlocks };
  }, [radiusX, radiusZ, height, segments, blockRows]);

  useFrame((_state, delta) => {
    if (wallGroupRef.current) {
      wallGroupRef.current.rotation.y += delta * 0.02;
    }
  });

  return (
    <group ref={wallGroupRef}>
      <mesh position={[0, -height / 2 - 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[radiusX * 0.9, 64]} />
        <meshStandardMaterial color="#3A3028" roughness={0.95} metalness={0.05} />
      </mesh>

      {wallBlocks.map((block, i) => (
        <mesh key={i} position={block.pos} scale={block.scale}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color={block.color}
            roughness={0.85}
            metalness={0.03}
            flatShading
          />
        </mesh>
      ))}

      {chevronBlocks.map((chev, i) => (
        <group
          key={`chev-${i}`}
          position={chev.pos}
          rotation={[0, -chev.angle + Math.PI / 2, 0]}
        >
          <mesh position={[0.15, 0, 0]} rotation={[0, 0, -0.6]}>
            <boxGeometry args={[0.18, 0.18, 0.35]} />
            <meshStandardMaterial
              color="#BFA06A"
              emissive="#D4A853"
              emissiveIntensity={0.3}
              roughness={0.3}
              metalness={0.2}
            />
          </mesh>
          <mesh position={[-0.15, 0, 0]} rotation={[0, 0, 0.6]}>
            <boxGeometry args={[0.18, 0.18, 0.35]} />
            <meshStandardMaterial
              color="#BFA06A"
              emissive="#D4A853"
              emissiveIntensity={0.3}
              roughness={0.3}
              metalness={0.2}
            />
          </mesh>
        </group>
      ))}

      <mesh position={[0, height / 2 + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radiusX * 0.88, radiusX * 0.92, 64]} />
        <meshStandardMaterial
          color="#D4A853"
          emissive="#D4A853"
          emissiveIntensity={0.15}
          transparent
          opacity={0.2}
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>
    </group>
  );
}
