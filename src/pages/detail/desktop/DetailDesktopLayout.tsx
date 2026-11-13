import { useState, type ReactNode } from 'react';
import type { IconType } from 'react-icons';
import { MdLocationOn } from 'react-icons/md';

import heart from '../../../assets/icons/heart.svg';
import oheart from '../../../assets/icons/oheart.svg';
import TagChip from '../../../components/common/TagChip';
import DesktopPageShell from '../../../components/layout/desktop/DesktopPageShell';
import type { DetailTag } from '../../../types/detail';

// Figma 1440 데스크톱 시안(6242:29073, 6336:76602) 기준 리터럴 px.
const HERO_HEIGHT = 426;
const TAG_HEIGHT = 28;
const LIKE_SIZE = 24;

export interface DetailInfoRow {
  readonly icon: IconType;
  readonly text: string;
  /** 있으면 밑줄 친 외부/전화 링크가 된다. */
  readonly href?: string;
}

export interface DetailPlaceSummary {
  readonly name: string;
  readonly address: string;
  readonly hours: string;
  readonly liked: boolean;
  readonly onLikeClick: () => void;
  readonly onClick?: () => void;
}

interface DetailDesktopLayoutProps {
  readonly heroImageUrls: readonly string[];
  readonly title: string;
  readonly overview: string;
  readonly tags: readonly DetailTag[];
  /** 태그 줄 오른쪽 — 좋아요/관리 메뉴와 공유 버튼. */
  readonly titleActions: ReactNode;
  readonly infoRows: readonly DetailInfoRow[];
  readonly map: ReactNode;
  readonly place: DetailPlaceSummary;
  /** 장소 카드 아래에 이어 붙는 구역(이 행사가 포함된 코스 등). */
  readonly children?: ReactNode;
}

function InfoRow({ icon: Icon, text, href }: DetailInfoRow) {
  const content = href ? (
    <a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel="noopener noreferrer"
      className="underline"
    >
      {text}
    </a>
  ) : (
    <span>{text}</span>
  );

  return (
    <li className="text-gray-5 flex items-center gap-[12px] text-[16px]">
      <Icon aria-hidden="true" className="text-gray-4 shrink-0 text-[20px]" />
      {content}
    </li>
  );
}

/**
 * 행사·소상공인 상세의 데스크톱 공통 뼈대 — 히어로, 제목, 소개, 태그와
 * 동작, 정보 카드, 지도, 장소 요약 순으로 쌓는다.
 */
function DetailDesktopLayout({
  heroImageUrls,
  title,
  overview,
  tags,
  titleActions,
  infoRows,
  map,
  place,
  children,
}: DetailDesktopLayoutProps) {
  const [heroIndex, setHeroIndex] = useState(0);
  const heroImageUrl = heroImageUrls[heroIndex] ?? heroImageUrls[0];

  return (
    <DesktopPageShell>
      <div className="flex flex-col gap-[24px]">
        <div
          style={{ height: HERO_HEIGHT }}
          className="bg-gray-2 relative overflow-hidden rounded-[24px]"
        >
          {heroImageUrl ? (
            <img
              src={heroImageUrl}
              alt=""
              draggable={false}
              className="h-full w-full object-cover"
            />
          ) : null}

          {heroImageUrls.length > 1 ? (
            <div className="absolute bottom-[16px] left-1/2 flex -translate-x-1/2 gap-[8px]">
              {heroImageUrls.map((url, index) => (
                <button
                  key={url}
                  type="button"
                  aria-label={`${index + 1}번째 사진 보기`}
                  aria-current={index === heroIndex}
                  onClick={() => setHeroIndex(index)}
                  className={`h-[8px] w-[8px] rounded-full ${
                    index === heroIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-[16px]">
          <h1 className="text-[48px] leading-[1.2] font-semibold break-keep text-black">
            {title}
          </h1>
          {overview ? (
            <p className="text-gray-5 text-[18px] leading-[1.6] break-words whitespace-pre-line">
              {overview}
            </p>
          ) : null}
        </div>

        <div className="border-gray-2 flex items-center justify-between border-b pb-[24px]">
          <ul className="flex flex-wrap items-center gap-[8px]">
            {tags.map((tag) => (
              <li key={tag.id}>
                {tag.tagId ? (
                  <TagChip
                    type={tag.tagId}
                    className="w-auto"
                    style={{ height: TAG_HEIGHT }}
                  />
                ) : (
                  <span className="border-gray-2 text-gray-5 rounded-full border px-[10px] py-[4px] text-[14px]">
                    {tag.label}
                  </span>
                )}
              </li>
            ))}
          </ul>
          <div className="flex shrink-0 items-center gap-[12px]">
            {titleActions}
          </div>
        </div>

        {infoRows.length > 0 ? (
          <ul className="border-gray-2 flex flex-col gap-[12px] rounded-[12px] border px-[20px] py-[16px]">
            {infoRows.map((row) => (
              <InfoRow key={row.text} {...row} />
            ))}
          </ul>
        ) : null}

        <div>{map}</div>

        <div className="flex items-start justify-between">
          <button
            type="button"
            onClick={place.onClick}
            disabled={!place.onClick}
            className="flex min-w-0 items-start gap-[12px] text-left"
          >
            <MdLocationOn
              aria-hidden="true"
              className="text-main-5 mt-[2px] shrink-0 text-[24px]"
            />
            <span className="flex min-w-0 flex-col gap-[4px]">
              <span className="text-[16px] font-semibold text-black">
                {place.name}
              </span>
              <span className="text-gray-4 text-[14px]">{place.address}</span>
              <span className="text-gray-3 text-[14px]">{place.hours}</span>
            </span>
          </button>
          <button
            type="button"
            aria-label={
              place.liked ? `${place.name} 좋아요 취소` : `${place.name} 좋아요`
            }
            aria-pressed={place.liked}
            onClick={place.onLikeClick}
            className="shrink-0"
          >
            <img
              src={place.liked ? oheart : heart}
              alt=""
              draggable={false}
              style={{ width: LIKE_SIZE, height: LIKE_SIZE }}
            />
          </button>
        </div>

        {children}
      </div>
    </DesktopPageShell>
  );
}

export default DetailDesktopLayout;
