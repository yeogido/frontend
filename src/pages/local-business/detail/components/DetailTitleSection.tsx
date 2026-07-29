import upload from '../../../../assets/icons/upload.svg';
import { TagChip } from '../../../../components/common';
import type { TagType } from '../../../../components/common/TagChip';
import { useGlobalScale } from '../../../../hooks/useGlobalScale';

const TITLE_SIZE = 18;
const SHARE_ICON_SIZE = 24;
const TAG_MARGIN_TOP = 12;
const TAG_GAP = 8;
const TAG_HEIGHT = 25;

interface DetailTitleSectionProps {
  title: string;
  tags: TagType[];
  onShare?: () => void;
}

function DetailTitleSection({ title, tags, onShare }: DetailTitleSectionProps) {
  const scale = useGlobalScale();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1
          className="font-semibold text-black"
          style={{ fontSize: TITLE_SIZE * scale }}
        >
          {title}
        </h1>

        <button
          type="button"
          onClick={onShare}
          aria-label="공유하기"
        >
          <img
            src={upload}
            alt=""
            aria-hidden="true"
            style={{
              width: SHARE_ICON_SIZE * scale,
              height: SHARE_ICON_SIZE * scale,
            }}
          />
        </button>
      </div>

      <div
        className="flex flex-nowrap items-center overflow-x-auto"
        style={{
          marginTop: TAG_MARGIN_TOP * scale,
          gap: TAG_GAP * scale,
        }}
      >
        {tags.map((tag) => (
          <TagChip
            key={tag}
            type={tag}
            style={{ height: TAG_HEIGHT * scale }}
          />
        ))}
      </div>
    </div>
  );
}

export default DetailTitleSection;
