import { useGlobalScale } from '../../../hooks/useGlobalScale';

import YeogidoCourseList from '../components/YeogidoCourseList';

const PAGE_PADDING_X = 24;
const PAGE_PADDING_TOP = 12;
const PAGE_PADDING_BOTTOM = 40;
const TITLE_SIZE = 18;
const TITLE_LINE_HEIGHT = 22;
const DESCRIPTION_MARGIN_TOP = 5;
const DESCRIPTION_SIZE = 12;
const DESCRIPTION_LINE_HEIGHT = 17;
const FILTER_MARGIN_TOP = 15;

function YeogidoCoursePopularPage() {
  const scale = useGlobalScale();

  return (
    <section
      className="mx-auto flex min-h-screen w-full flex-col"
      style={{
        paddingLeft: PAGE_PADDING_X * scale,
        paddingRight: PAGE_PADDING_X * scale,
        paddingTop: PAGE_PADDING_TOP * scale,
        paddingBottom: PAGE_PADDING_BOTTOM * scale,
      }}
    >
      <div>
        <h1
          className="font-semibold text-black"
          style={{
            fontSize: TITLE_SIZE * scale,
            lineHeight: `${TITLE_LINE_HEIGHT * scale}px`,
          }}
        >
          인기 추천 코스
        </h1>
        <p
          className="text-gray-4 font-normal"
          style={{
            marginTop: DESCRIPTION_MARGIN_TOP * scale,
            fontSize: DESCRIPTION_SIZE * scale,
            lineHeight: `${DESCRIPTION_LINE_HEIGHT * scale}px`,
          }}
        >
          여행자들이 가장 많이 찾는 추천 코스
        </p>
      </div>
      {/* 이 페이지는 "인기 추천 코스"라 정렬 기본값도 인기순이어야 한다. */}
      <YeogidoCourseList
        initialSort="인기순"
        filterMarginTop={FILTER_MARGIN_TOP}
      />
    </section>
  );
}

export default YeogidoCoursePopularPage;
