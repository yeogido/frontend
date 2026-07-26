export interface DetailDescriptionCardProps {
  readonly title: string;
  readonly content: string;
  readonly className?: string;
}

export function DetailDescriptionCard({
  title,
  content,
  className = '',
}: DetailDescriptionCardProps) {
  return (
    <article className={`bg-main-2 rounded-[14px] px-4 py-3.5 ${className}`}>
      <h2 className="text-[12px] leading-none font-bold text-main-5">
        {title}
      </h2>
      <p className="mt-2 text-[12px] leading-[18px] font-normal text-gray-4 break-keep whitespace-pre-line">
        {content}
      </p>
    </article>
  );
}

export default DetailDescriptionCard;
