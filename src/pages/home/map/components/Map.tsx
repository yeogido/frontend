import PolygonLayer from './PolygonLayer';

function Map() {
  return (
    <svg
      className="h-full w-full"
      viewBox="0 0 400 600"
      preserveAspectRatio="xMidYMid meet"
    >
      <PolygonLayer />
    </svg>
  );
}

export default Map;