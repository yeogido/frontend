import type { BusinessItem } from '../types';
import BusinessListCard from './BusinessListCard';

interface BusinessListProps {
  businesses: BusinessItem[];
  onCardClick: (businessId: string) => void;
  gap?: number;
}

function BusinessList({ businesses, onCardClick, gap = 16 }: BusinessListProps) {
  return (
    <div className="flex flex-col" style={{ gap }}>
      {businesses.map((business) => (
        <BusinessListCard
          key={business.id}
          business={business}
          onClick={() => onCardClick(business.id)}
        />
      ))}
    </div>
  );
}

export default BusinessList;
