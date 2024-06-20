import {
  createContext,
  useRef,
  useContext,
  useEffect,
  type ReactNode,
} from 'react';
import {addEffect} from '@react-three/fiber';
import Lenis from '@studio-freight/lenis';

interface ScrollContextValue {
  progress: number;
}

interface ScrollContextProps {
  children: ReactNode;
}

const scrollContext = createContext<ScrollContextValue | undefined>(undefined);
export const useScrollContext = () => {
  const context = useContext(scrollContext);
  if (context === undefined) {
    throw new Error('useScrollContext must be used within a ScrollProvider');
  }
  return context;
};

const scroll: ScrollContextValue = {
  progress: 0,
};

export function ScrollProvider({children}: ScrollContextProps) {
  const content = useRef<HTMLDivElement | null>(null);
  const wrapper = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (content.current && wrapper.current) {
      const lenis = new Lenis({
        wrapper: wrapper.current,
        content: content.current,
        lerp: 0.1,
        direction: 'vertical', // vertical, horizontal
        gestureDirection: 'vertical', // vertical, horizontal, both
        smooth: true,
        smoothTouch: true,
        touchMultiplier: 1,
        infinite: true,
      });

      lenis.on('scroll', ({progress}: {progress: number}) => {
        scroll.progress = progress;
      });
      const effectSub = addEffect((time) => lenis.raf(time));
      return () => {
        effectSub();
        lenis.destroy();
      };
    }
  }, []);

  return (
    <div
      ref={wrapper}
      style={{
        position: 'absolute',
        zIndex: 100,
        overflow: 'hidden',
        width: '100%',
        height: '100%',
        top: 0,
      }}
    >
      <div
        ref={content}
        style={{
          position: 'relative',
          minHeight: '400vh',
          overflowX: 'hidden',
        }}
      >
        <div className="w-full h-full fixed top-0 left-0">
          <scrollContext.Provider value={scroll}>
            {children}
          </scrollContext.Provider>
        </div>
      </div>
    </div>
  );
}
