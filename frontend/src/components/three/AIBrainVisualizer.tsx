import { useRef, useMemo, Component, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

function NeuralCore() {
  const coreRef = useRef<THREE.Group>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  // Generate orbital particles
  const [positions, colors] = useMemo(() => {
    const count = 120;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const palette = [
      new THREE.Color("#3B82F6"),
      new THREE.Color("#6366F1"),
      new THREE.Color("#0D9488"),
      new THREE.Color("#38BDF8"),
    ];

    for (let i = 0; i < count; i++) {
      const radius = 1.6 + Math.random() * 0.9;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);

      const color = palette[i % palette.length]!;
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
    }

    return [pos, col];
  }, []);

  useFrame(({ pointer }, delta) => {
    if (coreRef.current) {
      // Subtle parallax response to mouse cursor
      coreRef.current.rotation.y += delta * 0.25;
      coreRef.current.rotation.x = THREE.MathUtils.lerp(
        coreRef.current.rotation.x,
        pointer.y * 0.35,
        0.05
      );
      coreRef.current.rotation.z = THREE.MathUtils.lerp(
        coreRef.current.rotation.z,
        -pointer.x * 0.35,
        0.05
      );
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x += delta * 0.4;
      ring1Ref.current.rotation.y += delta * 0.2;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z -= delta * 0.3;
      ring2Ref.current.rotation.x -= delta * 0.25;
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.y -= delta * 0.08;
    }
  });

  return (
    <group ref={coreRef}>
      {/* Central Pulsing Holographic Core */}
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh>
          <icosahedronGeometry args={[0.9, 2]} />
          <meshStandardMaterial
            color="#2563EB"
            emissive="#1D4ED8"
            emissiveIntensity={0.6}
            wireframe
            roughness={0.2}
          />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.65, 32, 32]} />
          <meshStandardMaterial
            color="#0D9488"
            emissive="#0D9488"
            emissiveIntensity={0.4}
            transparent
            opacity={0.8}
            roughness={0.1}
          />
        </mesh>
      </Float>

      {/* Orbiting Orbital Ring 1 */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[1.5, 0.02, 16, 64]} />
        <meshStandardMaterial color="#6366F1" emissive="#4F46E5" emissiveIntensity={0.8} />
      </mesh>

      {/* Orbiting Orbital Ring 2 */}
      <mesh ref={ring2Ref}>
        <torusGeometry args={[1.8, 0.015, 16, 64]} />
        <meshStandardMaterial color="#0D9488" emissive="#0D9488" emissiveIntensity={0.8} />
      </mesh>

      {/* Cloud of Synaptic Data Particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.06}
          vertexColors
          transparent
          opacity={0.85}
          sizeAttenuation
        />
      </points>
    </group>
  );
}

class VisualizerErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err: Error) {
    console.warn("AI Visualizer Canvas error handled:", err);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full w-full items-center justify-center bg-blue-50/50 rounded-2xl">
          <div className="h-28 w-28 rounded-full bg-blue-400/20 blur-xl animate-pulse" />
        </div>
      );
    }
    return this.props.children;
  }
}

export function AIBrainVisualizer() {
  return (
    <div className="relative h-44 w-full sm:h-52 overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 shadow-md">
      {/* Decorative ambient gradients */}
      <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-teal-500/10 blur-3xl" />

      {/* 3D Canvas */}
      <VisualizerErrorBoundary>
        <Canvas
          camera={{ position: [0, 0, 4.2], fov: 45 }}
          dpr={[1, 1.5]}
          onCreated={({ gl }) => {
            gl.domElement.addEventListener("webglcontextlost", (e) => e.preventDefault(), false);
          }}
        >
          <ambientLight intensity={0.7} />
          <pointLight position={[5, 5, 5]} intensity={35} color="#38BDF8" />
          <pointLight position={[-5, -4, -3]} intensity={25} color="#2DD4BF" />
          <NeuralCore />
        </Canvas>
      </VisualizerErrorBoundary>

      {/* Floating Info Badge Overlay */}
      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 rounded-full bg-slate-900/70 backdrop-blur-md border border-slate-700/60 px-3 py-1 text-[11px] font-medium text-slate-200 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-teal-400 animate-ping" />
          <span>Real-time Predictive Neural Engine</span>
        </div>
        <div className="hidden sm:block text-[11px] font-mono text-slate-400">
          Accuracy: 94.8%
        </div>
      </div>
    </div>
  );
}
