import { PromotionCard } from '../../../components/common';

import type { BusinessItem } from '../types';

interface BusinessListCardProps {
  business: BusinessItem;
  onClick: () => void;
}

function BusinessListCard({ business, onClick }: BusinessListCardProps) {
  return (
    <PromotionCard
      avatarUrl={business.image}
      profileName={business.author}
      date={business.date}
      imageUrl={business.image}
      title={business.title}
      description={business.description}
      location={business.location}
      onClick={onClick}
    />
  );
}

export default BusinessListCard;
