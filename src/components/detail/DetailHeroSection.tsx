import React from 'react';

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
  return (
    <section className={`relative h-[230px] w-full overflow-hidden bg-gray-2 ${className}`}>
      <img src={imageUrl} alt={title} className="h-full w-full object-cover" />

      {rightAction && (
        <div className="absolute top-4 right-4 z-10 flex items-center justify-center">
          {rightAction}
        </div>
      )}
    </section>
  );
}

export default DetailHeroSection;
