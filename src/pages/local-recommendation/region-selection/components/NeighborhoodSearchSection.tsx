import YeogidoCourseSearchBar from '../../../yeogido-course/components/YeogidoCourseSearchBar';

interface NeighborhoodSearchSectionProps {
  onSearch: (query: string) => void;
}

function NeighborhoodSearchSection({
  onSearch,
}: NeighborhoodSearchSectionProps) {
  return (
    <section aria-labelledby="neighborhood-heading">
      <h2
        id="neighborhood-heading"
        className="text-[22px] leading-[1.35] font-bold"
      >
        어디를
        <br />
        추천하시나요?
      </h2>
      <p className="text-gray-4 mt-3 text-sm leading-5">
        코스를 등록할 지역을 검색하거나 선택해주세요.
      </p>

      <YeogidoCourseSearchBar
        className="mt-7 !max-w-none"
        onSearch={onSearch}
      />
    </section>
  );
}

export default NeighborhoodSearchSection;
