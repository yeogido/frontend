import { SearchBar } from '../../../components/common';

const yeogidoCourseSearchSuggestions = [
  '강릉 혼자 여행 코스',
  '강릉 바다 산책 코스',
  '강릉 카페 투어',
  '부산 감성 여행',
  '부산 바다 코스',
  '제주 뚜벅이 여행',
  '제주 오름 산책',
  '순천 혼자 여행',
  '보령 바다 여행',
  '서촌 골목길 산책',
  '혼자 떠나는 여행',
  '가족과 함께하는 코스',
] as const;

interface YeogidoCourseSearchBarProps {
  initialQuery?: string;
  className?: string;
  onSearch?: (query: string) => void;
}

function YeogidoCourseSearchBar({
  initialQuery = '',
  className = '',
  onSearch,
}: YeogidoCourseSearchBarProps) {
  return (
    <SearchBar
      initialQuery={initialQuery}
      className={className}
      placeholder="코스명 또는 지역명을 검색해 주세요"
      label="코스명 또는 지역명 검색"
      suggestions={yeogidoCourseSearchSuggestions}
      onSearch={onSearch}
    />
  );
}

export default YeogidoCourseSearchBar;
