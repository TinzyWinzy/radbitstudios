"use client";
import { createElement, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface EnclosureWallsProps {
  radiusX?: number;
  radiusZ?: number;
  height?: number;
  segments?: number;
  blockRows?: number;
  inverted?: boolean;
}

const stoneColors = [
  "#6B5E50",
  "#5C5045",
  "#7A6D5E",
  "#4F453A",
  "#6E6354",
];

function randomStoneColor() {
  return stoneColors[Math.floor(Math.random() * stoneColors.length)];
}

export function EnclosureWalls({
  radiusX = 8,
  radiusZ = 5.5,
  height = 3.5,
  segments = 60,
  blockRows = 8,
  inverted = false,
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

  const e = createElement;

  return e('group', { ref: wallGroupRef },
    e('mesh', { position: [0, -height / 2 - 0.2, 0], rotation: [-Math.PI / 2, 0, 0] },
      e('circleGeometry', { args: [radiusX * 0.9, 64] }),
      e('meshStandardMaterial', { color: "#3A3028", roughness: 0.95, metalness: 0.05 })
    ),
    ...wallBlocks.map((block, i) => e('mesh', { key: i, position: block.pos, scale: [inverted ? -block.scale[0] : block.scale[0], block.scale[1], block.scale[2]] },
      e('boxGeometry', { args: [1, 1, 1] }),
      e('meshStandardMaterial', { color: block.color, roughness: 0.85, metalness: 0.03, flatShading: true })
    )),
    ...chevronBlocks.map((chev, i) => e('group', { key: `chev-${i}`, position: chev.pos, rotation: [0, -chev.angle + Math.PI / 2, 0] },
      e('mesh', { position: [0.15, 0, 0], rotation: [0, 0, -0.6] },
        e('boxGeometry', { args: [0.18, 0.18, 0.35] }),
        e('meshStandardMaterial', { color: "#BFA06A", emissive: "#D4A853", emissiveIntensity: 0.3, roughness: 0.3, metalness: 0.2 })
      ),
      e('mesh', { position: [-0.15, 0, 0], rotation: [0, 0, 0.6] },
        e('boxGeometry', { args: [0.18, 0.18, 0.35] }),
        e('meshStandardMaterial', { color: "#BFA06A", emissive: "#D4A853", emissiveIntensity: 0.3, roughness: 0.3, metalness: 0.2 })
      )
    )),
    e('mesh', { position: [0, height / 2 + 0.02, 0], rotation: [-Math.PI / 2, 0, 0] },
      e('ringGeometry', { args: [radiusX * 0.88, radiusX * 0.92, 64] }),
      e('meshStandardMaterial', { color: "#D4A853", emissive: "#D4A853", emissiveIntensity: 0.15, transparent: true, opacity: 0.2, roughness: 0.4, metalness: 0.3 })
    )
  );
}
