import { PromotionCard } from '../../../components/common';

import type { BusinessItem } from '../types';

interface BusinessListCardProps {
  business: BusinessItem;
  onClick: () => void;
  onLikeClick?: () => void;
}

function BusinessListCard({
  business,
  onClick,
  onLikeClick,
}: BusinessListCardProps) {
  return (
    <PromotionCard
      avatarUrl={business.authorAvatarUrl}
      profileName={business.author}
      date={business.date}
      imageUrl={business.image}
      title={business.title}
      description={business.description}
      location={business.location}
      tags={business.tags}
      liked={business.liked}
      onClick={onClick}
      onLikeClick={onLikeClick}
    />
  );
}

export default BusinessListCard;
