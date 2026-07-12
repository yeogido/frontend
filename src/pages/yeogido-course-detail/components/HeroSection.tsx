import { mockLikeRequest } from '../api/mockLikeRequest';
import { useOptimisticLiked } from '../hooks/useOptimisticLiked';

import { EmptyHeartIcon, FilledHeartIcon } from './icons';

interface HeroSectionProps {
  imageUrl: string;
  title: string;
  initialLiked: boolean;
}

function HeroSection({ imageUrl, title, initialLiked }: HeroSectionProps) {
  const { liked, isPending, toggle } = useOptimisticLiked(
    initialLiked,
    mockLikeRequest,
  );
  const HeartIcon = liked ? FilledHeartIcon : EmptyHeartIcon;

  return (
    <section className="relative h-[clamp(220px,76vw,360px)] overflow-hidden bg-gray-2">
      <img src={imageUrl} alt={title} className="h-full w-full object-cover" />

      <button
        type="button"
        aria-label={`${title} 좋아요 ${liked ? '취소' : '추가'}`}
        aria-pressed={liked}
        aria-busy={isPending}
        onClick={toggle}
        className="absolute top-4 right-5 flex h-11 w-11 items-center justify-center text-white drop-shadow-sm disabled:cursor-wait"
      >
        <HeartIcon className="h-8 w-8 fill-current" />
      </button>
    </section>
  );
}

export default HeroSection;
