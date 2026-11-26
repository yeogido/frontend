import NicknameAvatar, {
  type NicknameAvatarColor,
} from '../../../../components/common/NicknameAvatar';
import ProfileAvatar from '../../../../components/common/ProfileAvatar';

export interface TravelRecordMember {
  id: string;
  name: string;
  color: NicknameAvatarColor;
  profileImageUrl?: string | null;
}

interface TravelRecordMembersProps {
  members: readonly TravelRecordMember[];
  desktop?: boolean;
}

function TravelRecordMembers({
  members,
  desktop = false,
}: TravelRecordMembersProps) {
  return (
    <ul
      aria-label="앨범 참여자"
      className={`isolate flex ${desktop ? '-space-x-3' : '-space-x-2'}`}
    >
      {members.map((member, index) => (
        <li
          key={member.id}
          className="relative"
          style={{ zIndex: members.length - index }}
        >
          {member.profileImageUrl ? (
            <ProfileAvatar src={member.profileImageUrl} size={desktop ? 60 : 32} />
          ) : (
            <NicknameAvatar
              name={member.name}
              color={member.color}
              size={desktop ? 60 : 32}
            />
          )}
        </li>
      ))}
    </ul>
  );
}

export default TravelRecordMembers;
