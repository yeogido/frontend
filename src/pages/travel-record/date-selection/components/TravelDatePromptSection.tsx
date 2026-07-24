function TravelDatePromptSection() {
  return (
    <section className="absolute top-[100px] left-6 flex w-[220px] flex-col gap-3">
      <h1 className="text-[32px] leading-none font-semibold text-[#1c1c1c]">
        언제
        <br />
        다녀오셨나요?
      </h1>
      <p className="text-[14px] leading-none text-[#505050]">
        여행한 날짜를 선택해 주세요
      </p>
    </section>
  );
}

export default TravelDatePromptSection;
