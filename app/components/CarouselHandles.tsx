import {IconArrowLeft, IconArrowRight} from './Icon';

export function CarouselHandles({
  translateX,
  className,
  buttonLeftStyle = '',
  buttonRightStyle = '',
  width,
}: {
  width?: string;
  translateX: (direction: 'left' | 'right') => void;
  buttonLeftStyle?: string;
  buttonRightStyle?: string;
  className?: string;
}) {
  return (
    <div
      className={`${className} transparent w-full h-full absolute z-50 flex justify-between rounded pointer-events-none`}
    >
      <button
        onClick={() => translateX('left')}
        className={`group pointer-events-auto ${buttonLeftStyle}`}
      >
        <IconArrowLeft width={width} />
      </button>
      <button
        onClick={() => translateX('right')}
        className={`group pointer-events-auto ${buttonRightStyle}`}
      >
        <IconArrowRight width={width} />
      </button>
    </div>
  );
}
