function MapSection() {
  return (
    <section className="mx-6 mt-4">
      <div className="relative h-[342px] overflow-hidden rounded-xl bg-[#F9F9F9]">
        {/* Map */}
        <div className="h-full w-full">
          {/* 지도 이미지가 들어갈 영역 */}
        </div>

        {/* Title */}
        <h2 className="absolute left-4 top-4 text-[18px] font-semibold leading-[100%] text-[#1C1C1C]">
          전국 지도
        </h2>

        {/* Description */}
        <p className="absolute left-4 top-[41px] text-[10px] font-normal leading-[100%] text-[#7F7F7F]">
          지역을 클릭해서
          <br />
          다양한 정보를 확인해 보세요!
        </p>

        {/* Zoom */}
        <div
          className="
            absolute
            bottom-4
            right-4
            flex
            items-center
            gap-[10px]
            rounded
            border
            border-[#D9D9D9]
            bg-white
            px-[5px]
            py-1
          "
        >
          <button
            type="button"
            className="flex h-6 w-6 items-center justify-center text-2xl"
          >
            −
          </button>

          <span className="text-base font-medium">
            5x
          </span>

          <button
            type="button"
            className="flex h-6 w-6 items-center justify-center text-2xl"
          >
            +
          </button>
        </div>
      </div>
    </section>
  );
}

export default MapSection;