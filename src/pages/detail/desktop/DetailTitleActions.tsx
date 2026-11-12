import heart from '../../../assets/icons/heart.svg';
import oheart from '../../../assets/icons/oheart.svg';
import shareIcon from '../../../assets/icons/share.svg';
import ReviewActionMenu from '../../../components/common/ReviewActionMenu';

// Figma 1440 데스크톱 시안 기준 리터럴 px.
const ICON_SIZE = 24;

interface DetailTitleActionsProps {
  /** 관리 권한이 있으면 좋아요 대신 수정·삭제 메뉴를 보여준다. */
  readonly manage?: {
    readonly label: string;
    readonly onEdit: () => void;
    readonly onDelete: () => void;
  };
  readonly like?: {
    readonly active: boolean;
    readonly label: string;
    readonly onClick: () => void;
  };
  readonly shareLabel: string;
  readonly onShare: () => void;
}

/** 상세 화면 태그 줄 오른쪽의 좋아요(또는 관리 메뉴)와 공유 버튼. */
function DetailTitleActions({
  manage,
  like,
  shareLabel,
  onShare,
}: DetailTitleActionsProps) {
  return (
    <>
      {manage ? (
        <ReviewActionMenu
          onEditClick={manage.onEdit}
          onDeleteClick={manage.onDelete}
          triggerClassName=""
          triggerSize={ICON_SIZE}
          ariaLabel={manage.label}
        />
      ) : like ? (
        <button
          type="button"
          aria-label={
            like.active ? `${like.label} 좋아요 취소` : `${like.label} 좋아요`
          }
          aria-pressed={like.active}
          onClick={like.onClick}
        >
          <img
            src={like.active ? oheart : heart}
            alt=""
            draggable={false}
            style={{ width: ICON_SIZE, height: ICON_SIZE }}
          />
        </button>
      ) : null}

      <button type="button" aria-label={shareLabel} onClick={onShare}>
        <img
          src={shareIcon}
          alt=""
          draggable={false}
          style={{ width: ICON_SIZE, height: ICON_SIZE }}
        />
      </button>
    </>
  );
}

export default DetailTitleActions;
