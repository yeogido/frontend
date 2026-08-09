import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getApiErrorMessage } from '../../apis/common';
import { ResponsivePageShell } from '../../components/layout';
import { useToast } from '../../components/toast';
import { useAuth } from '../../hooks/useAuth';
import { useGlobalScale } from '../../hooks/useGlobalScale';
import { useMyBusinesses } from '../../hooks/useMyBusinesses';
import { useDeleteMyAccount, useMyProfile } from '../../hooks/useMyProfile';
import { useRegion } from '../../hooks/useRegions';
import { useAuthStore } from '../../store/auth.store';
import {
  ProfileDetailSection,
  ProfilePhotoEditor,
  ProfileSummary,
  WithdrawalDialog,
} from './components';

function ProfilePage() {
  const scale = useGlobalScale();
  const { userId, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const { data: profile } = useMyProfile();
  const deleteMyAccount = useDeleteMyAccount();
  const [isWithdrawalDialogOpen, setIsWithdrawalDialogOpen] = useState(false);
  const { data } = useMyBusinesses(isAuthenticated);

  // 인증 사업장이 없으면 빈 배열이 정상 응답이다(404가 아니다).
  // 목록은 businessInfoId 최신순이라 첫 항목이 가장 최근 인증 사업장이다.
  const businesses = data ?? [];
  const primaryBusiness = businesses[0] ?? null;
  const name =
    primaryBusiness?.representativeName ??
    profile?.name ??
    (userId ? `회원 #${userId}` : '회원');
  // GET /regions 목록의 name은 축약형("서울")이라, 풀네임("서울특별시")이
  // 있는 단건 상세(GET /regions/{id})를 regionId로 조회해서 우선 쓴다.
  // 아직 로딩 중이거나 목록에 없으면 서버가 준 region 문자열로 대체한다.
  const { data: selectedRegionDetail } = useRegion(profile?.regionId);
  const regionName = selectedRegionDetail?.fullName ?? profile?.region;

  const handleWithdrawalConfirm = async () => {
    try {
      await deleteMyAccount.mutateAsync();
      setIsWithdrawalDialogOpen(false);
      clearAuth();
      navigate('/login');
    } catch (error) {
      showToast(getApiErrorMessage(error, '회원 탈퇴에 실패했어요.'));
    }
  };

  return (
    <ResponsivePageShell
      mode="main-layout"
      bottomPadding={40}
      className="bg-[#f1f1f1]"
    >
      <section
        className="flex flex-col items-center"
        style={{ paddingTop: 32 * scale }}
      >
        <ProfilePhotoEditor
          scale={scale}
          initialPhotoUrl={profile?.profileImageUrl}
        />
        <ProfileSummary
          name={name}
          role={profile?.role}
          scale={scale}
          onEdit={() => navigate('/profile/edit')}
        />
        <ProfileDetailSection
          businesses={businesses}
          role={profile?.role}
          email={profile?.email ?? '등록된 이메일 정보가 없어요'}
          region={regionName ?? '등록된 지역 정보가 없어요'}
          birthYear={
            profile?.birthYear
              ? String(profile.birthYear)
              : '등록된 출생 연도 정보가 없어요'
          }
          scale={scale}
        />
        {profile && profile.role !== 'ADMIN' && (
          <button
            type="button"
            onClick={() => setIsWithdrawalDialogOpen(true)}
            className="flex w-full items-center justify-center rounded-xl bg-[#e4e4e4] font-semibold text-[#7f7f7f]"
            style={{
              marginTop: 34 * scale,
              height: 52 * scale,
              paddingInline: 10 * scale,
              fontSize: 18 * scale,
              lineHeight: `${21 * scale}px`,
            }}
          >
            회원 탈퇴하기
          </button>
        )}
      </section>
      <WithdrawalDialog
        isOpen={isWithdrawalDialogOpen}
        isPending={deleteMyAccount.isPending}
        onConfirm={() => void handleWithdrawalConfirm()}
        onCancel={() => setIsWithdrawalDialogOpen(false)}
      />
    </ResponsivePageShell>
  );
}

export default ProfilePage;