interface OverviewCardProps {
  overview: string;
}

function OverviewCard({ overview }: OverviewCardProps) {
  return (
    <section>
      <article className="rounded-xl border border-gray-2 bg-main-2 px-5 py-4">
        <h2 className="text-[16px] font-bold leading-none text-main-5">
          코스 한눈에 보기
        </h2>

        <p className="mt-3 text-[14px] font-medium leading-6 text-gray-5">
          {overview}
        </p>
      </article>
    </section>
  );
}

export default OverviewCard;
