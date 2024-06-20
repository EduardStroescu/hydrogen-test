import {Image} from '@shopify/hydrogen';
import {useEffect, useRef, useState} from 'react';

import {useContainerWidth} from '~/hooks/useContainerWidth';
import {CarouselHandles} from './CarouselHandles';

//TODO: CHANGE PRODUCT TYPE
const pickVariant = (product: any) => {
  if (product?.selectedVariant) return product?.selectedVariant;
  else return product?.media.nodes[0];
};

/**
 * A client component that defines a media gallery for hosting images, 3D models, and videos of products
 */
export function ProductGallery({
  product,
  className,
  buttonLeftStyle,
  buttonRightStyle,
}: {
  product: any;
  className?: string;
  buttonLeftStyle?: string;
  buttonRightStyle?: string;
}) {
  const selectedVariant = pickVariant(product);
  const [currentImage, setCurrentImage] = useState(selectedVariant);
  const carouselRef = useRef<HTMLDivElement>();
  const {offsetWidth, scrollWidth} = useContainerWidth(carouselRef);
  const [xPos, setXPos] = useState(0);
  const translateX = (direction: string) => {
    direction === 'left'
      ? setXPos((x) => (x === 0 ? 0 : x - offsetWidth / 2))
      : setXPos((x) =>
          x >= scrollWidth - offsetWidth ? 0 : x + offsetWidth / 2,
        );
  };
  useEffect(() => {
    setCurrentImage(selectedVariant);
  }, [selectedVariant]);

  if (!product.media.nodes.length) {
    return null;
  }

  return (
    <div
      className={`w-full flex flex-col gap-4 md:gap-2 lg:gap-0 hiddenScroll pb-6 ml-0 overflow-hidden ${className}`}
    >
      <div className="flex justify-center md:justify-start pb-6">
        <Image
          src={currentImage.image.url}
          alt={`${currentImage?.alt} || 'Product Image'`}
          loading="eager"
          aspectRatio={'5/5'}
          width="100"
          sizes={'(min-width: 48em) 60vw, 90vw'}
          className="object-cover h-full aspect-square fadeIn snap-center card-image bg-white dark:bg-contrast/10 w-full sm:w-[90%] lg:w-[30rem] xl:w-[30rem] 2xl:min-w-[55%]"
        />
      </div>
      <div className="w-full flex flex-row justify-center md:justify-start xl:pl-6 overflow-hidden">
        <div
          ref={carouselRef}
          className="relative w-full sm:w-[90%] lg:w-[30rem] xl:w-[26.5rem] 2xl:min-w-[50%] flex flex-row items-center justify-start gap-1 sm:gap-2 hiddenScroll rounded overflow-hidden"
        >
          <CarouselHandles
            translateX={translateX}
            buttonLeftStyle={buttonLeftStyle}
            buttonRightStyle={buttonRightStyle}
          />
          {product?.media?.nodes.map((media, index) => {
            const image =
              media.__typename === 'MediaImage'
                ? {...media.image, altText: media.alt || 'Product image'}
                : null;

            const style = [
              index === 0 ? 'ml-6' : '',
              'w-[4rem] sm:w-[6rem] xl:w-[7rem] 2xl:w-[9rem] flex flex-row justify-start flex-nowrap rounded flex-none overflow-hidden',
            ].join(' ');

            return (
              <div
                onMouseEnter={() => setCurrentImage(media)}
                className={style}
                style={{
                  transform: `translateX(-${xPos}%)`,
                  transition: '0.5s ease-in-out',
                }}
                key={media.id || image?.id}
              >
                {image && (
                  <Image
                    loading={index === 0 ? 'eager' : 'lazy'}
                    data={image}
                    width="100"
                    aspectRatio={'1 / 1'}
                    sizes={'(min-width: 48em) 30vw, 90vw'}
                    className="object-cover w-full h-full rounded aspect-[1/1] fadeIn"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
