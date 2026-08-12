/**
 * 연도 선택 드롭다운이 놓일 자리.
 *
 * 연도 목록은 기록을 불러온 뒤에야 정해져서 로딩 중에는 드롭다운이 그려지지
 * 않는데, 그러면 아래 폴더 목록이 통째로 위로 올라와 있다가 로딩이 끝나는
 * 순간 내려온다. 같은 크기(`mt-4 h-8 w-[86px]`)의 자리를 미리 잡아 둔다.
 */
function TravelYearDropdownSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="mt-4 h-8 w-[86px] shrink-0 animate-pulse rounded-full bg-[#EAEAEA]"
    />
  );
}

export default TravelYearDropdownSkeleton;
