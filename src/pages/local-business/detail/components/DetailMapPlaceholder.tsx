import { useGlobalScale } from '../../../../hooks/useGlobalScale';

// 추정값, 실측 필요 (지도 미연동 상태의 자리 높이)
const MAP_PLACEHOLDER_HEIGHT = 240;

// 지도 연동은 이번 작업 범위 밖 - 자리만 확보해둠, 별도 이슈에서 실제 지도 연결 예정
function DetailMapPlaceholder() {
  const scale = useGlobalScale();

  return (
    <div
      className="w-full rounded-xl bg-gray-2"
      style={{ height: MAP_PLACEHOLDER_HEIGHT * scale }}
      role="img"
      aria-label="지도 (준비 중)"
    />
  );
}

export default DetailMapPlaceholder;
