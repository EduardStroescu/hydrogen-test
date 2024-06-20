import {useFrame, useThree} from '@react-three/fiber';
import {
  Bloom,
  EffectComposer,
  SMAA,
  Vignette,
} from '@react-three/postprocessing';
import {Suspense, useEffect} from 'react';

export function Postprocessing({width}: {width: number}) {
  const {gl} = useThree();

  useFrame((state) => {
    state.gl.autoClear = false;
    state.gl.clear();
    state.gl.autoClear = true;
  });

  useEffect(() => {
    const canvas = gl.domElement;
    const handleContextLost = (event) => {
      event.preventDefault();
      console.log('WebGL context lost. Attempting to restore...');
      setTimeout(() => gl.forceContextRestore(), 1);
    };
    const handleContextRestored = () => {
      console.log('WebGL context restored.');
      // Re-setup WebGL state and re-create WebGL resources
    };
    canvas.addEventListener('webglcontextlost', handleContextLost, false);
    canvas.addEventListener(
      'webglcontextrestored',
      handleContextRestored,
      false,
    );

    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
    };
  }, [gl]);

  // if (width > 768) {
  return (
    <Suspense fallback={null}>
      <EffectComposer
        enableNormalPass={false}
        stencilBuffer={false}
        autoClear={false}
        multisampling={0}
      >
        {/* <SMAA /> */}
        <Bloom
          mipmapBlur
          luminanceThreshold={1}
          intensity={0.01}
          luminanceSmoothing={0.025}
          height={300}
        />
        {/* <Vignette offset={0.35} darkness={0.7} /> */}
      </EffectComposer>
    </Suspense>
  );
  //   } else {
  //     return (
  //       <Suspense fallback={null}>
  //         <EffectComposer
  //           multisampling={0}
  //           enableNormalPass={false}
  //           stencilBuffer={false}
  //           autoClear={false}
  //         >
  //           <Bloom
  //             mipmapBlur
  //             luminanceThreshold={1}
  //             intensity={0.01}
  //             luminanceSmoothing={0.025}
  //             height={300}
  //           />
  //           <Vignette offset={0.35} darkness={0.7} />
  //         </EffectComposer>
  //       </Suspense>
  //     );
  //   }
}
