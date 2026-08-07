import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';

import { useGlobalScale } from '../../hooks/useGlobalScale';

interface FixedMobilePageFrameProps {
  children: ReactNode;
  className?: string;
  scrollable?: boolean;
}

const DESIGN_HEIGHT = 844;

function FixedMobilePageFrame({
  children,
  className = '',
  scrollable = false,
}: FixedMobilePageFrameProps) {
  const scale = useGlobalScale();
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(DESIGN_HEIGHT);

  useLayoutEffect(() => {
    if (!scrollable || !contentRef.current) return;

    const content = contentRef.current;
    const updateHeight = () =>
      setContentHeight(Math.max(DESIGN_HEIGHT, content.offsetHeight));

    updateHeight();
    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(content);

    return () => resizeObserver.disconnect();
  }, [scrollable]);

  return (
    <main className="relative mx-auto w-full overflow-hidden" style={{ height: contentHeight * scale }}>
      <div
        ref={contentRef}
        className={`relative w-[390px] origin-top-left ${scrollable ? 'min-h-[844px]' : 'h-[844px]'} ${className}`}
        style={{ transform: `scale(${scale})` }}
      >
        {children}
      </div>
    </main>
  );
}

export type { FixedMobilePageFrameProps };
export default FixedMobilePageFrame;
