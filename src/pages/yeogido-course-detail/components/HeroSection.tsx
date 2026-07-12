import { EmptyHeartIcon } from './icons';

interface HeroSectionProps {
  imageUrl: string;
  title: string;
}

function HeroSection({ imageUrl, title }: HeroSectionProps) {
  return (
    <section className="relative h-[clamp(220px,76vw,360px)] overflow-hidden bg-gray-2">
      <img src={imageUrl} alt={title} className="h-full w-full object-cover" />

      <button
        type="button"
        aria-label={`${title} 좋아요`}
        className="absolute top-4 right-5 flex h-11 w-11 items-center justify-center text-white drop-shadow-sm"
      >
        <EmptyHeartIcon className="h-8 w-8 fill-current" />
      </button>
    </section>
  );
}

export default HeroSection;
