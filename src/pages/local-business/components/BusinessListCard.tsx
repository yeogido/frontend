import location from '../../../assets/icons/location.svg';

import BusinessCardHeader from './BusinessCardHeader';
import type { BusinessItem } from '../types';

interface BusinessListCardProps {
  business: BusinessItem;
  onClick: () => void;
}

function BusinessListCard({ business, onClick }: BusinessListCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full cursor-pointer flex-col overflow-hidden rounded-xl bg-pure-white text-left shadow-[0_1px_5px_rgba(0,0,0,0.07)]"
    >
      <BusinessCardHeader business={business} />

      <img
        src={business.image}
        alt={business.title}
        className="h-[266px] w-full object-cover"
      />

      <div className="px-3 pt-3 pb-3">
        <h2 className="text-[15px] font-semibold leading-[1.25] text-[#1C1C1C]">
          {business.title}
        </h2>

        <p className="mt-1.5 line-clamp-2 text-[13px] leading-[1.45] font-normal text-[#7F7F7F]">
          {business.description}
        </p>

        <div className="mt-3">
          <div className="flex items-center gap-1.5">
            <img
              src={location}
              alt=""
              aria-hidden="true"
              className="h-3.5 w-3.5 shrink-0"
            />

            <span className="text-[13px] font-medium leading-none text-[#7F7F7F]">
              {business.location}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

export default BusinessListCard;
