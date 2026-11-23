import { regionCities } from '../../../constants/regions';
import { regionCityImages } from '../../../constants/regionImages';

// 지역 소상공인 페이지(6336:75105)의 지역 원형 줄과 같은 크기·간격.
const CIRCLE_SIZE = 128;

interface HomeRegionStripProps {
  readonly onSelect: (regionName: string) => void;
}

/** 지역 원형 사진 줄 — 폭을 넘치면 가로로 스크롤하고, 누르면 지역 정보로 간다. */
function HomeRegionStrip({ onSelect }: HomeRegionStripProps) {
  return (
    <ul
      aria-label="지역 바로가기"
      className="flex [scrollbar-width:none] gap-[36px] overflow-x-auto p-[4px] [&::-webkit-scrollbar]:hidden"
    >
      {regionCities.map((city) => (
        <li key={city.id} className="shrink-0">
          <button
            type="button"
            onClick={() => onSelect(city.name)}
            aria-label={`${city.name} 지역 정보`}
            style={{ width: CIRCLE_SIZE, height: CIRCLE_SIZE }}
            className="bg-gray-2 relative block overflow-hidden rounded-full"
          >
            <img
              src={regionCityImages[city.id]}
              alt=""
              draggable={false}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <span aria-hidden="true" className="absolute inset-0 bg-black/20" />
            <span className="relative text-[24px] font-semibold text-white">
              {city.name}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export default HomeRegionStrip;
