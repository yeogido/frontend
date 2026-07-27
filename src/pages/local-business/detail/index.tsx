import { useParams } from 'react-router-dom';

import { localBusinessMockData } from '../../../apis/localBusiness';
import { useGlobalScale } from '../../../hooks/useGlobalScale';

import {
  DetailHeroImage,
  DetailIntroCard,
  DetailMapPlaceholder,
  DetailRelatedPostCard,
  DetailTitleSection,
} from './components';
import { DetailAuthorCard, DetailInfoCard } from '../../detail/components';

const PAGE_PADDING_X = 24;
const PAGE_PADDING_TOP = 16; // 추정값, 실측 필요
const PAGE_PADDING_BOTTOM = 40; // 추정값, 실측 필요
const SECTION_GAP = 16; // 추정값, 실측 필요

// TODO: BusinessItem 타입에 영업시간/전화번호/웹사이트 필드가 아직 없어서
// 임시 mock 값으로 채움. 실제 데이터 연동 시 타입 확장 필요 - 별도 이슈
const MOCK_HOURS = '평일 10:00 - 24:00';
const MOCK_PHONE = '0507-1470-1661';
const MOCK_WEBSITE = '@yeogido123';

function LocalBusinessDetailPage() {
  const { id } = useParams<{ id: string }>();
  const scale = useGlobalScale();

  const business =
    localBusinessMockData.find((item) => item.id === id) ??
    localBusinessMockData[0];

  // TODO: "관련 게시물" 예시로 목업 첫 항목을 그대로 사용 - 실제 연관 로직 필요
  const relatedPost = localBusinessMockData[0];

  return (
    <div className="mx-auto flex min-h-screen w-full flex-col bg-white">
      <DetailHeroImage imageUrl={business.image} title={business.title} />

      <div
        className="flex flex-col"
        style={{
          paddingLeft: PAGE_PADDING_X * scale,
          paddingRight: PAGE_PADDING_X * scale,
          paddingTop: PAGE_PADDING_TOP * scale,
          paddingBottom: PAGE_PADDING_BOTTOM * scale,
          gap: SECTION_GAP * scale,
        }}
      >
        <DetailTitleSection title={business.title} tags={business.tags} />

        <DetailIntroCard description={business.description} />

        <DetailInfoCard
          address={business.location}
          hours={MOCK_HOURS}
          phone={MOCK_PHONE}
          website={MOCK_WEBSITE}
        />

        <DetailMapPlaceholder />

        <DetailRelatedPostCard
          imageUrl={relatedPost.image}
          title={relatedPost.title}
          address={relatedPost.location}
          hours={MOCK_HOURS}
        />

        {/* DetailAuthorCard가 자체 상하 24px 여백을 가지므로 부모 flex gap을 상쇄 */}
        <div style={{ marginTop: -SECTION_GAP * scale }}>
          <DetailAuthorCard
            avatarUrl={business.image}
            name={business.author}
            date={business.date}
          />
        </div>
      </div>
    </div>
  );
}

export default LocalBusinessDetailPage;
