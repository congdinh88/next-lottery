import React, { useRef, useMemo, useEffect } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";

const ParticleText = ({ text }: { text: string }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const font = useLoader(FontLoader, "/fonts/Times_New_Roman_Regular.json");
  const startTimeRef = useRef<number>(0);
  const isNumber = useMemo(() => !isNaN(parseInt(text)), [text]);

  useEffect(() => {
    startTimeRef.current = 0;
  }, [text]);

  const easeOutCubic = (t: number): number => --t * t * t + 1;
  const easeInOutQuad = (t: number): number =>
    t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

  const { particlesInitialPositions, particlesExplodeDirections } =
    useMemo(() => {
      const particleCount = isNumber ? 1000 : 2000;
      const fontSize = isNumber ? 2.2 : 1.0;

      const textGeo = new TextGeometry(text, {
        font: font,
        size: fontSize,
        depth: 0.1,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.02,
        bevelSize: 0.01,
        bevelOffset: 0,
        bevelSegments: 3,
      });

      textGeo.center();

      const mesh = new THREE.Mesh(textGeo, new THREE.MeshBasicMaterial());
      const sampler = new MeshSurfaceSampler(mesh).build();

      const initials = new Float32Array(particleCount * 3);
      const directions = new Float32Array(particleCount * 3);
      const tempPos = new THREE.Vector3();

      for (let i = 0; i < particleCount; i++) {
        sampler.sample(tempPos);
        initials[i * 3] = tempPos.x;
        initials[i * 3 + 1] = tempPos.y;
        initials[i * 3 + 2] = tempPos.z;

        const dirX = (Math.random() - 0.5) * 2;
        const dirY = (Math.random() - 0.5) * 2;
        const dirZ = (Math.random() - 0.5) * 2;
        const len = Math.sqrt(dirX * dirX + dirY * dirY + dirZ * dirZ);
        const distance = (3 + Math.random() * 5) * (isNumber ? 1.5 : 1);

        directions[i * 3] = (dirX / len) * distance;
        directions[i * 3 + 1] = (dirY / len) * distance;
        directions[i * 3 + 2] = (dirZ / len) * distance;
      }

      return {
        particlesInitialPositions: initials,
        particlesExplodeDirections: directions,
      };
    }, [font, text, isNumber]);

  useFrame((state) => {
    if (!pointsRef.current) return;

    if (startTimeRef.current === 0) {
      startTimeRef.current = state.clock.getElapsedTime();
    }

    const localTime = state.clock.getElapsedTime() - startTimeRef.current;
    const positions = pointsRef.current.geometry.attributes.position
      .array as Float32Array;
    const count = particlesInitialPositions.length / 3;
    let explosionFactor = 0;

    if (text === "DỪNG") {
      explosionFactor = 0;
    } else if (isNumber) {
      if (localTime < 0.3) {
        explosionFactor = 1 - easeOutCubic(localTime / 0.3);
      } else if (localTime < 0.7) {
        explosionFactor = 0;
      } else if (localTime < 1.0) {
        explosionFactor = easeOutCubic((localTime - 0.7) / 0.3);
      } else {
        explosionFactor = 1;
      }
    } else {
      const t = localTime % 5.0;
      if (t < 3.0) {
        explosionFactor = 0;
      } else if (t < 4.0) {
        explosionFactor = easeOutCubic(t - 3.0);
      } else {
        explosionFactor = 1 - easeInOutQuad(t - 4.0);
      }
    }

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      let wobbleX = 0;
      let wobbleY = 0;

      if (explosionFactor < 0.1) {
        wobbleX = (Math.random() - 0.5) * (isNumber ? 0.05 : 0.03);
        wobbleY =
          Math.sin(state.clock.elapsedTime * 10 + i) * (isNumber ? 0.05 : 0.03);
      }

      positions[i3] =
        particlesInitialPositions[i3] +
        particlesExplodeDirections[i3] * explosionFactor +
        wobbleX;
      positions[i3 + 1] =
        particlesInitialPositions[i3 + 1] +
        particlesExplodeDirections[i3 + 1] * explosionFactor +
        wobbleY;
      positions[i3 + 2] =
        particlesInitialPositions[i3 + 2] +
        particlesExplodeDirections[i3 + 2] * explosionFactor;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;

    if (text === "DỪNG") {
      pointsRef.current.rotation.y = 0;
      pointsRef.current.rotation.x = 0;
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      pointsRef.current.scale.set(scale, scale, scale);
    } else if (!isNumber) {
      pointsRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    } else {
      pointsRef.current.rotation.y = 0;
      pointsRef.current.rotation.x = 0;
      const scale = 1 + Math.sin(state.clock.elapsedTime * 15) * 0.03;
      pointsRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <points ref={pointsRef} position={isNumber ? [0, 0.5, 0] : [0, 0.5, 0]}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[new Float32Array(particlesInitialPositions), 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={isNumber ? 0.12 : 0.08}
        color="#ffffff"
        sizeAttenuation={true}
        transparent={true}
        opacity={1}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default ParticleText;