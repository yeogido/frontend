import { MdChevronRight } from 'react-icons/md';

interface HomeSectionHeaderProps {
  readonly title: string;
  /** 있으면 오른쪽에 `전체보기 >` 버튼이 붙는다. */
  readonly onMoreClick?: () => void;
}

/** 홈 데스크톱 섹션 제목 줄 — Figma 1440 시안(6089:34672) 기준 리터럴 px. */
function HomeSectionHeader({ title, onMoreClick }: HomeSectionHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-[24px] font-semibold text-black">{title}</h2>
      {onMoreClick ? (
        <button
          type="button"
          onClick={onMoreClick}
          className="text-gray-5 flex items-center text-[16px] font-medium"
        >
          전체보기
          <MdChevronRight aria-hidden="true" className="text-[20px]" />
        </button>
      ) : null}
    </div>
  );
}

export default HomeSectionHeader;
