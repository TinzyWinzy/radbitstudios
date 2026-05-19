import * as THREE from "three";
import type { ReactNode, RefObject } from "react";

declare module "@react-three/fiber" {
  // Canvas
  export interface CameraConfig {
    position?: [number, number, number];
    fov?: number;
    near?: number;
    far?: number;
    [key: string]: any;
  }

  export interface CanvasProps {
    children?: ReactNode;
    camera?: CameraConfig | Partial<THREE.PerspectiveCamera> | Partial<THREE.OrthographicCamera>;
    gl?: Partial<THREE.WebGLRendererParameters> & {
      toneMapping?: THREE.ToneMapping;
      toneMappingExposure?: number;
    };
    dpr?: [number, number] | number;
    className?: string;
    style?: React.CSSProperties;
    onCreated?: (state: RootState) => void;
    shadows?: boolean;
    [key: string]: any;
  }

  export const Canvas: React.FC<CanvasProps>;

  // Hooks
  export interface RootState {
    camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
    gl: THREE.WebGLRenderer;
    scene: THREE.Scene;
    size: { width: number; height: number };
    clock: { elapsedTime: number; delta: number };
    pointer: { x: number; y: number };
    mouse: { x: number; y: number };
    viewport: { width: number; height: number; factor: number };
    frameloop: "always" | "demand" | "never";
    set: (state: Partial<RootState>) => void;
    get: () => RootState;
    invalidate: () => void;
    advance: (timestamp: number, runGlobalEffects?: boolean) => void;
    setSize: (width: number, height: number) => void;
    setDpr: (dpr: number) => void;
    [key: string]: any;
  }

  export interface FrameCallback {
    (state: RootState, delta: number, xrFrame?: any): void;
  }

  export function useFrame(callback: FrameCallback, renderPriority?: number): void;
  export function useThree(): RootState;

  // Events
  export type ThreeEvent<T = Element> = React.SyntheticEvent<T> & {
    stopPropagation: () => void;
    nativeEvent: MouseEvent | TouchEvent;
    distance: number;
    sourceEvent: MouseEvent | TouchEvent;
    object: THREE.Object3D;
    intersections: THREE.Intersection[];
  };

  // JSX types
  interface ThreeElements {
    group: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      ref?: RefObject<THREE.Group>;
      position?: [number, number, number] | THREE.Vector3;
      rotation?: [number, number, number] | THREE.Euler;
      scale?: [number, number, number] | THREE.Vector3;
    };
    mesh: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      ref?: RefObject<THREE.Mesh>;
      position?: [number, number, number] | THREE.Vector3;
      rotation?: [number, number, number] | THREE.Euler;
      scale?: [number, number, number] | THREE.Vector3;
      geometry?: THREE.BufferGeometry;
      material?: THREE.Material | THREE.Material[];
      onClick?: (e: ThreeEvent) => void;
      onPointerMove?: (e: ThreeEvent) => void;
      onPointerOver?: (e: ThreeEvent) => void;
      onPointerOut?: (e: ThreeEvent) => void;
    };
    points: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      ref?: RefObject<THREE.Points>;
      position?: [number, number, number] | THREE.Vector3;
      rotation?: [number, number, number] | THREE.Euler;
      geometry?: THREE.BufferGeometry;
      material?: THREE.Material | THREE.Material[];
    };
    line: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      geometry?: THREE.BufferGeometry;
      material?: THREE.Material;
    };
    ambientLight: { intensity?: number; color?: string | number };
    directionalLight: {
      position?: [number, number, number] | THREE.Vector3;
      intensity?: number;
      color?: string | number;
    };
    pointLight: {
      position?: [number, number, number] | THREE.Vector3;
      intensity?: number;
      color?: string | number;
      distance?: number;
    };
    meshStandardMaterial: {
      color?: string | number | THREE.Color;
      roughness?: number;
      metalness?: number;
      flatShading?: boolean;
      emissive?: string | number | THREE.Color;
      emissiveIntensity?: number;
      transparent?: boolean;
      opacity?: number;
      side?: THREE.Side;
    };
    meshBasicMaterial: {
      color?: string | number | THREE.Color;
      transparent?: boolean;
      opacity?: number;
      blending?: THREE.Blending;
      depthWrite?: boolean;
    };
    pointsMaterial: {
      color?: string | number | THREE.Color;
      size?: number;
      sizeAttenuation?: boolean;
      transparent?: boolean;
      opacity?: number;
      blending?: THREE.Blending;
      depthWrite?: boolean;
      vertexColors?: boolean;
    };
    lineBasicMaterial: {
      color?: string | number | THREE.Color;
      transparent?: boolean;
      opacity?: number;
    };
    boxGeometry: { args?: [number, number, number, number?, number?, number?] };
    cylinderGeometry: { args?: [number, number, number, number?, number?, boolean?] };
    ringGeometry: { args?: [number, number, number, number?, number?] };
    planeGeometry: { args?: [number, number, number?, number?] };
    sphereGeometry: { args?: [number, number?, number?] };
    bufferGeometry: { attach?: string };
    bufferAttribute: {
      attach?: string;
      count: number;
      array: Float32Array;
      itemSize: number;
    };
    primitive: { object: THREE.Object3D | THREE.Material };
    torusGeometry: { args?: [number, number, number, number?, number?, number?] };
    lineSegments: { args?: [THREE.BufferGeometry, THREE.Material] };
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: any;
      mesh: any;
      points: any;
      line: any & { geometry?: THREE.BufferGeometry; material?: THREE.Material | THREE.Material[] };
      ambientLight: any;
      directionalLight: any;
      pointLight: any;
      meshStandardMaterial: any;
      meshBasicMaterial: any;
      pointsMaterial: any;
      lineBasicMaterial: any;
      boxGeometry: any;
      cylinderGeometry: any;
      torusGeometry: any;
      ringGeometry: any;
      lineSegments: any;
      planeGeometry: any;
      sphereGeometry: any;
      bufferGeometry: any;
      bufferAttribute: any;
      primitive: any;
    }
  }
}

declare module "@react-three/postprocessing" {
  import type { ReactNode } from "react";

  export interface EffectComposerProps {
    children?: ReactNode;
    [key: string]: any;
  }

  export const EffectComposer: React.FC<EffectComposerProps>;

  export interface BloomProps {
    intensity?: number;
    luminanceThreshold?: number;
    luminanceSmoothing?: number;
    mipmapBlur?: boolean;
    [key: string]: any;
  }

  export const Bloom: React.FC<BloomProps>;

  export interface VignetteProps {
    darkness?: number;
    offset?: number;
    [key: string]: any;
  }

  export const Vignette: React.FC<VignetteProps>;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: any;
      mesh: any;
      points: any;
      line: any;
      ambientLight: any;
      directionalLight: any;
      pointLight: any;
      meshStandardMaterial: any;
      meshBasicMaterial: any;
      pointsMaterial: any;
      lineBasicMaterial: any;
      boxGeometry: any;
      cylinderGeometry: any;
      ringGeometry: any;
      planeGeometry: any;
      sphereGeometry: any;
      bufferGeometry: any;
      bufferAttribute: any;
      primitive: any;
    }
  }
}
