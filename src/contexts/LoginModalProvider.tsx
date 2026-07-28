import {
  useCallback,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { useNavigate } from 'react-router-dom';

import LoginRequiredModal from '../components/common/LoginRequiredModal';
import { LoginModalContext } from './LoginModalContext';

export function LoginModalProvider({ children }: PropsWithChildren) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const navigate = useNavigate();

  const openLoginModal = useCallback(() => {
    setIsLoginModalOpen(true);
  }, []);

  const closeLoginModal = useCallback(() => {
    setIsLoginModalOpen(false);
  }, []);

  const handleLogin = useCallback(() => {
    closeLoginModal();
    navigate('/login');
  }, [closeLoginModal, navigate]);

  const value = useMemo(
    () => ({ isLoginModalOpen, openLoginModal, closeLoginModal }),
    [closeLoginModal, isLoginModalOpen, openLoginModal]
  );

  return (
    <LoginModalContext.Provider value={value}>
      {children}
      <LoginRequiredModal
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
        onLogin={handleLogin}
      />
    </LoginModalContext.Provider>
  );
}
