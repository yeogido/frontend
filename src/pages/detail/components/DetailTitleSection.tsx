import React from 'react';
import TagChip from '../../../components/common/TagChip';
import type { DetailTag } from '../../../types/detail';
import { useGlobalScale } from '../../../hooks/useGlobalScale';

// Figma 390 디자인 기준 리터럴 px
const HEADER_GAP = 12;
const TITLE_FONT_SIZE = 18;
// Figma 텍스트 레이어 실측 높이(자동 행간) — 18px 폰트의 "행간 100%"가
// 그대로 18px을 뜻하지 않고, Pretendard SemiBold 기준 24px로 계산된다.
const TITLE_LINE_HEIGHT = 24;
// 제목 줄 높이(24) 한가운데에 공유 버튼 아이콘(16)이 오도록 맞춘 값.
// 버튼 자체가 터치 영역 보정을 위해 이미 음수 마진을 쓰고 있어서(위쪽만
// -6), 패딩으로는(음수 불가) 더 끌어올릴 수 없어 이 오프셋도 음수 마진으로
// 준다. 제목 폰트 크기·행간이 바뀌면 이 값도 같이 다시 맞춰야 한다.
const ACTION_MARGIN_TOP = -4;
const TAGS_MARGIN_TOP = 12;
const TAGS_GAP = 9;
const TAG_HEIGHT = 24;
const TAG_LABEL_FONT_SIZE = 12;

export interface DetailTitleSectionProps {
  readonly title: string;
  readonly tags: readonly DetailTag[];
  readonly action?: React.ReactNode;
  readonly className?: string;
}

export function DetailTitleSection({
  title,
  tags,
  action,
  className = '',
}: DetailTitleSectionProps) {
  const scale = useGlobalScale();

  return (
    <section className={`bg-white ${className}`}>
      <div
        className="flex items-start justify-between"
        style={{ gap: HEADER_GAP * scale }}
      >
        <h1
          className="min-w-0 font-semibold break-keep text-[#1C1C1C]"
          style={{
            fontSize: TITLE_FONT_SIZE * scale,
            lineHeight: `${TITLE_LINE_HEIGHT * scale}px`,
          }}
        >
          {title}
        </h1>
        {action && (
          <div
            className="shrink-0"
            style={{ marginTop: ACTION_MARGIN_TOP * scale }}
          >
            {action}
          </div>
        )}
      </div>

      <div
        className="flex flex-wrap items-center"
        style={{ marginTop: TAGS_MARGIN_TOP * scale, gap: TAGS_GAP * scale }}
      >
        {tags.map((tag) =>
          tag.tagId ? (
            <TagChip
              key={tag.id}
              type={tag.tagId}
              className="w-auto"
              style={{ height: TAG_HEIGHT * scale }}
            />
          ) : (
            <span
              key={tag.id}
              className="bg-gray-1 text-gray-5 inline-flex items-center rounded-full px-2 font-medium"
              style={{
                height: TAG_HEIGHT * scale,
                fontSize: TAG_LABEL_FONT_SIZE * scale,
              }}
            >
              {tag.label}
            </span>
          )
        )}
      </div>
    </section>
  );
}

export default DetailTitleSection;
