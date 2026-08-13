import type { BusinessItem } from '../types';
import BusinessGridCard from './BusinessGridCard';

interface BusinessGridProps {
  businesses: BusinessItem[];
  onCardClick: (businessId: string) => void;
  onLikeClick?: (businessId: string) => void;
  onEditClick?: (businessId: string) => void;
  onDeleteClick?: (businessId: string) => void;
  gapX?: number;
  gapY?: number;
}

function BusinessGrid({
  businesses,
  onCardClick,
  onLikeClick,
  onEditClick,
  onDeleteClick,
  gapX = 16,
  gapY = 18,
}: BusinessGridProps) {
  return (
    <div
      className="grid grid-cols-2"
      style={{ columnGap: gapX, rowGap: gapY }}
    >
      {businesses.map((business) => (
        <BusinessGridCard
          key={business.id}
          business={business}
          onClick={() => onCardClick(business.id)}
          onLikeClick={
            onLikeClick ? () => onLikeClick(business.id) : undefined
          }
          onEditClick={
            onEditClick ? () => onEditClick(business.id) : undefined
          }
          onDeleteClick={
            onDeleteClick ? () => onDeleteClick(business.id) : undefined
          }
        />
      ))}
    </div>
  );
}

export default BusinessGrid;
