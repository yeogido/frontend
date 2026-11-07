import NicknameAvatar, {
  type NicknameAvatarColor,
} from '../../../../components/common/NicknameAvatar';

export interface TravelRecordMember {
  id: string;
  name: string;
  color: NicknameAvatarColor;
}

interface TravelRecordMembersProps {
  members: readonly TravelRecordMember[];
}

function TravelRecordMembers({ members }: TravelRecordMembersProps) {
  return (
    <ul aria-label="앨범 참여자" className="isolate flex -space-x-2">
      {members.map((member, index) => (
        <li
          key={member.id}
          className="relative"
          style={{ zIndex: members.length - index }}
        >
          <NicknameAvatar name={member.name} color={member.color} size={32} />
        </li>
      ))}
    </ul>
  );
}

export default TravelRecordMembers;
