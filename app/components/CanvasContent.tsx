import {useParams} from '@remix-run/react';
import {extend, useThree} from '@react-three/fiber';
import {geometry} from 'maath';

import {useIsHomePath} from '~/lib/utils';
import {RoundedRectGeometry} from '~/lib/RoundedRectGeometry';

import {Collections} from './CanvasCollections';
import {CanvasRoom} from './CanvasRoom';
import {Camera} from './Camera';
import {CanvasEnvironment} from './CanvasEnvironment';
import {Postprocessing} from './Postprocessing';
import {Suspense, lazy} from 'react';

const CollectionProducts = lazy(() => import('./CanvasCollectionProducts'));

extend({
  RoundedRectGeometry,
  RoundedPlaneGeometry: geometry.RoundedPlaneGeometry,
});

export function CanvasContent() {
  const {size} = useThree();
  const isHome = useIsHomePath();
  const params = useParams();

  return (
    <>
      {isHome && <Collections params={params} width={size.width} />}
      <Suspense fallback={null}>
        <CollectionProducts params={params} width={size.width} />
      </Suspense>
      <CanvasRoom />
      <Camera position={[5, 0, 26]} />
      <CanvasEnvironment width={size.width} />
      {/* <Postprocessing width={size.width} /> */}
      {/* <Stats /> */}
    </>
  );
}
