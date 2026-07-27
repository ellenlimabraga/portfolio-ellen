"use client";
// Adapted from React Bits — Lanyard (3D). rapier rope physics + meshline band.
// The original loads card.glb + lanyard.png from the registry (blocked here),
// so the badge card and band are built procedurally in-project. Owned source.
import { useEffect, useRef, useState } from "react";
import { Canvas, extend, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, RoundedBox } from "@react-three/drei";
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
} from "@react-three/rapier";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import * as THREE from "three";
import "./Lanyard.css";

extend({ MeshLineGeometry, MeshLineMaterial });

export default function Lanyard({
  position = [0, 0, 22],
  gravity = [0, -40, 0],
  fov = 20,
  transparent = true,
}) {
  return (
    <div className="lanyard-wrapper">
      <Canvas
        camera={{ position, fov }}
        gl={{ alpha: transparent, antialias: true }}
        dpr={[1, 2]}
        onCreated={({ gl }) =>
          gl.setClearColor(new THREE.Color(0, 0, 0), transparent ? 0 : 1)
        }
      >
        <ambientLight intensity={Math.PI} />
        <Physics gravity={gravity} timeStep={1 / 60}>
          <Band />
        </Physics>
        <Environment blur={0.75}>
          <Lightformer intensity={2.2} color="#ff9838" position={[0, -1, 5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={2.2} color="#ff2d78" position={[-1, -1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={2.2} color="#a855f7" position={[1, 1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={5} color="white" position={[-10, 0, 14]} rotation={[0, Math.PI / 2, Math.PI / 3]} scale={[100, 10, 1]} />
        </Environment>
      </Canvas>
    </div>
  );
}

function Band({ maxSpeed = 50, minSpeed = 10 }) {
  const band = useRef();
  const fixed = useRef();
  const j1 = useRef();
  const j2 = useRef();
  const j3 = useRef();
  const card = useRef();
  const vec = new THREE.Vector3();
  const ang = new THREE.Vector3();
  const rot = new THREE.Vector3();
  const dir = new THREE.Vector3();
  const segmentProps = {
    type: "dynamic",
    canSleep: true,
    colliders: false,
    angularDamping: 4,
    linearDamping: 4,
  };

  const { width, height } = useThree((state) => state.size);
  const [curve] = useState(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
      ])
  );
  const [dragged, drag] = useState(false);
  const [hovered, hover] = useState(false);
  const [bandTexture] = useState(() => makeBandTexture());

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, card, [[0, 0, 0], [0, 1.45, 0]]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? "grabbing" : "grab";
      return () => {
        document.body.style.cursor = "auto";
      };
    }
  }, [hovered, dragged]);

  useFrame((state, delta) => {
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach((r) => r.current?.wakeUp());
      card.current?.setNextKinematicTranslation({
        x: vec.x - dragged.x,
        y: vec.y - dragged.y,
        z: vec.z - dragged.z,
      });
    }
    if (fixed.current) {
      const dt = Math.min(0.033, delta); // clamp spikes so the solver stays stable
      [j1, j2].forEach((ref) => {
        if (!ref.current.lerped)
          ref.current.lerped = new THREE.Vector3().copy(ref.current.translation());
        const clampedDistance = Math.max(
          0.1,
          Math.min(1, ref.current.lerped.distanceTo(ref.current.translation()))
        );
        // clamp alpha to <= 1 to avoid extrapolation that can diverge to NaN
        const alpha = Math.min(1, dt * (minSpeed + clampedDistance * (maxSpeed - minSpeed)));
        ref.current.lerped.lerp(ref.current.translation(), alpha);
      });
      curve.points[0].copy(j3.current.translation());
      curve.points[1].copy(j2.current.lerped);
      curve.points[2].copy(j1.current.lerped);
      curve.points[3].copy(fixed.current.translation());
      const pts = curve.getPoints(32);
      const flat = new Float32Array(pts.length * 3);
      let finite = true;
      for (let i = 0; i < pts.length; i++) {
        flat[i * 3] = pts[i].x;
        flat[i * 3 + 1] = pts[i].y;
        flat[i * 3 + 2] = pts[i].z;
        if (!Number.isFinite(pts[i].x) || !Number.isFinite(pts[i].y) || !Number.isFinite(pts[i].z))
          finite = false;
      }
      if (finite) band.current.geometry.setPoints(flat);
      ang.copy(card.current.angvel());
      rot.copy(card.current.rotation());
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
    }
  });

  curve.curveType = "chordal";

  return (
    <>
      <group position={[0, 4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody
          position={[2, 0, 0]}
          ref={card}
          {...segmentProps}
          type={dragged ? "kinematicPosition" : "dynamic"}
        >
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={2.25}
            position={[0, 0, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={(e) => {
              e.target.releasePointerCapture(e.pointerId);
              drag(false);
            }}
            onPointerDown={(e) => {
              e.target.setPointerCapture(e.pointerId);
              drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())));
            }}
          >
            <CardMesh />
          </group>
        </RigidBody>
      </group>
      <mesh ref={band} frustumCulled={false}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={[width, height]}
          useMap
          map={bandTexture}
          repeat={[-3, 1]}
          lineWidth={1}
        />
      </mesh>
    </>
  );
}

function CardMesh() {
  const [tex] = useState(() => makeCardTexture());
  // sized to match the collider once the parent group is scaled 2.25x
  // (0.71 x 1.0 -> 1.6 x 2.25 full extents)
  return (
    <group>
      {/* metal clip + ring on top */}
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[0.14, 0.1, 0.05]} />
        <meshStandardMaterial color="#e4cf94" metalness={0.95} roughness={0.28} />
      </mesh>
      <mesh position={[0, 0.63, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.05, 0.018, 12, 24]} />
        <meshStandardMaterial color="#e4cf94" metalness={0.95} roughness={0.28} />
      </mesh>
      {/* card body (rounded, dark) */}
      <RoundedBox args={[0.71, 1.0, 0.02]} radius={0.04} smoothness={5}>
        <meshPhysicalMaterial
          color="#0a0605"
          clearcoat={1}
          clearcoatRoughness={0.15}
          roughness={0.5}
          metalness={0.35}
        />
      </RoundedBox>
      {/* crisp badge face (flat plane, correct UVs) */}
      <mesh position={[0, 0, 0.012]}>
        <planeGeometry args={[0.69, 0.98]} />
        <meshPhysicalMaterial map={tex} roughness={0.5} clearcoat={0.6} clearcoatRoughness={0.2} />
      </mesh>
      <mesh position={[0, 0, -0.012]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.69, 0.98]} />
        <meshPhysicalMaterial map={tex} roughness={0.5} />
      </mesh>
    </group>
  );
}

