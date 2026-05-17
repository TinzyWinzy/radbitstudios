"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const stoneColor = new THREE.Color(0.42, 0.36, 0.28);
const stoneColorDark = new THREE.Color(0.3, 0.25, 0.2);

interface ConicalTowerProps {
  position?: [number, number, number];
  height?: number;
  baseRadius?: number;
  topRadius?: number;
  courses?: number;
}

export function ConicalTower({
  position = [0, 0, 0],
  height = 3.5,
  baseRadius = 1.5,
  topRadius = 0.8,
  courses = 15,
}: ConicalTowerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  const courseData = useMemo(() => {
    const data: { y: number; radius: number; height: number; color: string }[] = [];
    const courseHeight = height / courses;
    for (let i = 0; i < courses; i++) {
      const t = i / courses;
      const r = baseRadius + (topRadius - baseRadius) * t;
      const yOffset = i * courseHeight - height / 2;
      const shade = 0.85 + 0.15 * Math.sin(i * 1.2);
      const c = stoneColor.clone().multiplyScalar(shade);
      data.push({
        y: yOffset,
        radius: r,
        height: courseHeight * 0.88,
        color: c.getStyle(),
      });
    }
    return data;
  }, [height, baseRadius, topRadius, courses]);

  const glowRingData = useMemo(() => {
    const rings: { y: number; radius: number }[] = [];
    const ringPositions = [0.25, 0.5, 0.75];
    for (const t of ringPositions) {
      const r = baseRadius + (topRadius - baseRadius) * t;
      const yOffset = t * height - height / 2;
      rings.push({ y: yOffset, radius: r + 0.05 });
    }
    return rings;
  }, [height, baseRadius, topRadius]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.03;
    }
    if (glowRef.current) {
      const pulse = 0.4 + Math.sin(state.clock.elapsedTime * 1.5) * 0.15;
      const material = glowRef.current.material as THREE.MeshStandardMaterial;
      material.opacity = pulse;
      material.emissiveIntensity = pulse * 2;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {courseData.map((course, i) => (
        <mesh key={i} position={[0, course.y, 0]}>
          <cylinderGeometry args={[course.radius, course.radius, course.height, 32]} />
          <meshStandardMaterial color={course.color} roughness={0.8} metalness={0.08} />
        </mesh>
      ))}

      <mesh position={[0, -height / 2 - 0.15, 0]}>
        <cylinderGeometry args={[baseRadius + 0.4, baseRadius + 0.4, 0.2, 32]} />
        <meshStandardMaterial color={stoneColorDark.getStyle()} roughness={0.9} metalness={0.08} />
      </mesh>

      {glowRingData.map((ring, i) => (
        <mesh key={`glow-${i}`} position={[0, ring.y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[ring.radius, 0.03, 8, 48]} />
          <meshStandardMaterial
            color="#D4A853"
            emissive="#D4A853"
            emissiveIntensity={1}
            transparent
            opacity={0.5}
            roughness={0.2}
            metalness={0.5}
          />
        </mesh>
      ))}

      <mesh ref={glowRef} position={[0, height / 2 + 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[topRadius + 0.1, 0.06, 8, 48]} />
        <meshStandardMaterial
          color="#F5D742"
          emissive="#F5D742"
          emissiveIntensity={1.5}
          transparent
          opacity={0.6}
          roughness={0.1}
          metalness={0.6}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <pointLight position={[0, height / 2 + 0.5, 0]} intensity={0.8} color="#F5D742" distance={8} />
    </group>
  );
}
