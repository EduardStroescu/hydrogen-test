import type {HomepageFeaturedProductsQuery} from 'storefrontapi.generated';
import {Section} from '~/components/Text';
import {ProductCard} from '~/components/ProductCard';
import {CarouselHandles} from './CarouselHandles';
import {useRef, useState} from 'react';
import {useContainerWidth} from '~/hooks/useContainerWidth';

type ProductSwimlaneProps = HomepageFeaturedProductsQuery & {
  title?: string;
  count?: number;
  className: string;
  buttonLeftStyle: string;
  buttonRightStyle: string;
};

//TODO: CHANGE PRODUCTS TYPE
export function ProductSwimlane({
  title = 'Featured Products',
  products,
  count = 12,
  className = '',
  buttonLeftStyle,
  buttonRightStyle,
  ...props
}: ProductSwimlaneProps) {
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const {offsetWidth, scrollWidth} = useContainerWidth(carouselRef);
  const [xPos, setXPos] = useState<number>(0);
  const translateX = (direction: 'left' | 'right') => {
    direction === 'left'
      ? setXPos((x) => (x === 0 ? 0 : x - offsetWidth / 2))
      : setXPos((x) =>
          x >= scrollWidth - offsetWidth ? 0 : x + offsetWidth / 2,
        );
  };

  return (
    <Section
      heading={title}
      padding="y"
      {...props}
      className="w-full pointer-events-auto backdrop-blur-lg bg-black/40 rounded"
    >
      <div className="relative flex flex-row items-center justify-center w-full hiddenScroll md:pb-8 md:scroll-px-8 lg:scroll-px-12">
        <CarouselHandles
          translateX={translateX}
          buttonLeftStyle={buttonLeftStyle}
          buttonRightStyle={buttonRightStyle}
          className={className}
          width={'w-full'}
        />
        <div
          ref={carouselRef}
          className="w-[calc(100vw-8rem)] lg:w-[calc(100vw-11.5rem)] overflow-hidden"
        >
          <div
            style={{
              transform: `translateX(-${xPos}px)`,
              transition: '0.5s ease-in-out',
            }}
            className="w-full flex flex-row justify-start items-start flex-nowrap gap-2 flex-none"
          >
            {products.nodes.map((product) => (
              <ProductCard
                product={product}
                key={product.id}
                className="snap-start rounded w-28 lg:w-60 overflow-hidden flex-[1_1_1]"
              />
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
