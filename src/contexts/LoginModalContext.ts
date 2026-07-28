import { createContext } from 'react';

export interface LoginModalContextValue {
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

export const LoginModalContext = createContext<LoginModalContextValue | null>(
  null
);