/* ---- procedural textures (canvas) ---- */
function makeCardTexture() {
  const w = 512;
  const h = 720;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const x = c.getContext("2d");
  // background
  const bg = x.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, "#160a10");
  bg.addColorStop(1, "#0a0605");
  x.fillStyle = bg;
  x.fillRect(0, 0, w, h);
  x.strokeStyle = "rgba(245,182,66,0.35)";
  x.lineWidth = 4;
  x.strokeRect(14, 14, w - 28, h - 28);

  // tag
  x.fillStyle = "#f5b642";
  x.font = "600 24px 'JetBrains Mono', monospace";
  x.textAlign = "center";
  x.fillText("I A   ·   G E N", w / 2, 96);

  // avatar
  const cx = w / 2;
  const cy = 250;
  const r = 88;
  const g = x.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  g.addColorStop(0, "#ff9838");
  g.addColorStop(0.5, "#ff2d78");
  g.addColorStop(1, "#a855f7");
  x.fillStyle = g;
  x.beginPath();
  x.arc(cx, cy, r, 0, Math.PI * 2);
  x.fill();
  x.fillStyle = "#0b0603";
  x.font = "700 76px 'Space Grotesk', sans-serif";
  x.fillText("EB", cx, cy + 26);

  // name
  x.fillStyle = "#f4ede2";
  x.font = "700 44px 'Space Grotesk', sans-serif";
  x.fillText("ELLEN BRAGA", cx, 420);
  x.fillStyle = "#a99e8f";
  x.font = "400 26px 'JetBrains Mono', monospace";
  x.fillText("Creative Director", cx, 462);

  // barcode
  let bx = 90;
  const by = 560;
  x.fillStyle = "#f4ede2";
  while (bx < w - 90) {
    const bw = 2 + Math.round(Math.random() * 6);
    x.globalAlpha = 0.5 + Math.random() * 0.5;
    x.fillRect(bx, by, bw, 90);
    bx += bw + 2 + Math.round(Math.random() * 5);
  }
  x.globalAlpha = 1;
  x.fillStyle = "#6a6156";
  x.font = "400 20px 'JetBrains Mono', monospace";
  x.fillText("ellenbraga.com", cx, 690);

  const t = new THREE.CanvasTexture(c);
  t.anisotropy = 8;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function makeBandTexture() {
  const c = document.createElement("canvas");
  c.width = 16;
  c.height = 256;
  const x = c.getContext("2d");
  const g = x.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, "#ff9838");
  g.addColorStop(0.5, "#ff2d78");
  g.addColorStop(1, "#a855f7");
  x.fillStyle = g;
  x.fillRect(0, 0, 16, 256);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
