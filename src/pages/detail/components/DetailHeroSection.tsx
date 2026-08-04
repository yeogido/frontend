import React from 'react';

import { useGlobalScale } from '../../../hooks/useGlobalScale';

// Figma 390 디자인 기준 리터럴 px
const HERO_HEIGHT = 296;
const ACTION_OFFSET = 16;

export interface DetailHeroSectionProps {
  readonly imageUrl: string;
  readonly title: string;
  readonly rightAction?: React.ReactNode;
  readonly className?: string;
}

export function DetailHeroSection({
  imageUrl,
  title,
  rightAction,
  className = '',
}: DetailHeroSectionProps) {
  const scale = useGlobalScale();

  return (
    <section
      className={`bg-gray-2 relative w-full overflow-hidden ${className}`}
      style={{ height: HERO_HEIGHT * scale }}
    >
      <img src={imageUrl} alt={title} className="h-full w-full object-cover" />

      {rightAction && (
        <div
          className="absolute z-10 flex items-center justify-center"
          style={{ top: ACTION_OFFSET * scale, right: ACTION_OFFSET * scale }}
        >
          {rightAction}
        </div>
      )}
    </section>
  );
}

export default DetailHeroSection;
