import {useRef, useEffect, LegacyRef, Ref} from 'react';
import {useLocation} from '@remix-run/react';
import {type GroupProps, useFrame, useThree} from '@react-three/fiber';
import {easing} from 'maath';
import {PerspectiveCamera as PerspectiveCameraImpl} from '@react-three/drei';
import {Group, Object3DEventMap, PerspectiveCamera} from 'three';

export function Camera(props: GroupProps) {
  const location = useLocation();
  const {size} = useThree();
  const groupRef = useRef<Ref<Group<Object3DEventMap>>>();
  const cameraRef = useRef<LegacyRef<PerspectiveCamera>>();

  const set = useThree((state) => state.set);
  useEffect(() => void set({camera: cameraRef.current}));
  useFrame(() => cameraRef.current?.updateMatrixWorld());

  useFrame((state, delta) => {
    if (location.pathname.startsWith('/')) {
      easing.damp3(
        state.camera.position,
        [
          6 + state.pointer.x,
          5 + -state.pointer.y / 6,
          (size.width / size.height) * 500 <= 500 ? 6 : 4,
        ],
        0.5,
        delta,
        25,
      );
      easing.dampE(
        state.camera.rotation,
        [state.pointer.y * 0.02, state.pointer.x * 0.08, 0],
        0.5,
        delta,
      );
    }
    // else if (location.pathname === '/about') {
    //   if (startTime === undefined) startTime = state.clock.elapsedTime;

    //   if (state.clock.elapsedTime >= startTime + 0.6) {
    //     easing.damp3(
    //       state.camera.position,
    //       [6 + state.pointer.x / 2.5, -5 + -state.pointer.y / 6, 2],
    //       0.5,
    //       delta,
    //       10,
    //     );
    //   } else
    //     easing.damp3(
    //       state.camera.position,
    //       [6, 0, location.state.data === '/contact' ? 10 : 2],
    //       0.5,
    //       delta,
    //       location.state.data === '/contact' ? 40 : 10,
    //     );
    //   easing.dampE(
    //     state.camera.rotation,
    //     [state.pointer.y * 0.02, state.pointer.x * 0.03, 0],
    //     0.35,
    //     delta,
    //   );
    // } else if (location.pathname === '/contact') {
    //   easing.damp3(
    //     state.camera.position,
    //     [-21 + -state.pointer.x, 6 + state.pointer.y / 6, 30],
    //     0.5,
    //     delta,
    //     30,
    //   );
    //   easing.dampE(
    //     state.camera.rotation,
    //     [state.pointer.y * 0.02, -Math.PI / 4 + -state.pointer.x * 0.03, 0],
    //     0.5,
    //     delta,
    //     100,
    //   );
    //   // state.camera.lookAt(30, 6, 15);
    // }
  });

  return (
    <group ref={groupRef} {...props} dispose={null}>
      <group name="Scene">
        <PerspectiveCameraImpl
          ref={cameraRef as LegacyRef<PerspectiveCamera>}
          name="Camera"
          far={130}
          near={0.01}
          fov={(size.width / size.height) * 500 <= 500 ? 95 : 75}
          makeDefault
        />
      </group>
    </group>
  );
}
