import addIcon from '../../../assets/icons/material-symbols_add-2-rounded.svg';
import heroBackground from '../../../assets/images/back.svg';
import { useGlobalScale } from '../../../hooks/useGlobalScale';
import { APP_HEADER_HEIGHT } from '../../../constants/layout';

// Figma 390 디자인 기준 리터럴 px. back.svg 자체가 390 폭으로 만들어져
// 있어(페이지 좌우 여백 24px을 감안한 342 폭이 아니라) 페이지 패딩 밖으로
// 빼서 화면 끝까지 꽉 채운다 — RegionHero처럼 안쪽에 넣으면 이미지 좌우가
// 잘리거나 배경 패턴이 틀어진다.
// Figma 실측: 버튼 하단~사진 끝 간격이 63px이 되도록 히어로 전체 높이를
// 줄임(버튼 하단은 아래 BUTTON_TOP 기준 160 정도 → 160+63=223).
const HERO_HEIGHT = 223;
// 사진 자체의 아래쪽이 화면 정중앙 기준 원의 일부처럼 크게 휘어지도록,
// 양쪽 아래 모서리에 같은 타원형 border-radius를 준다(가로 50%씩 만나서
// 폭 전체에 걸친 하나의 대칭 곡선이 되고, 제일 깊게 파이는 지점이
// 정확히 가운데(x=195)에 온다). 버튼이 왼쪽에 있어(x:24~123) 이 값을
// 키우는 데 한계가 있다 — 버튼의 가장 안쪽(오른쪽) 끝(x=123)에서도
// 곡선이 버튼 아래를 침범하지 않는 최댓값이 대략 65 정도라 60으로 뒀다.
const HERO_BOTTOM_CURVE = 60;
// Header가 이 페이지에서만 맨 위일 때 투명해지는데(Header.tsx의
// TRANSPARENT_HEADER_PATHS), 그 투명한 영역 뒤로 사진이 그대로 이어져
// 보이도록 히어로를 헤더 높이만큼 끌어올려 헤더 아래에 겹치게 한다 —
// 로고는 이제 헤더 쪽 것 하나만 보이면 되므로 여기서 따로 그리지 않는다.
const TEXT_LEFT = 24;
// Figma 실측(레드라인): 로고 아래~텍스트 상단 간격 32px, 텍스트는 헤더
// 바로 아래(사진 위쪽)에 붙어있고 버튼 아래로 사진 여백이 많이 남는
// 구조 — 기존에 bottom 기준으로 텍스트를 사진 하단 가까이 두던 것을
// top 기준으로 바꿔 헤더 바로 아래에 붙인다.
const TEXT_TOP = 80;
const TITLE_SIZE = 16;
const TITLE_LINE_HEIGHT = 19;
const TEXT_HEIGHT = TITLE_LINE_HEIGHT * 2;
const BUTTON_LEFT = 24;
// Figma 실측: 텍스트 하단~버튼 상단 간격 12px.
const BUTTON_TOP = TEXT_TOP + TEXT_HEIGHT + 12;
const BUTTON_GAP = 4;
const BUTTON_PADDING_X = 12;
const BUTTON_PADDING_Y = 8;
// Figma 실측: radius 999(완전히 둥근 알약 모양).
const BUTTON_RADIUS = 999;
const BUTTON_TEXT_SIZE = 12;
const BUTTON_LINE_HEIGHT = 14;
const ICON_SIZE = 16;

interface LocalCourseHeroProps {
  onCreateClick: () => void;
}

function LocalCourseHero({ onCreateClick }: LocalCourseHeroProps) {
  const scale = useGlobalScale();

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        height: HERO_HEIGHT * scale,
        marginTop: -(APP_HEADER_HEIGHT * scale),
        borderRadius: `0 0 50% 50% / 0 0 ${HERO_BOTTOM_CURVE * scale}px ${HERO_BOTTOM_CURVE * scale}px`,
      }}
      aria-label="우리동네 추천 코스"
    >
      <img
        src={heroBackground}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* 사진 위 텍스트 가독성 확보용 어둡게 처리 — RegionHero와 동일한 접근. */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />

      <h2
        className="absolute font-semibold whitespace-nowrap text-white"
        style={{
          left: TEXT_LEFT * scale,
          top: TEXT_TOP * scale,
          fontSize: TITLE_SIZE * scale,
          lineHeight: `${TITLE_LINE_HEIGHT * scale}px`,
        }}
      >
        내가 아는 숨은 명소를
        <br />
        다른 여행자에게 소개해보세요!
      </h2>

      <button
        type="button"
        onClick={onCreateClick}
        className="bg-main-5 text-pure-white absolute inline-flex items-center justify-center font-semibold whitespace-nowrap transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        style={{
          left: BUTTON_LEFT * scale,
          top: BUTTON_TOP * scale,
          gap: BUTTON_GAP * scale,
          borderRadius: BUTTON_RADIUS * scale,
          paddingLeft: BUTTON_PADDING_X * scale,
          paddingRight: BUTTON_PADDING_X * scale,
          paddingTop: BUTTON_PADDING_Y * scale,
          paddingBottom: BUTTON_PADDING_Y * scale,
          fontSize: BUTTON_TEXT_SIZE * scale,
          lineHeight: `${BUTTON_LINE_HEIGHT * scale}px`,
        }}
        aria-label="코스 만들기"
      >
        <span
          className="relative"
          style={{ width: ICON_SIZE * scale, height: ICON_SIZE * scale }}
          aria-hidden="true"
        >
          <img
            src={addIcon}
            alt=""
            className="absolute inset-0 h-full w-full [filter:brightness(0)_invert(1)]"
          />
        </span>
        코스 만들기
      </button>
    </section>
  );
}

export default LocalCourseHero;
