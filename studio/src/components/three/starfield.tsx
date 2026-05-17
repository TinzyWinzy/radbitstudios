"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface StarfieldProps {
  count?: number;
  radius?: number;
}

const vertexShader = `
attribute float aSize;
attribute float aTwinkleSpeed;
attribute float aTwinklePhase;
attribute vec3 vColor;
uniform float uTime;
varying vec3 vColorV;
varying float vAlpha;
void main() {
  vColorV = vColor;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  float twinkle = 0.6 + 0.4 * sin(uTime * aTwinkleSpeed + aTwinklePhase);
  vAlpha = twinkle;
  gl_PointSize = aSize * (300.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}
`;

const fragmentShader = `
varying vec3 vColorV;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - vec2(0.5));
  if (d > 0.5) discard;
  float alpha = smoothstep(0.5, 0.0, d) * vAlpha;
  gl_FragColor = vec4(vColorV, alpha);
}
`;

export function Starfield({ count = 8000, radius = 80 }: StarfieldProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const uniformRef = useRef({ uTime: { value: 0 } });

  const geometry = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const speeds = new Float32Array(count);
    const phases = new Float32Array(count);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = radius * Math.cbrt(Math.random());
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      sizes[i] = 0.5 + Math.random() * 2.5;
      speeds[i] = 0.3 + Math.random() * 0.7;
      phases[i] = Math.random() * Math.PI * 2;

      const ct = Math.random();
      if (ct < 0.6) {
        colors[i * 3] = 0.9 + Math.random() * 0.1;
        colors[i * 3 + 1] = 0.85 + Math.random() * 0.15;
        colors[i * 3 + 2] = 0.8 + Math.random() * 0.2;
      } else if (ct < 0.85) {
        colors[i * 3] = 0.6 + Math.random() * 0.2;
        colors[i * 3 + 1] = 0.7 + Math.random() * 0.2;
        colors[i * 3 + 2] = 1.0;
      } else {
        colors[i * 3] = 1.0;
        colors[i * 3 + 1] = 0.6 + Math.random() * 0.2;
        colors[i * 3 + 2] = 0.3 + Math.random() * 0.2;
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute("aTwinkleSpeed", new THREE.BufferAttribute(speeds, 1));
    geo.setAttribute("aTwinklePhase", new THREE.BufferAttribute(phases, 1));
    geo.setAttribute("vColor", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [count, radius]);

  const material = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      uniforms: { uTime: uniformRef.current.uTime },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return mat;
  }, []);

  useFrame((state: { clock: { elapsedTime: number }; pointer: { x: number; y: number } }) => {
    uniformRef.current.uTime.value = state.clock.elapsedTime;
    if (pointsRef.current) {
      const mx = (state.pointer.x * Math.PI) / 6;
      const my = (state.pointer.y * Math.PI) / 6;
      pointsRef.current.rotation.x = my * 0.1;
      pointsRef.current.rotation.y = mx * 0.15;
    }
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}
