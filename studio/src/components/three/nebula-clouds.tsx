"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group } from "./r3f-group";
import * as THREE from "three";

interface NebulaCloudsProps {
  count?: number;
}

const vertexShader = `
varying vec2 vUv;
uniform float uTime;
void main() {
  vUv = uv;
  vec3 pos = position;
  pos.x += sin(uTime * 0.02 + position.y * 0.5) * 0.5;
  pos.y += cos(uTime * 0.015 + position.x * 0.3) * 0.3;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;
uniform float uTime;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform float uOpacity;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

void main() {
  vec2 uv = vUv;
  float n = noise(uv * 3.0 + uTime * 0.005);
  float n2 = noise(uv * 5.0 - uTime * 0.008 + 10.0);
  float alpha = smoothstep(0.3, 0.8, n * 0.7 + n2 * 0.3);
  alpha *= uOpacity;
  alpha *= smoothstep(0.0, 0.3, uv.y) * smoothstep(1.0, 0.7, uv.y);
  vec3 color = mix(uColor1, uColor2, n);
  color = mix(color, uColor3, n2 * 0.5);
  gl_FragColor = vec4(color, alpha);
}
`;

const palettes = [
  { c1: [0.4, 0.1, 0.5], c2: [0.1, 0.3, 0.6], c3: [0.5, 0.2, 0.3] },
  { c1: [0.6, 0.3, 0.1], c2: [0.1, 0.4, 0.4], c3: [0.3, 0.1, 0.5] },
  { c1: [0.2, 0.1, 0.4], c2: [0.5, 0.2, 0.3], c3: [0.1, 0.3, 0.3] },
];

export function NebulaClouds({ count = 4 }: NebulaCloudsProps) {
  const groupRef = useRef<THREE.Group>(null);
  const uniformsRef = useRef<{ uTime: { value: number } }>({ uTime: { value: 0 } });

  const clouds = useMemo(() => {
    const result = [];
    for (let i = 0; i < count; i++) {
      const palette = palettes[i % palettes.length];
      const w = 15 + Math.random() * 20;
      const h = 10 + Math.random() * 15;
      const z = -20 - Math.random() * 30;
      const x = (Math.random() - 0.5) * 40;
      const y = (Math.random() - 0.5) * 15 + 5;

      const geo = new THREE.PlaneGeometry(w, h);
      const mat = new THREE.ShaderMaterial({
        uniforms: {
          uTime: uniformsRef.current.uTime,
          uColor1: { value: new THREE.Color(...palette.c1) },
          uColor2: { value: new THREE.Color(...palette.c2) },
          uColor3: { value: new THREE.Color(...palette.c3) },
          uOpacity: { value: 0.2 + Math.random() * 0.15 },
        },
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      });

      result.push({
        geometry: geo,
        material: mat,
        position: [x, y, z] as [number, number, number],
        rotation: [0, Math.random() * Math.PI * 2, Math.random() * 0.5] as [number, number, number],
        speed: 0.1 + Math.random() * 0.2,
      });
    }
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  useFrame((state: { clock: { elapsedTime: number } }) => {
    uniformsRef.current.uTime.value = state.clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.0005;
    }
  });

  return (
    <Group ref={groupRef}>
      {clouds.map((cloud, i) => (
        <mesh
          key={i}
          geometry={cloud.geometry}
          material={cloud.material}
          position={cloud.position}
          rotation={cloud.rotation}
        />
      ))}
    </Group>
  );
}
