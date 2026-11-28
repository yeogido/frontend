import { Link } from 'react-router-dom';

import addIcon from '../../../assets/icons/material-symbols_add-2-rounded.svg';
import locationIcon from '../../../assets/icons/business-location.svg';
import type { BusinessInfoResponse } from '../../../types/business.type';
import { BUSINESS_VERIFICATION_PATH } from '../utils/profileBusinessSection';

interface MyBusinessesCardProps {
  readonly businesses: readonly BusinessInfoResponse[];
}

/**
 * 프로필의 "내 사업장" 카드(데스크톱). 인증한 사업장을 보여 주고 다른 사업장을
 * 인증하러 가는 칩을 둔다. Figma 1440 데스크톱 시안(7193:54658) 기준 리터럴 px.
 */
function MyBusinessesCard({ businesses }: MyBusinessesCardProps) {
  return (
    <section
      aria-label="내 사업장"
      className="flex w-full flex-col gap-[12px] rounded-[18px] bg-[#f1f1f1] p-[20px]"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-[18px] leading-[normal] font-semibold text-[#1c1c1c]">
          내 사업장
        </h2>
        <Link
          to={BUSINESS_VERIFICATION_PATH}
          className="bg-main-5 flex items-center gap-[6px] rounded-[8px] px-[10px] py-[6px] text-[14px] leading-[normal] font-semibold text-[#f9f9f9]"
        >
          <img
            src={addIcon}
            alt=""
            aria-hidden="true"
            className="size-[16px]"
          />
          사업장 추가하기
        </Link>
      </div>

      <ul className="flex flex-col gap-[12px]">
        {businesses.map((business) => (
          <li
            key={business.businessInfoId}
            className="flex items-start gap-[12px] rounded-[12px] bg-[#f9f9f9] px-[12px] pt-[12px] pb-[18px]"
          >
            <img
              src={locationIcon}
              alt=""
              aria-hidden="true"
              className="size-[24px] shrink-0"
            />
            <div className="flex min-w-0 flex-col gap-[6px] pt-[3px] leading-[normal]">
              <p className="truncate text-[16px] font-semibold text-[#1c1c1c]">
                {business.businessName}
              </p>
              <p className="truncate text-[12px] text-[#505050]">
                {business.businessAddress}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default MyBusinessesCard;
