import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  ContentCard,
  ContentCardSkeleton,
  SectionHeader,
} from '../../../components/common';

import { useGlobalScale } from '../../../hooks/useGlobalScale';
import { useLoginModal } from '../../../hooks/useLoginModal';
import { useAuthStore } from '../../../store/auth.store';
import { buildFestivalDetailPath } from '../../../utils/routes';

const SECTION_MARGIN_TOP = 32;
const SECTION_PADDING_X = 24;
const LIST_MARGIN_TOP = 16;
const CARD_GAP = 16;

interface Festival {
  id: number;
  image: string;
  title: string;
  firstInfo: string;
  secondInfo: string;
  tags: ('summer' | 'nature' | 'experience' | 'bakery')[];
  liked: boolean;
}

function FestivalSection() {
  const isLoading = false;
  // const isLoading = true; // 스켈레톤 확인용

  const navigate = useNavigate();
  const scale = useGlobalScale();
  const isLoggedIn = useAuthStore((state) => state.isAuthenticated);
  const { openLoginModal } = useLoginModal();

  const [festivals, setFestivals] = useState<Festival[]>([
    {
      id: 1,
      image: '',
      title: '양평수박축제',
      firstInfo: '2026.07 ~ 2026.07',
      secondInfo: '경기도 양평군',
      tags: ['summer', 'nature', 'experience'],
      liked: false,
    },
    {
      id: 2,
      image: '',
      title: '양평수박축제',
      firstInfo: '2026.07 ~ 2026.07',
      secondInfo: '경기도 양평군',
      tags: ['summer', 'bakery', 'experience'],
      liked: true,
    },
  ]);

  const handleLikeClick = (festivalId: number) => {
    if (!isLoggedIn) {
      openLoginModal();
      return;
    }

    setFestivals((prev) =>
      prev.map((festival) =>
        festival.id === festivalId
          ? {
              ...festival,
              liked: !festival.liked,
            }
          : festival,
      ),
    );

    // TODO: 좋아요 API 연동
  };

  return (
    <section style={{ marginTop: SECTION_MARGIN_TOP * scale }}>
        <div
          style={{
            paddingLeft: SECTION_PADDING_X * scale,
            paddingRight: SECTION_PADDING_X * scale,
          }}
        >
          <SectionHeader
            title="진행 중인 행사"
            actionText="전체보기"
            onActionClick={() => navigate('/festival/search')}
          />
        </div>

        <div
          style={{
            marginTop: LIST_MARGIN_TOP * scale,
            paddingLeft: SECTION_PADDING_X * scale,
            paddingRight: SECTION_PADDING_X * scale,
          }}
        >
          <div className="overflow-x-auto pb-2">
            <div
              className="flex min-w-max"
              style={{ gap: CARD_GAP * scale }}
            >
              {isLoading ? (
                <>
                  <ContentCardSkeleton />
                  <ContentCardSkeleton />
                </>
              ) : (
                <>
                  {festivals.map((festival) => (
                    <ContentCard
                      key={festival.id}
                      image={festival.image}
                      title={festival.title}
                      firstInfo={festival.firstInfo}
                      secondInfo={festival.secondInfo}
                      tags={festival.tags}
                      liked={isLoggedIn && festival.liked}
                      onClick={() =>
                        navigate(buildFestivalDetailPath(festival.id))
                      }
                      onLikeClick={() =>
                        handleLikeClick(festival.id)
                      }
                    />
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
    </section>
  );
}

export default FestivalSection;
