interface OverviewCardProps {
  overview: string;
}

function OverviewCard({ overview }: OverviewCardProps) {
  return (
    <section className="mt-4 px-7 sm:px-6">
      <article className="bg-main-2 rounded-xl px-4 py-4 sm:px-5">
        <h2 className="text-main-5 text-[13px] leading-none font-bold">
          코스 한눈에 보기
        </h2>

        <p className="text-gray-5 mt-2 text-[12px] leading-[18px] font-medium break-keep sm:text-[13px] sm:leading-5">
          {overview}
        </p>
      </article>
    </section>
  );
}

export default OverviewCard;
