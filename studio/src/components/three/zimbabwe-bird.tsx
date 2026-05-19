"use client";

import { createElement, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group } from "./r3f-group";
import * as THREE from "three";

export function ZimbabweBird() {
  const groupRef = useRef<THREE.Group>(null);

  const outlinePoints = useMemo(() => {
    const points: [number, number, number][] = [
      [0, 0.8, 0],
      [0.05, 0.75, 0],
      [0.08, 0.65, 0],
      [0.12, 0.5, 0],
      [0.15, 0.35, 0],
      [0.12, 0.2, 0],
      [0.08, 0.12, 0],
      [0.04, 0.05, 0],
      [0, 0, 0],
      [-0.04, 0.05, 0],
      [-0.08, 0.12, 0],
      [-0.12, 0.2, 0],
      [-0.15, 0.35, 0],
      [-0.12, 0.5, 0],
      [-0.08, 0.65, 0],
      [-0.05, 0.75, 0],
      [0, 0.8, 0],
    ];

    const wingRight: [number, number, number][] = [
      [0.12, 0.5, 0],
      [0.25, 0.55, 0.05],
      [0.35, 0.5, 0.08],
      [0.3, 0.45, 0.05],
      [0.15, 0.42, 0],
    ];

    const wingLeft: [number, number, number][] = [
      [-0.12, 0.5, 0],
      [-0.25, 0.55, 0.05],
      [-0.35, 0.5, 0.08],
      [-0.3, 0.45, 0.05],
      [-0.15, 0.42, 0],
    ];

    return [...points, ...wingRight, ...wingLeft];
  }, []);

  const lineGeometry = useMemo(() => {
    const bodyPoints = [
      [0, 0.8, 0],
      [0.05, 0.75, 0],
      [0.08, 0.65, 0],
      [0.12, 0.5, 0],
      [0.15, 0.35, 0],
      [0.12, 0.2, 0],
      [0.08, 0.12, 0],
      [0.04, 0.05, 0],
      [0, 0, 0],
      [-0.04, 0.05, 0],
      [-0.08, 0.12, 0],
      [-0.12, 0.2, 0],
      [-0.15, 0.35, 0],
      [-0.12, 0.5, 0],
      [-0.08, 0.65, 0],
      [-0.05, 0.75, 0],
      [0, 0.8, 0],
    ].map((p) => new THREE.Vector3(p[0], p[1], p[2]));

    const geo = new THREE.BufferGeometry().setFromPoints(bodyPoints);
    return geo;
  }, []);

  const wingRightGeo = useMemo(() => {
    const points = [
      [0.12, 0.5, 0],
      [0.25, 0.55, 0.05],
      [0.35, 0.5, 0.08],
      [0.3, 0.45, 0.05],
      [0.15, 0.42, 0],
    ].map((p) => new THREE.Vector3(p[0], p[1], p[2]));
    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  const wingLeftGeo = useMemo(() => {
    const points = [
      [-0.12, 0.5, 0],
      [-0.25, 0.55, 0.05],
      [-0.35, 0.5, 0.08],
      [-0.3, 0.45, 0.05],
      [-0.15, 0.42, 0],
    ].map((p) => new THREE.Vector3(p[0], p[1], p[2]));
    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  const particlePositions = useMemo(() => {
    const positions: number[] = [];
    outlinePoints.forEach((p) => {
      positions.push(p[0], p[1], p[2]);
    });
    return new Float32Array(positions);
  }, [outlinePoints]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = 4.5 + Math.sin(state.clock.elapsedTime * 0.8) * 0.3;
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <Group ref={groupRef} position={[0, 4.5, 0]} scale={[2.2, 2.2, 2.2]}>
      {createElement('line', { geometry: lineGeometry }, createElement('lineBasicMaterial', { color: "#D4A853", transparent: true, opacity: 0.6 }))}
      {createElement('line', { geometry: wingRightGeo }, createElement('lineBasicMaterial', { color: "#D4A853", transparent: true, opacity: 0.5 }))}
      {createElement('line', { geometry: wingLeftGeo }, createElement('lineBasicMaterial', { color: "#D4A853", transparent: true, opacity: 0.5 }))}

      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particlePositions.length / 3}
            array={particlePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#F5D742"
          size={0.04}
          sizeAttenuation
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </points>

      <pointLight position={[0, 0, 0]} intensity={0.5} color="#F5D742" distance={5} />
    </Group>
  );
}
