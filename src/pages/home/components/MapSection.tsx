import { Map } from '../map/components';

function MapSection() {
  return (
    <section className="mx-6 mt-4">
      <div className="relative h-[342px] overflow-hidden rounded-xl bg-[#F9F9F9]">
        <div className="h-full w-full">
          <Map />
        </div>

        <h2 className="absolute left-4 top-4 text-[18px] font-semibold leading-[100%] text-[#1C1C1C]">
          전국 지도
        </h2>

        <p className="absolute left-4 top-[41px] text-[10px] font-normal leading-[100%] text-[#7F7F7F]">
          지역을 클릭해서
          <br />
          다양한 정보를 확인해 보세요!
        </p>
      </div>
    </section>
  );
}

export default MapSection;