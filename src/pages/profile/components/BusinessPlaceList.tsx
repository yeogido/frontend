import { useNavigate } from 'react-router-dom';

import addIcon from '../../../assets/icons/profile-add.svg';
import locationIcon from '../../../assets/icons/business-location.svg';
import type { BusinessInfoResponse } from '../../../types/business.type';

export function BusinessPlaceList({
  businesses,
  scale,
}: {
  businesses: readonly BusinessInfoResponse[];
  scale: number;
}) {
  const navigate = useNavigate();

  return (
    <section className="w-full">
      <h2
        className="font-semibold text-[#1c1c1c]"
        style={{ fontSize: 16 * scale, lineHeight: `${19 * scale}px` }}
      >
        내 사업장
      </h2>
      <div
        className="overflow-hidden rounded-xl bg-[#f9f9f9]"
        style={{ marginTop: 12 * scale }}
      >
        {businesses.map((business) => (
          <div
            key={business.businessInfoId}
            className="flex items-center"
            style={{ gap: 12 * scale, padding: `${12 * scale}px` }}
          >
            <img
              src={locationIcon}
              alt=""
              aria-hidden="true"
              className="shrink-0"
              style={{ width: 24 * scale, height: 24 * scale }}
            />
            <div className="min-w-0" style={{ marginTop: 3 * scale }}>
              <p
                className="truncate font-semibold text-[#1c1c1c]"
                style={{ fontSize: 16 * scale, lineHeight: `${19 * scale}px` }}
              >
                {business.businessName}
              </p>
              <p
                className="truncate text-[#505050]"
                style={{
                  marginTop: 4 * scale,
                  fontSize: 12 * scale,
                  lineHeight: `${14 * scale}px`,
                }}
              >
                {business.businessAddress}
              </p>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => navigate('/business-verification')}
          className="flex w-full items-center justify-center text-[#a1a1a1]"
          style={{ height: 72 * scale, gap: 8 * scale }}
        >
          <span
            className="font-semibold"
            style={{ fontSize: 14 * scale, lineHeight: `${20 * scale}px` }}
          >
            사업장 추가인증하기
          </span>
          <img
            src={addIcon}
            alt=""
            aria-hidden="true"
            style={{ width: 16 * scale, height: 16 * scale }}
          />
        </button>
      </div>
    </section>
  );
}
