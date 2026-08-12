import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

interface HorizontalFadeScrollProps {
  children: ReactNode;
  ariaLabel?: string;
  className?: string;
  contentClassName?: string;
  contentStyle?: CSSProperties;
  fadeWidth?: number;
  fadeColorClassName?: string;
  fadeMode?: 'mask' | 'overlay';
  role?: 'list';
}

const DEFAULT_FADE_WIDTH = 16;
const SCROLL_END_TOLERANCE = 1;

function HorizontalFadeScroll({
  children,
  ariaLabel,
  className = '',
  contentClassName = '',
  contentStyle,
  fadeWidth = DEFAULT_FADE_WIDTH,
  fadeColorClassName = 'from-background to-transparent',
  fadeMode = 'overlay',
  role,
}: HorizontalFadeScrollProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const container = scrollRef.current;

    if (!container) {
      return;
    }

    const maxScrollLeft = container.scrollWidth - container.clientWidth;

    setCanScrollLeft(container.scrollLeft > SCROLL_END_TOLERANCE);
    setCanScrollRight(maxScrollLeft - container.scrollLeft > SCROLL_END_TOLERANCE);
  }, []);

  useLayoutEffect(() => {
    updateScrollState();

    const container = scrollRef.current;

    if (!container) {
      return;
    }

    const observer = new ResizeObserver(updateScrollState);
    observer.observe(container);

    return () => observer.disconnect();
  }, [children, updateScrollState]);

  const maskImage =
    fadeMode === 'mask'
      ? canScrollLeft && canScrollRight
        ? `linear-gradient(to right, transparent, black ${fadeWidth}px, black calc(100% - ${fadeWidth}px), transparent)`
        : canScrollLeft
          ? `linear-gradient(to right, transparent, black ${fadeWidth}px)`
          : canScrollRight
            ? `linear-gradient(to right, black calc(100% - ${fadeWidth}px), transparent)`
            : undefined
      : undefined;

  return (
    <div className={`relative ${className}`}>
      <div
        ref={scrollRef}
        role={role}
        aria-label={ariaLabel}
        onScroll={updateScrollState}
        className={contentClassName}
        style={{
          ...contentStyle,
          maskImage,
          WebkitMaskImage: maskImage,
        }}
      >
        {children}
      </div>

      {fadeMode === 'overlay' && canScrollLeft ? (
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute inset-y-0 left-0 z-10 bg-gradient-to-r ${fadeColorClassName}`}
          style={{ width: fadeWidth }}
        />
      ) : null}
      {fadeMode === 'overlay' && canScrollRight ? (
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute inset-y-0 right-0 z-10 bg-gradient-to-l ${fadeColorClassName}`}
          style={{ width: fadeWidth }}
        />
      ) : null}
    </div>
  );
}

export default HorizontalFadeScroll;
