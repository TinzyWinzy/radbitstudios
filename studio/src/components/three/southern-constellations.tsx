"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group } from "./r3f-group";
import * as THREE from "three";

interface SouthernConstellationsProps {
  wallRadiusX?: number;
  wallRadiusZ?: number;
  wallHeight?: number;
}

const constellationData: {
  name: string;
  stars: [number, number, number][];
  lines: [number, number][];
}[] = [
  {
    name: "Crux",
    stars: [
      [0, 0.8, 0],
      [0, -0.2, 0],
      [0, -0.8, 0],
      [0.6, -0.2, 0],
      [-0.6, -0.2, 0],
    ],
    lines: [[0, 1], [1, 2], [3, 1], [4, 1]],
  },
  {
    name: "Triangulum Australe",
    stars: [
      [0, 0.7, 0],
      [0.6, -0.4, 0],
      [-0.6, -0.4, 0],
    ],
    lines: [[0, 1], [1, 2], [2, 0]],
  },
  {
    name: "Carina",
    stars: [
      [-0.5, 0.6, 0],
      [0, 0.3, 0],
      [0.5, 0.1, 0],
      [0.3, -0.3, 0],
      [-0.2, -0.5, 0],
      [-0.7, -0.2, 0],
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0]],
  },
  {
    name: "Centaurus",
    stars: [
      [0.8, 0.7, 0],
      [0.5, 0.4, 0],
      [0.2, 0.1, 0],
      [-0.1, -0.2, 0],
      [-0.4, -0.5, 0],
      [0.3, -0.3, 0],
      [0.7, -0.1, 0],
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [3, 5], [5, 6], [6, 2]],
  },
  {
    name: "Grus",
    stars: [
      [-0.3, 0.8, 0],
      [0, 0.5, 0],
      [0.3, 0.2, 0],
      [0.1, -0.2, 0],
      [-0.2, -0.5, 0],
      [-0.5, -0.3, 0],
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0]],
  },
  {
    name: "Tucana",
    stars: [
      [0, 0.6, 0],
      [0.4, 0.3, 0],
      [0.3, -0.1, 0],
      [0, -0.4, 0],
      [-0.4, -0.2, 0],
      [-0.3, 0.2, 0],
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0]],
  },
];

export function SouthernConstellations({
  wallRadiusX = 8,
  wallRadiusZ = 5.5,
  wallHeight = 3.5,
}: SouthernConstellationsProps) {
  const groupRef = useRef<THREE.Group>(null);

  const constellationMeshes = useMemo(() => {
    return constellationData.map((constellation, idx) => {
      const angle = (idx / constellationData.length) * Math.PI * 2 + 0.3;
      const yBase = 0.5 + (idx % 3) * 1.2;

      const worldStars = constellation.stars.map(([x, y]) => {
        const wallX = Math.cos(angle) * (wallRadiusX - 0.6);
        const wallZ = Math.sin(angle) * (wallRadiusZ - 0.6);
        const offsetX = Math.cos(angle) * x * 1.5;
        const offsetZ = Math.sin(angle) * x * 1.5;
        return [
          wallX + offsetX,
          yBase + y,
          wallZ + offsetZ,
        ] as [number, number, number];
      });

      const linePoints: [number, number, number][] = [];
      constellation.lines.forEach(([a, b]) => {
        linePoints.push(worldStars[a]);
        linePoints.push(worldStars[b]);
      });

      const starPositions = new Float32Array(worldStars.flat());
      const linePositions = new Float32Array(linePoints.flat());

      return {
        starPositions,
        linePositions,
        angle,
        yBase,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallRadiusX, wallRadiusZ, wallHeight]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001;
    }

    constellationMeshes.forEach((_, i) => {
      const starMesh = groupRef.current?.children[i * 2] as THREE.Points | undefined;
      if (starMesh && starMesh.material instanceof THREE.PointsMaterial) {
        const pulse = 0.6 + Math.sin(state.clock.elapsedTime * 1.2 + i * 0.8) * 0.3;
        starMesh.material.opacity = pulse;
      }
    });
  });

  return (
    <Group ref={groupRef}>
      {constellationMeshes.map((data, i) => (
        <Group key={`constellation-${i}`}>
          <points>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={data.starPositions.length / 3}
                array={data.starPositions}
                itemSize={3}
              />
            </bufferGeometry>
            <pointsMaterial
              color="#F5D742"
              size={0.08}
              sizeAttenuation
              transparent
              opacity={0.8}
              blending={THREE.AdditiveBlending}
            />
          </points>

          <lineSegments>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={data.linePositions.length / 3}
                array={data.linePositions}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial
              color="#D4A853"
              transparent
              opacity={0.35}
              blending={THREE.AdditiveBlending}
            />
          </lineSegments>
        </Group>
      ))}
    </Group>
  );
}
