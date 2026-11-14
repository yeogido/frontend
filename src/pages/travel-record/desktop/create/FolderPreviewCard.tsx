import type { ReactNode } from 'react';

const CARD_HEIGHT = 590;
const ART_BOX_SIZE = 280;

interface FolderPreviewCardProps {
  /** 폴더 그림. 159×183 아트워크를 그대로 넣는다. */
  art: ReactNode;
  /** 지역명. 없으면 안내 문구를 보여 준다. */
  regionName: string;
  /** 기간 칩이나 안내 문구. */
  caption: ReactNode;
}

/** 오른쪽 단의 "여행 폴더 미리보기" 카드(360×590). */
function FolderPreviewCard({
  art,
  regionName,
  caption,
}: FolderPreviewCardProps) {
  return (
    <section
      aria-label="여행 폴더 미리보기"
      style={{ height: CARD_HEIGHT }}
      className="flex flex-col items-center rounded-[24px] bg-[#f1f1f1] px-[40px] pt-[48px]"
    >
      <h2 className="text-gray-5 text-[18px] leading-[30px] font-medium">
        여행 폴더 미리보기
      </h2>
      <div
        style={{ width: ART_BOX_SIZE, height: ART_BOX_SIZE }}
        className="mt-[36px] flex items-center justify-center"
      >
        {art}
      </div>
      <p
        className={`mt-[40px] text-[18px] leading-[24px] font-medium ${
          regionName ? 'text-black' : 'text-gray-4'
        }`}
      >
        {regionName || '다녀온 지역을 선택해 주세요'}
      </p>
      <div className="mt-[40px] flex h-[31px] items-center">{caption}</div>
    </section>
  );
}

export default FolderPreviewCard;
