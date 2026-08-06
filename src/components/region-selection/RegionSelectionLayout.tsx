import type { ReactNode } from 'react';

import backIcon from '../../assets/icons/back.svg';
import { FixedMobilePageFrame } from '../layout';

interface RegionSelectionLayoutProps {
  onBack: () => void;
  backAriaLabel: string;
  title: ReactNode;
  description: ReactNode;
  search: ReactNode;
  recentSearches: ReactNode;
  popularRegions: ReactNode;
  action: ReactNode;
}

function RegionSelectionLayout({
  onBack,
  backAriaLabel,
  title,
  description,
  search,
  recentSearches,
  popularRegions,
  action,
}: RegionSelectionLayoutProps) {
  return (
    <FixedMobilePageFrame className="bg-[#f9f9f9] px-6 pt-[60px]">
      <button
        type="button"
        onClick={onBack}
        aria-label={backAriaLabel}
        className="flex size-6 shrink-0 items-center justify-start"
      >
        <img src={backIcon} alt="" aria-hidden="true" className="size-6" />
      </button>

      <section className="mt-4 flex shrink-0 flex-col gap-3">
        <h1 className="text-[32px] leading-none font-semibold text-black">{title}</h1>
        <p className="text-gray-5 text-[14px] leading-none">{description}</p>
      </section>

      <div className="relative z-20 mt-[47px] w-full shrink-0">{search}</div>
      {recentSearches}
      {popularRegions}
      <div className="absolute top-[759px] right-6 left-6">{action}</div>
    </FixedMobilePageFrame>
  );
}

export default RegionSelectionLayout;
