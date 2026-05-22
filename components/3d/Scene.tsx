"use client";

import { Canvas } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Float,
  OrbitControls
} from "@react-three/drei";
import MangoMesh from "./MangoMesh";

export default function Scene() {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 0.5, 5], fov: 38 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.4}
        color="#fff7e8"
        castShadow
      />
      <pointLight position={[-3, 2, -3]} intensity={0.6} color="#ffb01f" />

      <Float speed={1.2} rotationIntensity={0.4} floatIntensity={0.6}>
        <MangoMesh />
      </Float>

      <ContactShadows
        position={[0, -1.6, 0]}
        opacity={0.45}
        scale={8}
        blur={2.4}
        far={4}
        color="#7a3f0d"
      />

      <Environment preset="sunset" />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.8}
        minPolarAngle={Math.PI / 2.6}
        maxPolarAngle={Math.PI / 1.8}
      />
    </Canvas>
  );
}
