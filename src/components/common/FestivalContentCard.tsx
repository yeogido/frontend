import ContentCard from './ContentCard';
import EditableContentCard from './EditableContentCard';
import type { TagType } from './TagChip';

export interface FestivalContentCardProps {
  image: string | null;
  title: string;
  startDate: string;
  endDate: string;
  regionName: string;
  tags: TagType[];
  className?: string;
  isAdmin: boolean;
  liked: boolean;
  onClick: () => void;
  onLikeClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

/** 행사 카드 — 관리자면 좋아요 대신 같은 자리에 수정/삭제 메뉴를 띄운다. */
function FestivalContentCard({
  image,
  title,
  startDate,
  endDate,
  regionName,
  tags,
  className,
  isAdmin,
  liked,
  onClick,
  onLikeClick,
  onEdit,
  onDelete,
}: FestivalContentCardProps) {
  const firstInfo = `${startDate} ~ ${endDate}`;

  return isAdmin ? (
    <EditableContentCard
      image={image}
      title={title}
      firstInfo={firstInfo}
      secondInfo={regionName}
      tags={tags}
      className={className}
      onClick={onClick}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  ) : (
    <ContentCard
      image={image}
      title={title}
      firstInfo={firstInfo}
      secondInfo={regionName}
      tags={tags}
      liked={liked}
      className={className}
      onClick={onClick}
      onLikeClick={onLikeClick}
    />
  );
}

export default FestivalContentCard;
