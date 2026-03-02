import React, { useRef, useImperativeHandle, forwardRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { parseMoveFor3D } from '@/lib/rubiks-logic';

const CUBIE_SIZE = 0.96; // Slightly less than 1 to give a gap
const SPACING = 1;

// Colors matching standard Rubik's Cube but slightly neon/high-tech for our theme
const COLORS = {
  U: '#ffffff', // Up
  D: '#ffd500', // Down
  F: '#00ff3c', // Front
  B: '#0044ff', // Back
  L: '#ff8800', // Left
  R: '#ff0040', // Right
  Core: '#1a1a24' // Inside plastic
};

interface CubieData {
  id: number;
  initialPos: THREE.Vector3;
  mesh: THREE.Mesh | null;
}

export interface CubeRef {
  animateSequence: (sequence: string[], speedMs: number, onComplete: () => void) => void;
  animateMove: (move: string, speedMs: number, onComplete: () => void) => void;
  resetCube: () => void;
}

export const Cube3D = forwardRef<CubeRef>((props, ref) => {
  const groupRef = useRef<THREE.Group>(null);
  
  // Create 27 cubies
  const cubies = useMemo(() => {
    const arr: CubieData[] = [];
    let id = 0;
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          arr.push({
            id: id++,
            initialPos: new THREE.Vector3(x * SPACING, y * SPACING, z * SPACING),
            mesh: null,
          });
        }
      }
    }
    return arr;
  }, []);

  // Animation State
  const animState = useRef({
    isActive: false,
    axis: 'x' as 'x'|'y'|'z',
    layerFilter: (val: number) => false,
    targetAngle: 0,
    currentAngle: 0,
    speed: 0,
    activeCubies: [] as THREE.Mesh[],
    onComplete: null as (() => void) | null,
    
    // Sequence handling
    sequence: [] as string[],
    seqIndex: 0,
    seqSpeed: 300,
    seqOnComplete: null as (() => void) | null,
  });

  // Materials
  const materials = useMemo(() => {
    return [
      new THREE.MeshStandardMaterial({ color: COLORS.R, roughness: 0.2, metalness: 0.8 }), // Right (x+)
      new THREE.MeshStandardMaterial({ color: COLORS.L, roughness: 0.2, metalness: 0.8 }), // Left (x-)
      new THREE.MeshStandardMaterial({ color: COLORS.U, roughness: 0.2, metalness: 0.8 }), // Top (y+)
      new THREE.MeshStandardMaterial({ color: COLORS.D, roughness: 0.2, metalness: 0.8 }), // Bottom (y-)
      new THREE.MeshStandardMaterial({ color: COLORS.F, roughness: 0.2, metalness: 0.8 }), // Front (z+)
      new THREE.MeshStandardMaterial({ color: COLORS.B, roughness: 0.2, metalness: 0.8 }), // Back (z-)
    ];
  }, []);

  // Black core material for internal faces
  const coreMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: COLORS.Core, roughness: 0.9 }), []);

  const triggerMove = (moveStr: string, durationMs: number, onComplete?: () => void) => {
    if (animState.current.isActive) return;
    
    const parsed = parseMoveFor3D(moveStr);
    
    // Find cubies in the target layer
    const active = [];
    if (groupRef.current) {
      groupRef.current.children.forEach((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        // Check world position to determine if it's in the layer
        const pos = new THREE.Vector3();
        child.getWorldPosition(pos);
        // Round to nearest int to avoid float imprecision
        pos.x = Math.round(pos.x);
        pos.y = Math.round(pos.y);
        pos.z = Math.round(pos.z);
        
        const val = pos[parsed.axis];
        if (parsed.layerFilter(val)) {
          active.push(child);
        }
      });
    }

    animState.current = {
      ...animState.current,
      isActive: true,
      axis: parsed.axis,
      targetAngle: parsed.angle,
      currentAngle: 0,
      // Calculate angular speed per frame (assuming 60fps)
      speed: Math.abs(parsed.angle) / (durationMs / 16.66),
      activeCubies: active,
      onComplete: onComplete || null
    };
  };

  const processSequence = () => {
    const st = animState.current;
    if (st.seqIndex < st.sequence.length) {
      const nextMove = st.sequence[st.seqIndex];
      st.seqIndex++;
      triggerMove(nextMove, st.seqSpeed, () => {
        processSequence(); // Call next move
      });
    } else {
      // Sequence done
      if (st.seqOnComplete) st.seqOnComplete();
      st.sequence = [];
    }
  };

  useImperativeHandle(ref, () => ({
    animateMove: (move: string, speed: number, cb: () => void) => {
      triggerMove(move, speed, cb);
    },
    animateSequence: (seq: string[], speed: number, cb: () => void) => {
      animState.current.sequence = seq;
      animState.current.seqIndex = 0;
      animState.current.seqSpeed = speed;
      animState.current.seqOnComplete = cb;
      processSequence();
    },
    resetCube: () => {
      if (!groupRef.current) return;
      animState.current.isActive = false;
      animState.current.sequence = [];
      // Reset all rotations and positions to original
      cubies.forEach((cubie, i) => {
        const mesh = groupRef.current!.children[i] as THREE.Mesh;
        if (mesh) {
          mesh.position.copy(cubie.initialPos);
          mesh.rotation.set(0, 0, 0);
          mesh.updateMatrix();
        }
      });
    }
  }));

  // Temp vector/quaternion for math
  const axisVector = useMemo(() => new THREE.Vector3(), []);
  const q = useMemo(() => new THREE.Quaternion(), []);

  useFrame(() => {
    const st = animState.current;
    if (!st.isActive) return;

    let step = st.speed;
    let nextAngle = st.currentAngle + (st.targetAngle > 0 ? step : -step);

    // Clamp at target
    let done = false;
    if ((st.targetAngle > 0 && nextAngle >= st.targetAngle) || 
        (st.targetAngle < 0 && nextAngle <= st.targetAngle)) {
      step = Math.abs(st.targetAngle - st.currentAngle); // just the remainder
      nextAngle = st.targetAngle;
      done = true;
    }

    const actualRotation = st.targetAngle > 0 ? step : -step;
    st.currentAngle = nextAngle;

    // Apply rotation to active meshes around the origin
    axisVector.set(
      st.axis === 'x' ? 1 : 0,
      st.axis === 'y' ? 1 : 0,
      st.axis === 'z' ? 1 : 0
    );
    q.setFromAxisAngle(axisVector, actualRotation);

    st.activeCubies.forEach(mesh => {
      mesh.position.applyQuaternion(q);
      mesh.quaternion.premultiply(q);
    });

    if (done) {
      // Snap to grid to fix float drift
      st.activeCubies.forEach(mesh => {
        mesh.position.x = Math.round(mesh.position.x * 10) / 10;
        mesh.position.y = Math.round(mesh.position.y * 10) / 10;
        mesh.position.z = Math.round(mesh.position.z * 10) / 10;
        
        // Clean up quaternions (snap to 90 deg increments)
        const e = new THREE.Euler().setFromQuaternion(mesh.quaternion);
        e.x = Math.round(e.x / (Math.PI/2)) * (Math.PI/2);
        e.y = Math.round(e.y / (Math.PI/2)) * (Math.PI/2);
        e.z = Math.round(e.z / (Math.PI/2)) * (Math.PI/2);
        mesh.quaternion.setFromEuler(e);
      });

      st.isActive = false;
      st.activeCubies = [];
      if (st.onComplete) st.onComplete();
    }
  });

  return (
    <group ref={groupRef}>
      {cubies.map((c) => {
        // Build an array of materials based on initial position.
        // If a face is hidden initially, color it black.
        const mats = [
          c.initialPos.x > 0 ? materials[0] : coreMaterial, // R
          c.initialPos.x < 0 ? materials[1] : coreMaterial, // L
          c.initialPos.y > 0 ? materials[2] : coreMaterial, // U
          c.initialPos.y < 0 ? materials[3] : coreMaterial, // D
          c.initialPos.z > 0 ? materials[4] : coreMaterial, // F
          c.initialPos.z < 0 ? materials[5] : coreMaterial, // B
        ];

        return (
          <mesh 
            key={c.id} 
            position={c.initialPos}
            material={mats}
          >
            <boxGeometry args={[CUBIE_SIZE, CUBIE_SIZE, CUBIE_SIZE]} />
            {/* Subtle inner wireframe for high-tech look */}
            <lineSegments>
              <edgesGeometry args={[new THREE.BoxGeometry(CUBIE_SIZE, CUBIE_SIZE, CUBIE_SIZE)]} />
              <lineBasicMaterial color="#00f0ff" transparent opacity={0.15} />
            </lineSegments>
          </mesh>
        );
      })}
    </group>
  );
});

Cube3D.displayName = 'Cube3D';
