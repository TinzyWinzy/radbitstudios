"use client";
import { createElement, forwardRef } from "react";
import type { ReactNode } from "react";
import type * as THREE from "three";

interface GroupProps {
  children?: ReactNode;
  position?: [number, number, number] | THREE.Vector3;
  rotation?: [number, number, number] | THREE.Euler;
  scale?: [number, number, number] | THREE.Vector3;
}

export const Group = forwardRef<THREE.Group, GroupProps>(
  function Group({ children, ...props }, ref) {
    return createElement('group', { ...props, ref }, children);
  }
);
