import { useState } from 'react';
import { motion } from 'motion/react';

import { TravelFolderArtwork } from '../../components';

interface EmptyFolderPreviewProps {
  /** 폴더 아래에 붙일 지역명. 사용자가 검색창에 입력하는 대로 따라온다. */
  regionName: string;
}

/**
 * 인기 지역 그리드가 쓰던 세로 공간(제목 16 + gap 12 + 카드 2줄 127·15·127).
 * 그 자리를 그대로 이어받는다.
 */
const PREVIEW_AREA_HEIGHT = 297;
const FOLDER_ARTWORK_WIDTH = 159;
const FOLDER_ARTWORK_HEIGHT = 183;

// 폴더 아트워크는 159×183 고정이라, 공간을 다 채우도록 세로에 맞춰 확대한다.
// 가로는 159 * 1.62 ≒ 258px로 본문 폭(342px) 안에 들어온다.
const folderScale = PREVIEW_AREA_HEIGHT / FOLDER_ARTWORK_HEIGHT;

const previewLabel = '여행 폴더 미리보기';
const STAGGER_SECONDS = 0.035;

function EmptyFolderPreview({ regionName }: EmptyFolderPreviewProps) {
  const characters = Array.from(regionName);
  // 이번 렌더에서 새로 붙은 글자만 순서대로 늦춰 등장시킨다. 한 글자씩
  // 타이핑할 때는 늘 마지막 글자 하나만 새로 붙어 지연 없이 바로 나타나고,
  // 최근 검색 칩처럼 이름이 통째로 채워질 때만 스태거가 눈에 보인다.
  const [renderedName, setRenderedName] = useState(regionName);
  const [appendStartIndex, setAppendStartIndex] = useState(0);

  if (renderedName !== regionName) {
    setRenderedName(regionName);
    setAppendStartIndex(Array.from(renderedName).length);
  }

  return (
    <section
      aria-label={regionName ? `${regionName} ${previewLabel}` : previewLabel}
      className="-mt-2 flex w-full shrink-0 flex-col items-center"
    >
      {/* 확대해도 레이아웃 상자는 159×183 그대로라, 실제로 보이는 크기만큼
          자리를 잡아 줘야 아래 지역명이 폴더와 겹치지 않는다. */}
      <div
        className="flex items-center justify-center"
        style={{
          height: PREVIEW_AREA_HEIGHT,
          width: FOLDER_ARTWORK_WIDTH * folderScale,
        }}
      >
        {/* 사진과 스티커는 다음 화면들에서 채우므로 빈 폴더만 보여 준다. */}
        <div style={{ transform: `scale(${folderScale})` }}>
          <TravelFolderArtwork
            photos={[]}
            title={regionName}
            decorations={[]}
          />
        </div>
      </div>

      {regionName ? (
        <h2 className="mt-3 w-full truncate text-center text-[16px] leading-none font-medium text-black">
          {/* 글자를 하나씩 쪼개 두면 보조 기술이 낱자로 읽을 수 있어,
              읽히는 것은 온전한 이름 하나로 따로 둔다. */}
          <span className="sr-only">{regionName}</span>
          <span aria-hidden="true">
            {characters.map((character, index) => (
              <motion.span
                // 이미 자리를 잡은 글자는 그대로 두고 뒤에 붙는 글자만 새로
                // 등장하도록 위치를 키로 쓴다. 한글 조합 중(ㅅ → 서 → 서울)
                // 마지막 글자가 바뀔 때 다시 튀지 않는 효과도 있다.
                key={index}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.22,
                  ease: 'easeOut',
                  delay: Math.max(index - appendStartIndex, 0) * STAGGER_SECONDS,
                }}
                style={{ transformOrigin: 'bottom' }}
                className="inline-block"
              >
                {/* inline-block으로 감싸면 보통 공백은 폭이 사라져,
                    줄바꿈 없는 공백으로 바꿔 자리를 남긴다. */}
                {character === ' ' ? ' ' : character}
              </motion.span>
            ))}
          </span>
        </h2>
      ) : null}
    </section>
  );
}

export default EmptyFolderPreview;
