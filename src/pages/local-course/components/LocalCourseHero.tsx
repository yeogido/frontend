import addIcon from '../../../assets/icons/material-symbols_add-2-rounded.svg';
import heroBackground from '../../../assets/images/back.svg';
import { useGlobalScale } from '../../../hooks/useGlobalScale';
import { APP_HEADER_HEIGHT } from '../../../constants/layout';

// Figma 390 디자인 기준 리터럴 px. back.svg 자체가 390 폭으로 만들어져
// 있어(페이지 좌우 여백 24px을 감안한 342 폭이 아니라) 페이지 패딩 밖으로
// 빼서 화면 끝까지 꽉 채운다 — RegionHero처럼 안쪽에 넣으면 이미지 좌우가
// 잘리거나 배경 패턴이 틀어진다.
// Figma 화면에서 보이는 히어로 하단의 중앙 지점. 검색바가 31px 겹친다.
const HERO_HEIGHT = 277;
// Figma는 화면보다 큰 라운드 프레임을 화면 밖에 배치한 뒤 잘라 낸다.
// 이 프레임의 일부만 보이면서 하단 경계가 사선처럼 나타난다.
const HERO_FRAME_WIDTH = 646;
const HERO_FRAME_HEIGHT = 450;
const HERO_FRAME_LEFT = -128;
const HERO_FRAME_TOP = -173;
const HERO_FRAME_RADIUS = 990;
const HERO_FRAME_IMAGE_LEFT = 128;
const HERO_FRAME_IMAGE_TOP = 173;
// Header가 이 페이지에서만 맨 위일 때 투명해지는데(Header.tsx의
// TRANSPARENT_HEADER_PATHS), 그 투명한 영역 뒤로 사진이 그대로 이어져
// 보이도록 히어로를 헤더 높이만큼 끌어올려 헤더 아래에 겹치게 한다 —
// 로고는 이제 헤더 쪽 것 하나만 보이면 되므로 여기서 따로 그리지 않는다.
const TEXT_LEFT = 24;
// Figma 실측(레드라인): 로고 아래~텍스트 상단 간격 32px, 텍스트는 헤더
// 원본 프레임의 y=305를 화면 절단 좌표(y=-173)에 맞춰 환산한 값이다.
const TEXT_TOP = 132;
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
      }}
      aria-label="우리동네 추천 코스"
    >
      <div
        className="absolute overflow-hidden"
        style={{
          width: HERO_FRAME_WIDTH * scale,
          height: HERO_FRAME_HEIGHT * scale,
          left: HERO_FRAME_LEFT * scale,
          top: HERO_FRAME_TOP * scale,
          borderRadius: HERO_FRAME_RADIUS * scale,
        }}
      >
        <img
          src={heroBackground}
          alt=""
          aria-hidden="true"
          className="absolute object-cover"
          style={{
            width: 390 * scale,
            height: HERO_HEIGHT * scale,
            left: HERO_FRAME_IMAGE_LEFT * scale,
            top: HERO_FRAME_IMAGE_TOP * scale,
          }}
        />

        {/* 사진 위 텍스트 가독성 확보용 어둡게 처리 — RegionHero와 동일한 접근. */}
        <div
          className="absolute bg-gradient-to-t from-black/55 via-black/5 to-transparent"
          style={{
            width: 390 * scale,
            height: HERO_HEIGHT * scale,
            left: HERO_FRAME_IMAGE_LEFT * scale,
            top: HERO_FRAME_IMAGE_TOP * scale,
          }}
        />
      </div>

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
