import {useState, useEffect, type RefObject, MutableRefObject} from 'react';

interface Widths {
  offsetWidth: number;
  scrollWidth: number;
}

export const useContainerWidth = (
  containerRef: MutableRefObject<HTMLDivElement | null>,
) => {
  const [widths, setWidths] = useState<Widths>({
    offsetWidth: 0,
    scrollWidth: 0,
  });

  useEffect(() => {
    const getWidth = (): Widths => ({
      offsetWidth: containerRef.current ? containerRef.current.offsetWidth : 0,
      scrollWidth: containerRef.current ? containerRef.current.scrollWidth : 0,
    });

    const handleResize = () => {
      setWidths(getWidth());
    };

    if (containerRef.current) {
      setWidths(getWidth());
    }

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [containerRef]);

  return widths;
};
