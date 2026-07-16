import { SearchBar } from '../../../components/common';
import { yeogidoCourseSearchSuggestions } from '../../../constants/yeogidoCourseSearch';

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
