import { useMemo, useRef, Component } from "react";
import type { ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Line, Float } from "@react-three/drei";
import * as THREE from "three";

const NODE_COLORS = ["#2563EB", "#0D9488", "#0284C7", "#D97706"];

function generateNodes(count: number, radius: number) {
  const nodes: THREE.Vector3[] = [];
  for (let i = 0; i < count; i++) {
    const phi = Math.acos(-1 + (2 * i) / count);
    const theta = Math.sqrt(count * Math.PI) * phi;
    nodes.push(
      new THREE.Vector3(
        radius * Math.cos(theta) * Math.sin(phi),
        radius * Math.sin(theta) * Math.sin(phi),
        radius * Math.cos(phi)
      )
    );
  }
  return nodes;
}

function KnowledgeGraph() {
  const groupRef = useRef<THREE.Group>(null);
  const nodes = useMemo(() => generateNodes(28, 2.6), []);

  const edges = useMemo(() => {
    const pairs: Array<[THREE.Vector3, THREE.Vector3]> = [];
    nodes.forEach((n, i) => {
      const next = nodes[(i + 3) % nodes.length];
      const cross = nodes[(i + 7) % nodes.length];
      if (next) pairs.push([n, next]);
      if (i % 4 === 0 && cross) pairs.push([n, cross]);
    });
    return pairs;
  }, [nodes]);

  useFrame(({ pointer }, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.12;
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        pointer.y * 0.4,
        0.05
      );
      groupRef.current.rotation.z = THREE.MathUtils.lerp(
        groupRef.current.rotation.z,
        -pointer.x * 0.4,
        0.05
      );
    }
  });

  return (
    <group ref={groupRef}>
      {edges.map((edge, i) => (
        <Line key={i} points={edge} color="#CBD5E1" transparent opacity={0.6} lineWidth={1} />
      ))}
      {nodes.map((pos, i) => (
        <Float key={i} speed={1.4} rotationIntensity={0} floatIntensity={0.6}>
          <mesh position={pos}>
            <sphereGeometry args={[i % 5 === 0 ? 0.09 : 0.05, 16, 16]} />
            <meshStandardMaterial
              color={NODE_COLORS[i % NODE_COLORS.length]}
              emissive={NODE_COLORS[i % NODE_COLORS.length]}
              emissiveIntensity={0.5}
              toneMapped={false}
            />
          </mesh>
        </Float>
      ))}
      <mesh>
        <sphereGeometry args={[0.22, 32, 32]} />
        <meshStandardMaterial color="#2563EB" emissive="#2563EB" emissiveIntensity={0.8} toneMapped={false} />
      </mesh>
    </group>
  );
}

class CanvasErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.warn("Canvas WebGL error caught gracefully:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full w-full items-center justify-center bg-slate-50/50">
          <div className="h-64 w-64 rounded-full bg-blue-100/50 blur-3xl" />
        </div>
      );
    }
    return this.props.children;
  }
}

export function HeroScene() {
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <CanvasErrorBoundary>
        <Canvas
          camera={{ position: [0, 0, 7], fov: 45 }}
          dpr={[1, 1.5]}
          onCreated={({ gl }) => {
            gl.domElement.addEventListener("webglcontextlost", (e) => e.preventDefault(), false);
          }}
        >
          <ambientLight intensity={0.6} />
          <pointLight position={[5, 5, 5]} intensity={40} color="#2563EB" />
          <pointLight position={[-5, -3, -5]} intensity={25} color="#0D9488" />
          <KnowledgeGraph />
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
}
