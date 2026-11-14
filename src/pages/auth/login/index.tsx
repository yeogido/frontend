import { LoginForm } from './components';
import { useLoginPage } from './hooks/useLoginPage';

function LoginPage() {
  const {
    submitError,
    handleLogin,
    handleKakaoLogin,
    isKakaoLoading,
    handleNaverLogin,
    isNaverLoading,
    infoMessage,
    defaultEmail,
  } = useLoginPage();

  return (
    <LoginForm
      onSubmit={handleLogin}
      submitError={submitError}
      onKakaoLogin={handleKakaoLogin}
      isKakaoLoading={isKakaoLoading}
      infoMessage={infoMessage}
      defaultEmail={defaultEmail}
      onNaverLogin={handleNaverLogin}
      isNaverLoading={isNaverLoading}
    />
  );
}

export default LoginPage;
