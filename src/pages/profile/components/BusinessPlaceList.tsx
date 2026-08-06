import addIcon from '../../../assets/icons/material-symbols_add-2-rounded.svg';
import { useNavigate } from 'react-router-dom';
import type { BusinessProfile } from '../../business-verification/types';

export function BusinessPlaceList({
  profile,
  scale,
}: {
  profile: BusinessProfile;
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
        className="mt-3 overflow-hidden rounded-xl bg-[#f9f9f9]"
        style={{ marginTop: 12 * scale }}
      >
        <div
          className="flex items-center"
          style={{ gap: 12 * scale, padding: `${8 * scale}px` }}
        >
          <span
            className="flex shrink-0 items-center justify-center rounded-xl bg-[#f1f1f1]"
            style={{ width: 56 * scale, height: 56 * scale }}
          />
          <div className="min-w-0">
            <p
              className="truncate font-semibold text-[#1c1c1c]"
              style={{ fontSize: 16 * scale, lineHeight: `${19 * scale}px` }}
            >
              {profile.businessName}
            </p>
            <p
              className="mt-1 truncate text-[#505050]"
              style={{ fontSize: 12 * scale, lineHeight: `${14 * scale}px` }}
            >
              {profile.businessAddress}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/business-verification')}
          className="flex w-full items-center justify-center text-[#a1a1a1]"
          style={{ height: 72 * scale, gap: 8 * scale }}
        >
          <span
            className="font-semibold"
            style={{ fontSize: 14 * scale, lineHeight: `${17 * scale}px` }}
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
