import { useEffect, useRef } from 'react';

interface UseInfiniteScrollParams {
  enabled: boolean;
  onIntersect: () => void;
}

function useInfiniteScroll({ enabled, onIntersect }: UseInfiniteScrollParams) {
  const targetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const target = targetRef.current;

    if (!enabled || !target) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onIntersect();
        }
      },
      {
        rootMargin: '240px 0px',
        threshold: 0,
      }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [enabled, onIntersect]);

  return targetRef;
}

export default useInfiniteScroll;
